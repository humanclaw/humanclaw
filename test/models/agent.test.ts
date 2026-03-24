import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema.js';
import {
  createAgent,
  getAgent,
  listAgents,
  updateAgentStatus,
  deleteAgent,
  listAgentsWithMetrics,
} from '../../src/models/agent.js';

function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

describe('HumanAgent Model', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
  });

  it('should create and retrieve an agent', () => {
    const agent = createAgent(
      {
        agent_id: 'emp_001',
        name: 'Frontend Lao Li',
        capabilities: ['UI/UX', 'Frontend Dev'],
        status: 'IDLE',
      },
      db
    );

    expect(agent.agent_id).toBe('emp_001');
    expect(agent.name).toBe('Frontend Lao Li');
    expect(agent.capabilities).toEqual(['UI/UX', 'Frontend Dev']);
    expect(agent.status).toBe('IDLE');

    const retrieved = getAgent('emp_001', db);
    expect(retrieved).toBeDefined();
    expect(retrieved!.name).toBe('Frontend Lao Li');
  });

  it('should list all agents', () => {
    createAgent({ agent_id: 'emp_001', name: 'A', capabilities: [], status: 'IDLE' }, db);
    createAgent({ agent_id: 'emp_002', name: 'B', capabilities: [], status: 'BUSY' }, db);

    const agents = listAgents(db);
    expect(agents).toHaveLength(2);
  });

  it('should update agent status', () => {
    createAgent({ agent_id: 'emp_001', name: 'A', capabilities: [], status: 'IDLE' }, db);

    const updated = updateAgentStatus('emp_001', 'BUSY', db);
    expect(updated).toBe(true);

    const agent = getAgent('emp_001', db);
    expect(agent!.status).toBe('BUSY');
  });

  it('should return false when updating non-existent agent', () => {
    const updated = updateAgentStatus('non_existent', 'BUSY', db);
    expect(updated).toBe(false);
  });

  it('should delete an agent', () => {
    createAgent({ agent_id: 'emp_001', name: 'A', capabilities: [], status: 'IDLE' }, db);

    const deleted = deleteAgent('emp_001', db);
    expect(deleted).toBe(true);

    const agent = getAgent('emp_001', db);
    expect(agent).toBeUndefined();
  });

  it('should return undefined for non-existent agent', () => {
    const agent = getAgent('non_existent', db);
    expect(agent).toBeUndefined();
  });

  it('should list agents with metrics', () => {
    createAgent({ agent_id: 'emp_001', name: 'A', capabilities: [], status: 'IDLE' }, db);
    const metrics = listAgentsWithMetrics(db);
    expect(metrics).toHaveLength(1);
    expect(metrics[0].active_task_count).toBe(0);
    expect(metrics[0].avg_delivery_hours).toBeNull();
  });
});
