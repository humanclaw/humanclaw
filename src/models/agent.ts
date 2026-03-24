import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';
import type {
  HumanAgent,
  AgentRow,
  AgentStatus,
  AgentWithMetrics,
} from './types.js';

function rowToAgent(row: AgentRow): HumanAgent {
  return {
    ...row,
    capabilities: JSON.parse(row.capabilities) as string[],
  };
}

export function createAgent(
  agent: Omit<HumanAgent, 'created_at'>,
  db?: Database.Database
): HumanAgent {
  const conn = db ?? getDb();
  const now = new Date().toISOString();
  conn
    .prepare(
      `INSERT INTO agents (agent_id, name, capabilities, relationship, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      agent.agent_id,
      agent.name,
      JSON.stringify(agent.capabilities),
      agent.relationship || '',
      agent.status,
      now
    );
  return { ...agent, created_at: now };
}

export function getAgent(
  agentId: string,
  db?: Database.Database
): HumanAgent | undefined {
  const conn = db ?? getDb();
  const row = conn
    .prepare('SELECT * FROM agents WHERE agent_id = ?')
    .get(agentId) as AgentRow | undefined;
  return row ? rowToAgent(row) : undefined;
}

export function listAgents(db?: Database.Database): HumanAgent[] {
  const conn = db ?? getDb();
  const rows = conn.prepare('SELECT * FROM agents ORDER BY created_at').all() as AgentRow[];
  return rows.map(rowToAgent);
}

export function updateAgentStatus(
  agentId: string,
  status: AgentStatus,
  db?: Database.Database
): boolean {
  const conn = db ?? getDb();
  const result = conn
    .prepare('UPDATE agents SET status = ? WHERE agent_id = ?')
    .run(status, agentId);
  return result.changes > 0;
}

export function deleteAgent(
  agentId: string,
  db?: Database.Database
): boolean {
  const conn = db ?? getDb();
  const result = conn
    .prepare('DELETE FROM agents WHERE agent_id = ?')
    .run(agentId);
  return result.changes > 0;
}

export function listAgentsWithMetrics(
  db?: Database.Database
): AgentWithMetrics[] {
  const conn = db ?? getDb();
  const rows = conn
    .prepare(
      `SELECT
         a.*,
         COUNT(CASE WHEN t.status IN ('DISPATCHED', 'PENDING') THEN 1 END) AS active_task_count,
         AVG(
           CASE WHEN t.status = 'RESOLVED'
             THEN (julianday(t.updated_at) - julianday(t.created_at)) * 24
           END
         ) AS avg_delivery_hours
       FROM agents a
       LEFT JOIN tasks t ON a.agent_id = t.assignee_id
       GROUP BY a.agent_id
       ORDER BY a.created_at`
    )
    .all() as (AgentRow & { active_task_count: number; avg_delivery_hours: number | null })[];

  return rows.map(row => ({
    ...rowToAgent(row),
    active_task_count: row.active_task_count,
    avg_delivery_hours: row.avg_delivery_hours
      ? Math.round(row.avg_delivery_hours * 100) / 100
      : null,
  }));
}
