import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';
import { getJobWithTasks, isJobComplete } from '../models/job.js';
import { getAgent } from '../models/agent.js';
import { createLlmProvider } from '../llm/index.js';
import type { LlmProvider } from '../llm/types.js';
import type { RatingSystem } from '../models/types.js';
import { RATING_SYSTEMS } from '../models/evaluation.js';

export interface ReviewResult {
  job_id: string;
  original_prompt: string;
  review: string;
  evaluations?: Array<{
    agent_id: string;
    agent_name: string;
    trace_id: string;
    rating: string;
    comment: string;
  }>;
  reviewed_at: string;
}

function buildReviewSystemPrompt(ratingSystem?: RatingSystem): string {
  let base = `你是 HumanClaw 交付审查员。你的工作是审查碳基节点提交的所有任务交付物，生成整体审查报告。

审查要点：
1. 检查每个交付物是否满足原始任务要求
2. 如果交付物包含 GitHub URL（PR、commit、issue 等），分析其内容和质量
3. 指出潜在问题或改进建议
4. 给出整体完成度评分（1-10）和总结

输出格式：
- 使用 Markdown 格式
- 先给总结评分，再逐个分析每个子任务的交付质量`;

  if (ratingSystem) {
    const ratings = RATING_SYSTEMS[ratingSystem];
    const systemLabels: Record<RatingSystem, string> = {
      ali: '阿里绩效体系',
      letter: 'SABCD 等级',
      em: 'EM/MM 绩效体系',
    };
    base += `

同时，请为每个参与的碳基节点生成个人绩效评价。
使用「${systemLabels[ratingSystem]}」，可选评分为: ${ratings.join(' / ')}
在审查报告末尾，额外输出一个 JSON 块（用 \`\`\`json 包裹），格式如下：
\`\`\`json
[
  {
    "agent_id": "执行者ID",
    "trace_id": "任务追踪码",
    "rating": "评分",
    "comment": "一句话评语"
  }
]
\`\`\``;
  }

  return base;
}

function buildReviewUserPrompt(
  originalPrompt: string,
  tasks: Array<{
    trace_id: string;
    assignee_id: string;
    assignee_name: string;
    todo_description: string;
    result_data: unknown;
    weight?: number;
  }>
): string {
  let prompt = `原始需求: ${originalPrompt}\n\n`;

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    let resultText = '';
    if (t.result_data) {
      if (typeof t.result_data === 'string') {
        resultText = t.result_data;
      } else if (typeof t.result_data === 'object') {
        const rd = t.result_data as Record<string, unknown>;
        resultText = (rd.text as string) || JSON.stringify(rd, null, 2);
      } else {
        resultText = String(t.result_data);
      }
    }
    prompt += `--- 子任务 ${i + 1} ---\n`;
    prompt += `执行者: ${t.assignee_name} (${t.assignee_id})\n`;
    prompt += `追踪码: ${t.trace_id}\n`;
    prompt += `任务: ${t.todo_description}\n`;
    if (t.weight !== undefined && t.weight !== 1) {
      prompt += `任务权重: ${t.weight}\n`;
    }
    prompt += `交付物:\n${resultText}\n\n`;
  }

  prompt += '请审查以上所有交付物，生成审查报告。';
  return prompt;
}

function extractEvaluationJson(
  raw: string
): Array<{ agent_id: string; trace_id: string; rating: string; comment: string }> | undefined {
  // Try to extract JSON from the last code block
  const blocks = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/g);
  if (!blocks) return undefined;

  // Use the last JSON block (evaluation data is appended at the end)
  const lastBlock = blocks[blocks.length - 1];
  const jsonMatch = lastBlock.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (!jsonMatch) return undefined;

  try {
    const parsed = JSON.parse(jsonMatch[1].trim());
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Evaluation extraction is best-effort
  }
  return undefined;
}

export async function reviewJob(
  jobId: string,
  provider?: LlmProvider,
  db?: Database.Database,
  ratingSystem?: RatingSystem,
  taskWeights?: Record<string, number>
): Promise<ReviewResult> {
  const conn = db ?? getDb();

  const job = getJobWithTasks(jobId, conn);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  if (!isJobComplete(jobId, conn)) {
    const resolved = job.tasks.filter(t => t.status === 'RESOLVED').length;
    throw new Error(
      `Job 尚未全部完成: ${resolved}/${job.tasks.length} 个任务已交付`
    );
  }

  const llm = provider ?? createLlmProvider();

  const tasksWithNames = job.tasks.map(t => {
    const agent = getAgent(t.assignee_id, conn);
    return {
      trace_id: t.trace_id,
      assignee_id: t.assignee_id,
      assignee_name: agent?.name || t.assignee_id,
      todo_description: t.todo_description,
      result_data: t.result_data,
      weight: taskWeights?.[t.trace_id],
    };
  });

  const response = await llm.complete({
    messages: [
      { role: 'system', content: buildReviewSystemPrompt(ratingSystem) },
      {
        role: 'user',
        content: buildReviewUserPrompt(job.original_prompt, tasksWithNames),
      },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const result: ReviewResult = {
    job_id: jobId,
    original_prompt: job.original_prompt,
    review: response.content,
    reviewed_at: new Date().toISOString(),
  };

  // Extract evaluations if rating system was requested
  if (ratingSystem) {
    const evalData = extractEvaluationJson(response.content);
    if (evalData) {
      result.evaluations = evalData.map(e => {
        const agent = getAgent(e.agent_id, conn);
        return {
          ...e,
          agent_name: agent?.name || e.agent_id,
        };
      });
    }
  }

  return result;
}
