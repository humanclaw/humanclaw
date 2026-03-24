import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';
import type { HumanTask, TaskRow, TaskStatus } from './types.js';

function rowToTask(row: TaskRow): HumanTask {
  return {
    ...row,
    payload: JSON.parse(row.payload) as Record<string, unknown>,
    result_data: row.result_data ? JSON.parse(row.result_data) : null,
  };
}

export function createTask(
  task: Omit<HumanTask, 'created_at' | 'updated_at' | 'result_data'>,
  db?: Database.Database
): HumanTask {
  const conn = db ?? getDb();
  const now = new Date().toISOString();
  conn
    .prepare(
      `INSERT INTO tasks (trace_id, job_id, assignee_id, todo_description, deadline, payload, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      task.trace_id,
      task.job_id,
      task.assignee_id,
      task.todo_description,
      task.deadline,
      JSON.stringify(task.payload),
      task.status,
      now,
      now
    );
  return { ...task, result_data: null, created_at: now, updated_at: now };
}

export function getTask(
  traceId: string,
  db?: Database.Database
): HumanTask | undefined {
  const conn = db ?? getDb();
  const row = conn
    .prepare('SELECT * FROM tasks WHERE trace_id = ?')
    .get(traceId) as TaskRow | undefined;
  return row ? rowToTask(row) : undefined;
}

export function listTasksByJob(
  jobId: string,
  db?: Database.Database
): HumanTask[] {
  const conn = db ?? getDb();
  const rows = conn
    .prepare('SELECT * FROM tasks WHERE job_id = ? ORDER BY created_at')
    .all(jobId) as TaskRow[];
  return rows.map(rowToTask);
}

export function listTasksByAssignee(
  assigneeId: string,
  db?: Database.Database
): HumanTask[] {
  const conn = db ?? getDb();
  const rows = conn
    .prepare('SELECT * FROM tasks WHERE assignee_id = ? ORDER BY created_at')
    .all(assigneeId) as TaskRow[];
  return rows.map(rowToTask);
}

export function updateTaskStatus(
  traceId: string,
  status: TaskStatus,
  db?: Database.Database
): boolean {
  const conn = db ?? getDb();
  const now = new Date().toISOString();
  const result = conn
    .prepare('UPDATE tasks SET status = ?, updated_at = ? WHERE trace_id = ?')
    .run(status, now, traceId);
  return result.changes > 0;
}

export function resolveTask(
  traceId: string,
  resultData: unknown,
  db?: Database.Database
): boolean {
  const conn = db ?? getDb();
  const now = new Date().toISOString();
  const result = conn
    .prepare(
      `UPDATE tasks
       SET status = 'RESOLVED', result_data = ?, updated_at = ?
       WHERE trace_id = ? AND status IN ('DISPATCHED', 'OVERDUE')`
    )
    .run(JSON.stringify(resultData), now, traceId);
  return result.changes > 0;
}

export function markOverdueTasks(db?: Database.Database): number {
  const conn = db ?? getDb();
  const now = new Date().toISOString();
  const result = conn
    .prepare(
      `UPDATE tasks
       SET status = 'OVERDUE', updated_at = ?
       WHERE status = 'DISPATCHED' AND deadline < ?`
    )
    .run(now, now);
  return result.changes;
}

export function resetTaskDeadline(
  traceId: string,
  newDeadline: string,
  db?: Database.Database
): boolean {
  const conn = db ?? getDb();
  const now = new Date().toISOString();
  const result = conn
    .prepare(
      `UPDATE tasks
       SET status = 'DISPATCHED', deadline = ?, result_data = NULL, updated_at = ?
       WHERE trace_id = ?`
    )
    .run(newDeadline, now, traceId);
  return result.changes > 0;
}
