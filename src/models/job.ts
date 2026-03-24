import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';
import type { OrchestrationJob, JobRow, JobWithTasks } from './types.js';
import { listTasksByJob } from './task.js';

export function createJob(
  job: OrchestrationJob,
  db?: Database.Database
): OrchestrationJob {
  const conn = db ?? getDb();
  conn
    .prepare(
      `INSERT INTO jobs (job_id, original_prompt, created_at)
       VALUES (?, ?, ?)`
    )
    .run(job.job_id, job.original_prompt, job.created_at);
  return job;
}

export function getJob(
  jobId: string,
  db?: Database.Database
): OrchestrationJob | undefined {
  const conn = db ?? getDb();
  return conn
    .prepare('SELECT * FROM jobs WHERE job_id = ?')
    .get(jobId) as JobRow | undefined;
}

export function getJobWithTasks(
  jobId: string,
  db?: Database.Database
): JobWithTasks | undefined {
  const conn = db ?? getDb();
  const job = conn
    .prepare('SELECT * FROM jobs WHERE job_id = ?')
    .get(jobId) as JobRow | undefined;
  if (!job) return undefined;

  const tasks = listTasksByJob(jobId, conn);
  return { ...job, tasks };
}

export function listActiveJobs(db?: Database.Database): JobWithTasks[] {
  const conn = db ?? getDb();
  const jobs = conn
    .prepare(
      `SELECT DISTINCT j.*
       FROM jobs j
       INNER JOIN tasks t ON j.job_id = t.job_id
       WHERE t.status != 'RESOLVED'
       ORDER BY j.created_at DESC`
    )
    .all() as JobRow[];

  // Also include jobs where all tasks are resolved but not yet synced
  const allJobs = conn
    .prepare('SELECT * FROM jobs ORDER BY created_at DESC')
    .all() as JobRow[];

  const activeJobIds = new Set(jobs.map(j => j.job_id));
  const result: JobWithTasks[] = [];

  for (const job of allJobs) {
    const tasks = listTasksByJob(job.job_id, conn);
    if (tasks.length > 0) {
      result.push({ ...job, tasks });
    }
  }

  return result;
}

export function isJobComplete(
  jobId: string,
  db?: Database.Database
): boolean {
  const conn = db ?? getDb();
  const row = conn
    .prepare(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved
       FROM tasks WHERE job_id = ?`
    )
    .get(jobId) as { total: number; resolved: number };
  return row.total > 0 && row.total === row.resolved;
}

export function deleteJob(
  jobId: string,
  db?: Database.Database
): boolean {
  const conn = db ?? getDb();
  const result = conn
    .prepare('DELETE FROM jobs WHERE job_id = ?')
    .run(jobId);
  return result.changes > 0;
}
