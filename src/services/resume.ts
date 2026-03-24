import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';
import { getTask, resolveTask, resetTaskDeadline } from '../models/task.js';
import { isJobComplete, getJobWithTasks } from '../models/job.js';
import { updateAgentStatus } from '../models/agent.js';
import { listTasksByAssignee } from '../models/task.js';
import type { HumanTask, JobWithTasks } from '../models/types.js';

export interface ResumeResult {
  task: HumanTask;
  jobComplete: boolean;
  job: JobWithTasks | undefined;
}

export function resumeTask(
  traceId: string,
  resultData: unknown,
  db?: Database.Database
): ResumeResult {
  const conn = db ?? getDb();

  // Validate trace_id exists
  const task = getTask(traceId, conn);
  if (!task) {
    throw new Error(`Task not found: ${traceId}`);
  }

  if (task.status === 'RESOLVED') {
    throw new Error(`Task already resolved: ${traceId}`);
  }

  if (task.status === 'PENDING') {
    throw new Error(`Task not yet dispatched: ${traceId}`);
  }

  // Resolve the task
  const updated = resolveTask(traceId, resultData, conn);
  if (!updated) {
    throw new Error(`Failed to resolve task: ${traceId}`);
  }

  // Check if the agent has other active tasks; if not, mark IDLE
  const activeTasks = listTasksByAssignee(task.assignee_id, conn).filter(
    t => t.status === 'DISPATCHED' || t.status === 'PENDING'
  );
  if (activeTasks.length === 0) {
    updateAgentStatus(task.assignee_id, 'IDLE', conn);
  }

  // Check if the whole job is now complete
  const jobComplete = isJobComplete(task.job_id, conn);
  const job = jobComplete ? getJobWithTasks(task.job_id, conn) : undefined;

  const resolvedTask = getTask(traceId, conn)!;

  return { task: resolvedTask, jobComplete, job };
}

export function rejectTask(
  traceId: string,
  newDeadline?: string,
  db?: Database.Database
): HumanTask {
  const conn = db ?? getDb();

  const task = getTask(traceId, conn);
  if (!task) {
    throw new Error(`Task not found: ${traceId}`);
  }

  // Default: extend deadline by 24h from now
  const deadline =
    newDeadline ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  resetTaskDeadline(traceId, deadline, conn);

  return getTask(traceId, conn)!;
}
