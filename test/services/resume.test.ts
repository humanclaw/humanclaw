import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema.js';
import { setDb } from '../../src/db/connection.js';
import { createAgent, getAgent } from '../../src/models/agent.js';
import { dispatchJob } from '../../src/services/dispatch.js';
import { resumeTask, rejectTask } from '../../src/services/resume.js';

function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

describe('Resume Service', () => {
  let db: Database.Database;
  let traceId: string;

  beforeEach(() => {
    db = createTestDb();
    setDb(db);
    createAgent({ agent_id: 'emp_001', name: 'Alice', capabilities: [], status: 'IDLE' }, db);

    const job = dispatchJob({
      original_prompt: 'Test job',
      tasks: [
        { assignee_id: 'emp_001', todo_description: 'Do work', deadline: '2030-01-01' },
      ],
    });
    traceId = job.tasks[0].trace_id;
  });

  it('should resume a dispatched task', () => {
    const result = resumeTask(traceId, { output: 'completed work' });

    expect(result.task.status).toBe('RESOLVED');
    expect(result.task.result_data).toEqual({ output: 'completed work' });
    expect(result.jobComplete).toBe(true);
  });

  it('should mark agent as IDLE when all tasks resolved', () => {
    resumeTask(traceId, { output: 'done' });

    const agent = getAgent('emp_001', db);
    expect(agent!.status).toBe('IDLE');
  });

  it('should fail for non-existent trace_id', () => {
    expect(() => resumeTask('TK-9999', { output: 'x' })).toThrow(
      'Task not found: TK-9999'
    );
  });

  it('should fail for already resolved task', () => {
    resumeTask(traceId, { output: 'done' });

    expect(() => resumeTask(traceId, { output: 'again' })).toThrow(
      'Task already resolved'
    );
  });

  it('should detect job completion across multiple tasks', () => {
    createAgent({ agent_id: 'emp_002', name: 'Bob', capabilities: [], status: 'IDLE' }, db);

    const job = dispatchJob({
      original_prompt: 'Multi-task job',
      tasks: [
        { assignee_id: 'emp_001', todo_description: 'Task A', deadline: '2030-01-01' },
        { assignee_id: 'emp_002', todo_description: 'Task B', deadline: '2030-01-01' },
      ],
    });

    const result1 = resumeTask(job.tasks[0].trace_id, { a: 'done' });
    expect(result1.jobComplete).toBe(false);

    const result2 = resumeTask(job.tasks[1].trace_id, { b: 'done' });
    expect(result2.jobComplete).toBe(true);
    expect(result2.job).toBeDefined();
    expect(result2.job!.tasks).toHaveLength(2);
  });

  it('should reject and extend deadline', () => {
    const task = rejectTask(traceId, '2035-06-15T00:00:00Z');

    expect(task.status).toBe('DISPATCHED');
    expect(task.deadline).toBe('2035-06-15T00:00:00Z');
  });

  it('should reject with default 24h extension', () => {
    const task = rejectTask(traceId);

    expect(task.status).toBe('DISPATCHED');
    const newDeadline = new Date(task.deadline);
    const now = new Date();
    // Should be roughly 24h from now
    const hoursDiff = (newDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    expect(hoursDiff).toBeGreaterThan(23);
    expect(hoursDiff).toBeLessThan(25);
  });
});
