import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema.js';
import { setDb } from '../../src/db/connection.js';
import { createAgent } from '../../src/models/agent.js';
import { planJob } from '../../src/services/planner.js';
import type { LlmProvider } from '../../src/llm/types.js';

function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

function mockProvider(response: unknown[]): LlmProvider {
  return {
    complete: async () => ({
      content: JSON.stringify(response),
    }),
  };
}

describe('Planner Service', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
    setDb(db);
    createAgent({ agent_id: 'emp_001', name: '前端老李', capabilities: ['UI/UX', '前端开发'], status: 'IDLE' }, db);
    createAgent({ agent_id: 'emp_002', name: '后端小王', capabilities: ['Java', '微服务'], status: 'IDLE' }, db);
    createAgent({ agent_id: 'emp_003', name: '离线张三', capabilities: ['测试'], status: 'OFFLINE' }, db);
  });

  it('should plan tasks from a prompt', async () => {
    const provider = mockProvider([
      {
        assignee_id: 'emp_001',
        assignee_name: '前端老李',
        todo_description: '实现响应式导航栏',
        briefing: '老李，需要你做一个响应式导航栏，支持移动端。',
        deadline: '2030-01-01T18:00:00Z',
      },
      {
        assignee_id: 'emp_002',
        assignee_name: '后端小王',
        todo_description: '开发用户API接口',
        briefing: '小王，需要开发用户管理的CRUD接口。',
        deadline: '2030-01-02T18:00:00Z',
      },
    ]);

    const plan = await planJob({ prompt: '完成首页重构' }, provider, db);

    expect(plan.original_prompt).toBe('完成首页重构');
    expect(plan.planned_tasks).toHaveLength(2);
    expect(plan.planned_tasks[0].assignee_id).toBe('emp_001');
    expect(plan.planned_tasks[0].briefing).toContain('导航栏');
    expect(plan.planned_tasks[1].assignee_id).toBe('emp_002');
  });

  it('should filter to only IDLE agents by default', async () => {
    const provider = mockProvider([
      {
        assignee_id: 'emp_001',
        assignee_name: '前端老李',
        todo_description: '测试任务',
        briefing: '测试话术',
        deadline: '2030-01-01T18:00:00Z',
      },
    ]);

    // emp_003 is OFFLINE, so it should not be offered to the LLM
    const plan = await planJob({ prompt: '做个测试' }, provider, db);
    expect(plan.planned_tasks).toHaveLength(1);
    // The OFFLINE agent should not appear in plan
    const ids = plan.planned_tasks.map(t => t.assignee_id);
    expect(ids).not.toContain('emp_003');
  });

  it('should use specified agent_ids when provided', async () => {
    const provider = mockProvider([
      {
        assignee_id: 'emp_002',
        assignee_name: '后端小王',
        todo_description: '写API',
        briefing: '小王负责API',
        deadline: '2030-01-01T18:00:00Z',
      },
    ]);

    const plan = await planJob({ prompt: '写API', agent_ids: ['emp_002'] }, provider, db);
    expect(plan.planned_tasks[0].assignee_id).toBe('emp_002');
  });

  it('should handle LLM returning JSON in code block', async () => {
    const provider: LlmProvider = {
      complete: async () => ({
        content: '```json\n[{"assignee_id":"emp_001","assignee_name":"前端老李","todo_description":"做UI","briefing":"请做UI","deadline":"2030-01-01T00:00:00Z"}]\n```',
      }),
    };

    const plan = await planJob({ prompt: '做UI' }, provider, db);
    expect(plan.planned_tasks).toHaveLength(1);
    expect(plan.planned_tasks[0].todo_description).toBe('做UI');
  });

  it('should fallback agent when LLM hallucinates agent_id', async () => {
    const provider = mockProvider([
      {
        assignee_id: 'emp_nonexistent',
        assignee_name: '不存在的人',
        todo_description: '某任务',
        briefing: '话术',
        deadline: '2030-01-01T00:00:00Z',
      },
    ]);

    const plan = await planJob({ prompt: '做任务' }, provider, db);
    // Should fallback to first available agent
    expect(['emp_001', 'emp_002']).toContain(plan.planned_tasks[0].assignee_id);
  });

  it('should throw when LLM returns invalid JSON', async () => {
    const provider: LlmProvider = {
      complete: async () => ({
        content: 'This is not valid JSON at all',
      }),
    };

    await expect(planJob({ prompt: '做任务' }, provider, db)).rejects.toThrow('无法解析');
  });

  it('should throw when no agents are available', async () => {
    // Delete IDLE agents, keep only OFFLINE
    db.prepare('DELETE FROM agents WHERE status != ?').run('OFFLINE');

    const provider = mockProvider([]);

    await expect(planJob({ prompt: '做任务' }, provider, db)).rejects.toThrow('没有可用的碳基节点');
  });

  it('should generate default deadline when LLM omits it', async () => {
    const provider = mockProvider([
      {
        assignee_id: 'emp_001',
        assignee_name: '前端老李',
        todo_description: '做UI',
        briefing: '请做UI',
        deadline: '',
      },
    ]);

    const plan = await planJob({ prompt: '做UI' }, provider, db);
    // Should have a valid deadline (default: 24h from now)
    const dl = new Date(plan.planned_tasks[0].deadline);
    expect(dl.getTime()).toBeGreaterThan(Date.now());
  });
});
