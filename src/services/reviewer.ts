import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';
import { getJobWithTasks, isJobComplete } from '../models/job.js';
import { createLlmProvider } from '../llm/index.js';
import type { LlmProvider } from '../llm/types.js';

export interface ReviewResult {
  job_id: string;
  original_prompt: string;
  review: string;
  reviewed_at: string;
}

function buildReviewSystemPrompt(): string {
  return `你是 HumanClaw 交付审查员。你的工作是审查碳基节点提交的所有任务交付物，生成整体审查报告。

审查要点：
1. 检查每个交付物是否满足原始任务要求
2. 如果交付物包含 GitHub URL（PR、commit、issue 等），分析其内容和质量
3. 指出潜在问题或改进建议
4. 给出整体完成度评分（1-10）和总结

输出格式：
- 使用 Markdown 格式
- 先给总结评分，再逐个分析每个子任务的交付质量`;
}

function buildReviewUserPrompt(
  originalPrompt: string,
  tasks: Array<{
    assignee_id: string;
    todo_description: string;
    result_data: unknown;
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
    prompt += `执行者: ${t.assignee_id}\n`;
    prompt += `任务: ${t.todo_description}\n`;
    prompt += `交付物:\n${resultText}\n\n`;
  }

  prompt += '请审查以上所有交付物，生成审查报告。';
  return prompt;
}

export async function reviewJob(
  jobId: string,
  provider?: LlmProvider,
  db?: Database.Database
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

  const response = await llm.complete({
    messages: [
      { role: 'system', content: buildReviewSystemPrompt() },
      {
        role: 'user',
        content: buildReviewUserPrompt(
          job.original_prompt,
          job.tasks.map(t => ({
            assignee_id: t.assignee_id,
            todo_description: t.todo_description,
            result_data: t.result_data,
          }))
        ),
      },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });

  return {
    job_id: jobId,
    original_prompt: job.original_prompt,
    review: response.content,
    reviewed_at: new Date().toISOString(),
  };
}
