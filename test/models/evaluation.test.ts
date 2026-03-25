import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema.js';
import { createAgent } from '../../src/models/agent.js';
import { dispatchJob } from '../../src/services/dispatch.js';
import { setDb } from '../../src/db/connection.js';
import {
  createEvaluation,
  listEvaluationsByJob,
  listEvaluationsByAgent,
  deleteEvaluationsByJob,
  validateRating,
  RATING_SYSTEMS,
} from '../../src/models/evaluation.js';

function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

describe('Evaluation Model', () => {
  let db: Database.Database;
  let jobId: string;
  let traceId: string;

  beforeEach(() => {
    db = createTestDb();
    setDb(db);
    createAgent({ agent_id: 'emp_001', name: 'Alice', capabilities: ['frontend'], status: 'IDLE' }, db);

    const job = dispatchJob({
      original_prompt: 'test job',
      tasks: [{ assignee_id: 'emp_001', todo_description: 'do something', deadline: '2030-01-01T00:00:00Z' }],
    }, db);
    jobId = job.job_id;
    traceId = job.tasks[0].trace_id;
  });

  it('should create and retrieve an evaluation', () => {
    const ev = createEvaluation({
      eval_id: 'eval_001',
      job_id: jobId,
      agent_id: 'emp_001',
      trace_id: traceId,
      rating_system: 'ali',
      rating: '3.75',
      weight: 1.0,
      comment: 'Good job',
    }, db);

    expect(ev.eval_id).toBe('eval_001');
    expect(ev.rating).toBe('3.75');
    expect(ev.rating_system).toBe('ali');
  });

  it('should list evaluations by job', () => {
    createEvaluation({ eval_id: 'eval_001', job_id: jobId, agent_id: 'emp_001', trace_id: traceId, rating_system: 'letter', rating: 'A', weight: 1, comment: '' }, db);
    createEvaluation({ eval_id: 'eval_002', job_id: jobId, agent_id: 'emp_001', trace_id: traceId, rating_system: 'letter', rating: 'B', weight: 0.5, comment: '' }, db);

    const evals = listEvaluationsByJob(jobId, db);
    expect(evals).toHaveLength(2);
  });

  it('should list evaluations by agent', () => {
    createEvaluation({ eval_id: 'eval_001', job_id: jobId, agent_id: 'emp_001', trace_id: traceId, rating_system: 'em', rating: 'E', weight: 1, comment: '' }, db);

    const evals = listEvaluationsByAgent('emp_001', db);
    expect(evals).toHaveLength(1);
    expect(evals[0].rating).toBe('E');
  });

  it('should delete evaluations by job', () => {
    createEvaluation({ eval_id: 'eval_001', job_id: jobId, agent_id: 'emp_001', trace_id: traceId, rating_system: 'ali', rating: '3.5', weight: 1, comment: '' }, db);

    deleteEvaluationsByJob(jobId, db);
    const evals = listEvaluationsByJob(jobId, db);
    expect(evals).toHaveLength(0);
  });

  it('should validate ratings correctly', () => {
    expect(validateRating('ali', '3.75')).toBe(true);
    expect(validateRating('ali', '5.0')).toBe(false);
    expect(validateRating('letter', 'S')).toBe(true);
    expect(validateRating('letter', 'F')).toBe(false);
    expect(validateRating('em', 'E')).toBe(true);
    expect(validateRating('em', 'X')).toBe(false);
  });

  it('should have correct rating systems', () => {
    expect(RATING_SYSTEMS.ali).toEqual(['3.25', '3.5', '3.5+', '3.75', '4.0']);
    expect(RATING_SYSTEMS.letter).toEqual(['S', 'A', 'B', 'C', 'D']);
    expect(RATING_SYSTEMS.em).toEqual(['E', 'M+', 'M', 'M-', 'L']);
  });
});
