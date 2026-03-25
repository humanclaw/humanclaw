import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema.js';
import { setDb } from '../../src/db/connection.js';
import { createAgent } from '../../src/models/agent.js';
import { dispatchJob } from '../../src/services/dispatch.js';
import { resumeTask } from '../../src/services/resume.js';
import { generateEvaluations, getPerformanceDashboard } from '../../src/services/evaluator.js';
import type { LlmProvider } from '../../src/llm/types.js';

function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

describe('Evaluator Service', () => {
  let db: Database.Database;
  let jobId: string;
  let traceIds: string[];

  beforeEach(() => {
    db = createTestDb();
    setDb(db);
    createAgent({ agent_id: 'emp_001', name: '前端老李', capabilities: ['frontend'], status: 'IDLE' }, db);
    createAgent({ agent_id: 'emp_002', name: '后端小王', capabilities: ['backend'], status: 'IDLE' }, db);

    const job = dispatchJob({
      original_prompt: 'Build a website',
      tasks: [
        { assignee_id: 'emp_001', todo_description: 'Build UI', deadline: '2030-01-01T00:00:00Z' },
        { assignee_id: 'emp_002', todo_description: 'Build API', deadline: '2030-01-01T00:00:00Z' },
      ],
    }, db);
    jobId = job.job_id;
    traceIds = job.tasks.map(t => t.trace_id);

    // Resolve all tasks
    for (const t of job.tasks) {
      resumeTask(t.trace_id, { text: 'Delivered' }, db);
    }
  });

  it('should generate evaluations with ali rating system', async () => {
    const provider: LlmProvider = {
      complete: async () => ({
        content: JSON.stringify([
          { agent_id: 'emp_001', trace_id: traceIds[0], rating: '3.75', comment: 'Good work' },
          { agent_id: 'emp_002', trace_id: traceIds[1], rating: '3.5+', comment: 'OK' },
        ]),
      }),
    };

    const result = await generateEvaluations(
      { job_id: jobId, rating_system: 'ali' },
      provider,
      db
    );

    expect(result.evaluations).toHaveLength(2);
    expect(result.evaluations[0].rating).toBe('3.75');
    expect(result.evaluations[1].rating).toBe('3.5+');
  });

  it('should generate evaluations with letter rating system', async () => {
    const provider: LlmProvider = {
      complete: async () => ({
        content: '```json\n[{"agent_id":"emp_001","trace_id":"'+traceIds[0]+'","rating":"A","comment":"great"},{"agent_id":"emp_002","trace_id":"'+traceIds[1]+'","rating":"B","comment":"ok"}]\n```',
      }),
    };

    const result = await generateEvaluations(
      { job_id: jobId, rating_system: 'letter' },
      provider,
      db
    );

    expect(result.evaluations).toHaveLength(2);
    expect(result.evaluations[0].rating).toBe('A');
  });

  it('should fallback to middle rating when invalid', async () => {
    const provider: LlmProvider = {
      complete: async () => ({
        content: JSON.stringify([
          { agent_id: 'emp_001', trace_id: traceIds[0], rating: 'INVALID', comment: 'test' },
        ]),
      }),
    };

    const result = await generateEvaluations(
      { job_id: jobId, rating_system: 'em' },
      provider,
      db
    );

    // Middle of ['EM+', 'EM', 'MM+', 'MM', 'MM-'] is index 2 = 'MM+'
    expect(result.evaluations[0].rating).toBe('MM+');
  });

  it('should throw when job is not complete', async () => {
    // Create a new incomplete job
    const job2 = dispatchJob({
      original_prompt: 'Another job',
      tasks: [
        { assignee_id: 'emp_001', todo_description: 'Incomplete task', deadline: '2030-01-01T00:00:00Z' },
      ],
    }, db);

    const provider: LlmProvider = {
      complete: async () => ({ content: '[]' }),
    };

    await expect(
      generateEvaluations({ job_id: job2.job_id, rating_system: 'ali' }, provider, db)
    ).rejects.toThrow('尚未全部完成');
  });

  it('should throw when job not found', async () => {
    const provider: LlmProvider = {
      complete: async () => ({ content: '[]' }),
    };

    await expect(
      generateEvaluations({ job_id: 'nonexistent', rating_system: 'ali' }, provider, db)
    ).rejects.toThrow('Job not found');
  });

  it('should return performance dashboard', async () => {
    const provider: LlmProvider = {
      complete: async () => ({
        content: JSON.stringify([
          { agent_id: 'emp_001', trace_id: traceIds[0], rating: '3.75', comment: 'Good' },
        ]),
      }),
    };

    await generateEvaluations({ job_id: jobId, rating_system: 'ali' }, provider, db);

    const dashboard = getPerformanceDashboard(undefined, db);
    expect(dashboard.evaluations.length).toBeGreaterThan(0);

    const agentDashboard = getPerformanceDashboard('emp_001', db);
    expect(agentDashboard.evaluations.length).toBeGreaterThan(0);
  });

  it('should apply task weights', async () => {
    const provider: LlmProvider = {
      complete: async () => ({
        content: JSON.stringify([
          { agent_id: 'emp_001', trace_id: traceIds[0], rating: '3.75', comment: 'Good' },
          { agent_id: 'emp_002', trace_id: traceIds[1], rating: '3.5', comment: 'OK' },
        ]),
      }),
    };

    const result = await generateEvaluations(
      { job_id: jobId, rating_system: 'ali', task_weights: { [traceIds[0]]: 2.0, [traceIds[1]]: 0.5 } },
      provider,
      db
    );

    expect(result.evaluations[0].weight).toBe(2.0);
    expect(result.evaluations[1].weight).toBe(0.5);
  });
});
