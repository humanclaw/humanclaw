import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';
import type {
  Evaluation,
  EvaluationRow,
  RatingSystem,
} from './types.js';

export const RATING_SYSTEMS: Record<RatingSystem, readonly string[]> = {
  ali: ['3.25', '3.5', '3.5+', '3.75', '4.0'],
  letter: ['S', 'A', 'B', 'C', 'D'],
  em: ['E', 'M+', 'M', 'M-', 'L'],
} as const;

export function validateRating(system: RatingSystem, rating: string): boolean {
  const values = RATING_SYSTEMS[system];
  return values ? values.includes(rating) : false;
}

export function createEvaluation(
  evaluation: Omit<Evaluation, 'created_at'>,
  db?: Database.Database
): Evaluation {
  const conn = db ?? getDb();
  const now = new Date().toISOString();
  conn
    .prepare(
      `INSERT INTO evaluations (eval_id, job_id, agent_id, trace_id, rating_system, rating, weight, comment, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      evaluation.eval_id,
      evaluation.job_id,
      evaluation.agent_id,
      evaluation.trace_id,
      evaluation.rating_system,
      evaluation.rating,
      evaluation.weight,
      evaluation.comment || '',
      now
    );
  return { ...evaluation, comment: evaluation.comment || '', created_at: now };
}

function rowToEvaluation(row: EvaluationRow): Evaluation {
  return {
    ...row,
    rating_system: row.rating_system as RatingSystem,
  };
}

export function listEvaluationsByJob(
  jobId: string,
  db?: Database.Database
): Evaluation[] {
  const conn = db ?? getDb();
  const rows = conn
    .prepare(
      `SELECT e.*
       FROM evaluations e
       WHERE e.job_id = ?
       ORDER BY e.created_at`
    )
    .all(jobId) as EvaluationRow[];
  return rows.map(rowToEvaluation);
}

export function listEvaluationsByAgent(
  agentId: string,
  db?: Database.Database
): (Evaluation & { original_prompt?: string; todo_description?: string })[] {
  const conn = db ?? getDb();
  const rows = conn
    .prepare(
      `SELECT e.*, j.original_prompt, t.todo_description
       FROM evaluations e
       LEFT JOIN jobs j ON e.job_id = j.job_id
       LEFT JOIN tasks t ON e.trace_id = t.trace_id
       WHERE e.agent_id = ?
       ORDER BY e.created_at DESC`
    )
    .all(agentId) as (EvaluationRow & { original_prompt?: string; todo_description?: string })[];
  return rows.map(r => ({ ...rowToEvaluation(r), original_prompt: r.original_prompt, todo_description: r.todo_description }));
}

export function getAgentEvaluationSummary(
  agentId: string,
  db?: Database.Database
): { total_evaluations: number; by_system: Record<string, { count: number; ratings: string[] }> } {
  const conn = db ?? getDb();
  const rows = conn
    .prepare(
      `SELECT rating_system, rating, COUNT(*) as cnt
       FROM evaluations
       WHERE agent_id = ?
       GROUP BY rating_system, rating
       ORDER BY rating_system, rating`
    )
    .all(agentId) as { rating_system: string; rating: string; cnt: number }[];

  const by_system: Record<string, { count: number; ratings: string[] }> = {};
  let total = 0;

  for (const row of rows) {
    if (!by_system[row.rating_system]) {
      by_system[row.rating_system] = { count: 0, ratings: [] };
    }
    by_system[row.rating_system].count += row.cnt;
    by_system[row.rating_system].ratings.push(`${row.rating}(${row.cnt})`);
    total += row.cnt;
  }

  return { total_evaluations: total, by_system };
}

export function deleteEvaluationsByJob(
  jobId: string,
  db?: Database.Database
): number {
  const conn = db ?? getDb();
  const result = conn
    .prepare('DELETE FROM evaluations WHERE job_id = ?')
    .run(jobId);
  return result.changes;
}
