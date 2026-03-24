import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';
import { createJob } from '../models/job.js';
import { createTask } from '../models/task.js';
import { getAgent, updateAgentStatus } from '../models/agent.js';
import { generateTraceId, generateId } from '../utils/trace-id.js';
import type { CreateJobRequest, JobWithTasks } from '../models/types.js';

export function dispatchJob(
  request: CreateJobRequest,
  db?: Database.Database
): JobWithTasks {
  const conn = db ?? getDb();
  const jobId = generateId('job');
  const now = new Date().toISOString();

  // Validate all assignees exist
  for (const taskReq of request.tasks) {
    const agent = getAgent(taskReq.assignee_id, conn);
    if (!agent) {
      throw new Error(`Agent not found: ${taskReq.assignee_id}`);
    }
    if (agent.status === 'OFFLINE') {
      throw new Error(`Agent is offline: ${taskReq.assignee_id} (${agent.name})`);
    }
  }

  // Create the job
  const job = createJob(
    {
      job_id: jobId,
      original_prompt: request.original_prompt,
      created_at: now,
    },
    conn
  );

  // Create and dispatch all tasks
  const tasks = request.tasks.map(taskReq => {
    const traceId = generateTraceId();
    const task = createTask(
      {
        trace_id: traceId,
        job_id: jobId,
        assignee_id: taskReq.assignee_id,
        todo_description: taskReq.todo_description,
        deadline: taskReq.deadline,
        payload: taskReq.payload ?? {},
        status: 'DISPATCHED',
      },
      conn
    );

    // Mark the agent as busy
    updateAgentStatus(taskReq.assignee_id, 'BUSY', conn);

    return task;
  });

  return { ...job, tasks };
}
