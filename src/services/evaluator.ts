import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';
import { getJobWithTasks, isJobComplete } from '../models/job.js';
import { getAgent } from '../models/agent.js';
import {
  createEvaluation,
  deleteEvaluationsByJob,
  listEvaluationsByJob,
  listEvaluationsByAgent,
  RATING_SYSTEMS,
  validateRating,
} from '../models/evaluation.js';
import { createLlmProvider } from '../llm/index.js';
import type { LlmProvider } from '../llm/types.js';
import type { EvaluationRequest, EvaluationResult, Evaluation, RatingSystem } from '../models/types.js';

function generateEvalId(): string {
  return 'eval_' + Math.random().toString(36).substring(2, 10);
}

function buildEvalPrompt(
  originalPrompt: string,
  ratingSystem: RatingSystem,
  tasks: Array<{
    trace_id: string;
    assignee_id: string;
    assignee_name: string;
    todo_description: string;
    result_data: unknown;
    weight: number;
  }>
): string {
  const ratings = RATING_SYSTEMS[ratingSystem];
  const systemLabels: Record<RatingSystem, string> = {
    ali: '阿里绩效体系（3.25=不合格, 3.5=基本达标, 3.5+=达标, 3.75=优秀, 4.0=卓越）',
    letter: 'SABCD 等级（S=卓越, A=优秀, B=达标, C=待改进, D=不合格）',
    em: 'EM/MM 体系（EM+=远超预期, EM=超出预期, MM+=达标, MM=基本达标, MM-=不达标）',
  };

  let prompt = `原始需求: ${originalPrompt}\n\n`;
  prompt += `评分体系: ${systemLabels[ratingSystem]}\n`;
  prompt += `可选评分: ${ratings.join(' / ')}\n\n`;

  for (const t of tasks) {
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
    prompt += `--- 任务 ${t.trace_id} (权重: ${t.weight}) ---\n`;
    prompt += `执行者: ${t.assignee_name} (${t.assignee_id})\n`;
    prompt += `任务: ${t.todo_description}\n`;
    prompt += `交付物:\n${resultText}\n\n`;
  }

  prompt += `请为每个执行者的每个任务单独评分。严格输出 JSON 数组（不要输出其他内容）：
\`\`\`json
[
  {
    "agent_id": "执行者ID",
    "trace_id": "任务追踪码",
    "rating": "从 ${ratings.join('/')} 中选一个",
    "comment": "一句话评语，说明给此评分的原因"
  }
]
\`\`\``;

  return prompt;
}

function extractJson(raw: string): string {
  const codeBlockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  const arrayMatch = raw.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }
  return raw.trim();
}

export async function generateEvaluations(
  request: EvaluationRequest,
  provider?: LlmProvider,
  db?: Database.Database
): Promise<EvaluationResult> {
  const conn = db ?? getDb();

  const job = getJobWithTasks(request.job_id, conn);
  if (!job) {
    throw new Error(`Job not found: ${request.job_id}`);
  }

  if (!isJobComplete(request.job_id, conn)) {
    const resolved = job.tasks.filter(t => t.status === 'RESOLVED').length;
    throw new Error(
      `Job 尚未全部完成: ${resolved}/${job.tasks.length} 个任务已交付`
    );
  }

  // Delete existing evaluations for re-evaluation
  deleteEvaluationsByJob(request.job_id, conn);

  const llm = provider ?? createLlmProvider();

  const tasksWithInfo = job.tasks.map(t => {
    const agent = getAgent(t.assignee_id, conn);
    return {
      trace_id: t.trace_id,
      assignee_id: t.assignee_id,
      assignee_name: agent?.name || t.assignee_id,
      todo_description: t.todo_description,
      result_data: t.result_data,
      weight: request.task_weights?.[t.trace_id] ?? 1.0,
    };
  });

  const response = await llm.complete({
    messages: [
      {
        role: 'system',
        content: '你是一个客观公正的绩效评估专家。根据任务完成质量和交付物内容进行评分。',
      },
      {
        role: 'user',
        content: buildEvalPrompt(job.original_prompt, request.rating_system, tasksWithInfo),
      },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const jsonStr = extractJson(response.content);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('AI 返回的绩效评价无法解析为 JSON，请重试');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('AI 返回的不是有效的评价数组');
  }

  const evaluations: Evaluation[] = [];
  for (const item of parsed as Array<Record<string, unknown>>) {
    const agentId = String(item.agent_id || '');
    const traceId = String(item.trace_id || '');
    let rating = String(item.rating || '');
    const comment = String(item.comment || '');

    // Validate rating, use middle-tier default if invalid
    if (!validateRating(request.rating_system, rating)) {
      const ratings = RATING_SYSTEMS[request.rating_system];
      rating = ratings[Math.floor(ratings.length / 2)];
    }

    const weight = request.task_weights?.[traceId] ?? 1.0;

    const evaluation = createEvaluation({
      eval_id: generateEvalId(),
      job_id: request.job_id,
      agent_id: agentId,
      trace_id: traceId,
      rating_system: request.rating_system,
      rating,
      weight,
      comment,
    }, conn);

    evaluations.push(evaluation);
  }

  return {
    job_id: request.job_id,
    evaluations,
    generated_at: new Date().toISOString(),
  };
}

export function getPerformanceDashboard(
  agentId?: string,
  db?: Database.Database
): { evaluations: ReturnType<typeof listEvaluationsByAgent | typeof listEvaluationsByJob> } {
  const conn = db ?? getDb();
  if (agentId) {
    return { evaluations: listEvaluationsByAgent(agentId, conn) };
  }
  // Return all recent evaluations (limit 50)
  const rows = conn
    .prepare(
      `SELECT e.*, j.original_prompt, t.todo_description, a.name AS agent_name
       FROM evaluations e
       LEFT JOIN jobs j ON e.job_id = j.job_id
       LEFT JOIN tasks t ON e.trace_id = t.trace_id
       LEFT JOIN agents a ON e.agent_id = a.agent_id
       ORDER BY e.created_at DESC
       LIMIT 50`
    )
    .all();
  return { evaluations: rows as Evaluation[] };
}

export { RATING_SYSTEMS } from '../models/evaluation.js';
