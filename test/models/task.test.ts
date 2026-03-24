import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema.js';
import { createAgent } from '../../src/models/agent.js';
import { createJob } from '../../src/models/job.js';
import {
  createTask,
  getTask,
  listTasksByJob,
  listTasksByAssignee,
  updateTaskStatus,
  resolveTask,
  markOverdueTasks,
  resetTaskDeadline,
} from '../../src/models/task.js';

function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

function seedAgentAndJob(db: Database.Database) {
  createAgent({ agent_id: 'emp_001', name: 'A', capabilities: [], status: 'IDLE' }, db);
  createJob(
    {
      job_id: 'job_001',
      original_prompt: 'Test job',
      created_at: new Date().toISOString(),
    },
    db
  );
}

describe('HumanTask Model', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
    seedAgentAndJob(db);
  });

  it('should create and retrieve a task', () => {
    const task = createTask(
      {
        trace_id: 'TK-0001',
        job_id: 'job_001',
        assignee_id: 'emp_001',
        todo_description: 'Build login page',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        payload: { ref: 'design-v2' },
        status: 'DISPATCHED',
      },
      db
    );

    expect(task.trace_id).toBe('TK-0001');
    expect(task.status).toBe('DISPATCHED');

    const retrieved = getTask('TK-0001', db);
    expect(retrieved).toBeDefined();
    expect(retrieved!.payload).toEqual({ ref: 'design-v2' });
  });

  it('should list tasks by job', () => {
    createTask(
      { trace_id: 'TK-0001', job_id: 'job_001', assignee_id: 'emp_001', todo_description: 'A', deadline: '2030-01-01', payload: {}, status: 'DISPATCHED' },
      db
    );
    createTask(
      { trace_id: 'TK-0002', job_id: 'job_001', assignee_id: 'emp_001', todo_description: 'B', deadline: '2030-01-01', payload: {}, status: 'DISPATCHED' },
      db
    );

    const tasks = listTasksByJob('job_001', db);
    expect(tasks).toHaveLength(2);
  });

  it('should list tasks by assignee', () => {
    createTask(
      { trace_id: 'TK-0001', job_id: 'job_001', assignee_id: 'emp_001', todo_description: 'A', deadline: '2030-01-01', payload: {}, status: 'DISPATCHED' },
      db
    );

    const tasks = listTasksByAssignee('emp_001', db);
    expect(tasks).toHaveLength(1);
  });

  it('should update task status', () => {
    createTask(
      { trace_id: 'TK-0001', job_id: 'job_001', assignee_id: 'emp_001', todo_description: 'A', deadline: '2030-01-01', payload: {}, status: 'DISPATCHED' },
      db
    );

    updateTaskStatus('TK-0001', 'OVERDUE', db);
    const task = getTask('TK-0001', db);
    expect(task!.status).toBe('OVERDUE');
  });

  it('should resolve a task with result data', () => {
    createTask(
      { trace_id: 'TK-0001', job_id: 'job_001', assignee_id: 'emp_001', todo_description: 'A', deadline: '2030-01-01', payload: {}, status: 'DISPATCHED' },
      db
    );

    const resolved = resolveTask('TK-0001', { code: 'done' }, db);
    expect(resolved).toBe(true);

    const task = getTask('TK-0001', db);
    expect(task!.status).toBe('RESOLVED');
    expect(task!.result_data).toEqual({ code: 'done' });
  });

  it('should not resolve a PENDING task', () => {
    createTask(
      { trace_id: 'TK-0001', job_id: 'job_001', assignee_id: 'emp_001', todo_description: 'A', deadline: '2030-01-01', payload: {}, status: 'PENDING' },
      db
    );

    const resolved = resolveTask('TK-0001', { code: 'done' }, db);
    expect(resolved).toBe(false);
  });

  it('should mark overdue tasks', () => {
    createTask(
      { trace_id: 'TK-0001', job_id: 'job_001', assignee_id: 'emp_001', todo_description: 'A', deadline: '2020-01-01', payload: {}, status: 'DISPATCHED' },
      db
    );

    const count = markOverdueTasks(db);
    expect(count).toBe(1);

    const task = getTask('TK-0001', db);
    expect(task!.status).toBe('OVERDUE');
  });

  it('should reset task deadline', () => {
    createTask(
      { trace_id: 'TK-0001', job_id: 'job_001', assignee_id: 'emp_001', todo_description: 'A', deadline: '2020-01-01', payload: {}, status: 'OVERDUE' },
      db
    );

    const reset = resetTaskDeadline('TK-0001', '2030-06-01', db);
    expect(reset).toBe(true);

    const task = getTask('TK-0001', db);
    expect(task!.status).toBe('DISPATCHED');
    expect(task!.deadline).toBe('2030-06-01');
  });
});
