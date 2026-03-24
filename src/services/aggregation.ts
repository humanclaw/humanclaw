import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';
import { getJobWithTasks, isJobComplete } from '../models/job.js';
import type { JobWithTasks } from '../models/types.js';

export interface AggregationResult {
  job_id: string;
  original_prompt: string;
  openclaw_callback: string;
  results: Array<{
    trace_id: string;
    assignee_id: string;
    todo_description: string;
    result_data: unknown;
  }>;
  aggregated_at: string;
}

export function aggregateJob(
  jobId: string,
  db?: Database.Database
): AggregationResult {
  const conn = db ?? getDb();

  const job = getJobWithTasks(jobId, conn);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  if (!isJobComplete(jobId, conn)) {
    const resolved = job.tasks.filter(t => t.status === 'RESOLVED').length;
    throw new Error(
      `Job not complete: ${resolved}/${job.tasks.length} tasks resolved`
    );
  }

  return {
    job_id: job.job_id,
    original_prompt: job.original_prompt,
    openclaw_callback: job.openclaw_callback,
    results: job.tasks.map(t => ({
      trace_id: t.trace_id,
      assignee_id: t.assignee_id,
      todo_description: t.todo_description,
      result_data: t.result_data,
    })),
    aggregated_at: new Date().toISOString(),
  };
}

export async function syncToOpenClaw(
  aggregation: AggregationResult
): Promise<{ success: boolean; message: string }> {
  if (!aggregation.openclaw_callback) {
    return {
      success: true,
      message: 'No OpenClaw callback configured, skipping sync',
    };
  }

  try {
    const response = await fetch(aggregation.openclaw_callback, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aggregation),
    });

    if (!response.ok) {
      return {
        success: false,
        message: `OpenClaw sync failed: ${response.status} ${response.statusText}`,
      };
    }

    return { success: true, message: 'Synced to OpenClaw successfully' };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `OpenClaw sync error: ${message}` };
  }
}
