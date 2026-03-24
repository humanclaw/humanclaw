import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema.js';
import { createAgent } from '../../src/models/agent.js';
import {
  createJob,
  getJob,
  getJobWithTasks,
  listActiveJobs,
  isJobComplete,
  deleteJob,
} from '../../src/models/job.js';
import { createTask, resolveTask } from '../../src/models/task.js';

function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

describe('OrchestrationJob Model', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
    createAgent({ agent_id: 'emp_001', name: 'A', capabilities: [], status: 'IDLE' }, db);
  });

  it('should create and retrieve a job', () => {
    const job = createJob(
      {
        job_id: 'job_001',
        original_prompt: 'Build the dashboard',
        created_at: new Date().toISOString(),
      },
      db
    );

    expect(job.job_id).toBe('job_001');

    const retrieved = getJob('job_001', db);
    expect(retrieved).toBeDefined();
    expect(retrieved!.original_prompt).toBe('Build the dashboard');
  });

  it('should get job with tasks', () => {
    createJob(
      { job_id: 'job_001', original_prompt: 'Test', created_at: new Date().toISOString() },
      db
    );
    createTask(
      { trace_id: 'TK-0001', job_id: 'job_001', assignee_id: 'emp_001', todo_description: 'A', deadline: '2030-01-01', payload: {}, status: 'DISPATCHED' },
      db
    );

    const job = getJobWithTasks('job_001', db);
    expect(job).toBeDefined();
    expect(job!.tasks).toHaveLength(1);
  });

  it('should check job completion', () => {
    createJob(
      { job_id: 'job_001', original_prompt: 'Test', created_at: new Date().toISOString() },
      db
    );
    createTask(
      { trace_id: 'TK-0001', job_id: 'job_001', assignee_id: 'emp_001', todo_description: 'A', deadline: '2030-01-01', payload: {}, status: 'DISPATCHED' },
      db
    );

    expect(isJobComplete('job_001', db)).toBe(false);

    resolveTask('TK-0001', { done: true }, db);

    expect(isJobComplete('job_001', db)).toBe(true);
  });

  it('should list active jobs', () => {
    createJob(
      { job_id: 'job_001', original_prompt: 'Test', created_at: new Date().toISOString() },
      db
    );
    createTask(
      { trace_id: 'TK-0001', job_id: 'job_001', assignee_id: 'emp_001', todo_description: 'A', deadline: '2030-01-01', payload: {}, status: 'DISPATCHED' },
      db
    );

    const jobs = listActiveJobs(db);
    expect(jobs.length).toBeGreaterThanOrEqual(1);
  });

  it('should delete a job', () => {
    createJob(
      { job_id: 'job_001', original_prompt: 'Test', created_at: new Date().toISOString() },
      db
    );

    const deleted = deleteJob('job_001', db);
    expect(deleted).toBe(true);

    const job = getJob('job_001', db);
    expect(job).toBeUndefined();
  });

  it('should return undefined for non-existent job', () => {
    const job = getJob('non_existent', db);
    expect(job).toBeUndefined();
  });
});
