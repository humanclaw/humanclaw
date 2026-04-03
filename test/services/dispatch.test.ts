import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema.js';
import { setDb } from '../../src/db/connection.js';
import { createAgent } from '../../src/models/agent.js';
import { dispatchJob } from '../../src/services/dispatch.js';
import { getTask } from '../../src/models/task.js';
import { getAgent } from '../../src/models/agent.js';

function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

describe('Dispatch Service', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
    setDb(db);
    createAgent({ agent_id: 'emp_001', name: 'Alice', capabilities: ['frontend'], status: 'IDLE' }, db);
    createAgent({ agent_id: 'emp_002', name: 'Bob', capabilities: ['backend'], status: 'IDLE' }, db);
  });

  it('should dispatch a job with tasks', () => {
    const job = dispatchJob({
      original_prompt: 'Build the app',
      tasks: [
        {
          assignee_id: 'emp_001',
          todo_description: 'Build frontend',
          deadline: '2030-01-01T00:00:00Z',
        },
        {
          assignee_id: 'emp_002',
          todo_description: 'Build backend',
          deadline: '2030-01-01T00:00:00Z',
        },
      ],
    });

    expect(job.job_id).toBeTruthy();
    expect(job.tasks).toHaveLength(2);
    expect(job.tasks[0].status).toBe('DISPATCHED');
    expect(job.tasks[1].status).toBe('DISPATCHED');

    // Agents should be marked BUSY
    const agent1 = getAgent('emp_001', db);
    expect(agent1!.status).toBe('BUSY');
  });

  it('should fail when assigning to non-existent agent', () => {
    expect(() =>
      dispatchJob({
        original_prompt: 'Test',
        tasks: [
          {
            assignee_id: 'non_existent',
            todo_description: 'Do something',
            deadline: '2030-01-01',
          },
        ],
      })
    ).toThrow('Agent not found: non_existent');
  });

  it('should fail when assigning to offline agent', () => {
    createAgent({ agent_id: 'emp_off', name: 'Offline', capabilities: [], status: 'OFFLINE' }, db);

    expect(() =>
      dispatchJob({
        original_prompt: 'Test',
        tasks: [
          {
            assignee_id: 'emp_off',
            todo_description: 'Do something',
            deadline: '2030-01-01',
          },
        ],
      })
    ).toThrow('Agent is offline');
  });

  it('should generate unique trace IDs for each task', () => {
    const job = dispatchJob({
      original_prompt: 'Test',
      tasks: [
        { assignee_id: 'emp_001', todo_description: 'A', deadline: '2030-01-01' },
        { assignee_id: 'emp_002', todo_description: 'B', deadline: '2030-01-01' },
      ],
    });

    expect(job.tasks[0].trace_id).not.toBe(job.tasks[1].trace_id);
    expect(job.tasks[0].trace_id).toMatch(/^TK-[A-Za-z0-9_-]{8}$/);
  });
});
