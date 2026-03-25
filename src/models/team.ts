import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';
import type {
  Team,
  TeamRow,
  TeamMember,
  TeamMemberRow,
  TeamWithMembers,
  AgentStatus,
} from './types.js';

export function createTeam(
  team: Omit<Team, 'created_at'>,
  db?: Database.Database
): Team {
  const conn = db ?? getDb();
  const now = new Date().toISOString();
  conn
    .prepare(
      `INSERT INTO teams (team_id, name, description, created_at)
       VALUES (?, ?, ?, ?)`
    )
    .run(team.team_id, team.name, team.description || '', now);
  return { ...team, description: team.description || '', created_at: now };
}

export function getTeam(
  teamId: string,
  db?: Database.Database
): Team | undefined {
  const conn = db ?? getDb();
  const row = conn
    .prepare('SELECT * FROM teams WHERE team_id = ?')
    .get(teamId) as TeamRow | undefined;
  return row || undefined;
}

export function listTeams(db?: Database.Database): Team[] {
  const conn = db ?? getDb();
  return conn
    .prepare('SELECT * FROM teams ORDER BY created_at')
    .all() as TeamRow[];
}

export function deleteTeam(
  teamId: string,
  db?: Database.Database
): boolean {
  const conn = db ?? getDb();
  const result = conn
    .prepare('DELETE FROM teams WHERE team_id = ?')
    .run(teamId);
  return result.changes > 0;
}

export function addTeamMember(
  teamId: string,
  agentId: string,
  relationship: string,
  db?: Database.Database
): void {
  const conn = db ?? getDb();
  conn
    .prepare(
      `INSERT OR REPLACE INTO team_members (team_id, agent_id, relationship)
       VALUES (?, ?, ?)`
    )
    .run(teamId, agentId, relationship || '');
}

export function removeTeamMember(
  teamId: string,
  agentId: string,
  db?: Database.Database
): boolean {
  const conn = db ?? getDb();
  const result = conn
    .prepare('DELETE FROM team_members WHERE team_id = ? AND agent_id = ?')
    .run(teamId, agentId);
  return result.changes > 0;
}

export function updateTeamMemberRelationship(
  teamId: string,
  agentId: string,
  relationship: string,
  db?: Database.Database
): boolean {
  const conn = db ?? getDb();
  const result = conn
    .prepare(
      'UPDATE team_members SET relationship = ? WHERE team_id = ? AND agent_id = ?'
    )
    .run(relationship, teamId, agentId);
  return result.changes > 0;
}

export function getTeamWithMembers(
  teamId: string,
  db?: Database.Database
): TeamWithMembers | undefined {
  const conn = db ?? getDb();
  const team = getTeam(teamId, conn);
  if (!team) return undefined;

  const members = conn
    .prepare(
      `SELECT tm.team_id, tm.agent_id, tm.relationship, a.name AS agent_name, a.status AS agent_status
       FROM team_members tm
       JOIN agents a ON tm.agent_id = a.agent_id
       WHERE tm.team_id = ?
       ORDER BY a.created_at`
    )
    .all(teamId) as (TeamMemberRow & { agent_name: string; agent_status: AgentStatus })[];

  return { ...team, members };
}

export function listTeamsByAgent(
  agentId: string,
  db?: Database.Database
): (Team & { relationship: string })[] {
  const conn = db ?? getDb();
  return conn
    .prepare(
      `SELECT t.*, tm.relationship
       FROM teams t
       JOIN team_members tm ON t.team_id = tm.team_id
       WHERE tm.agent_id = ?
       ORDER BY t.created_at`
    )
    .all(agentId) as (TeamRow & { relationship: string })[];
}

export function getTeamMemberRelationship(
  teamId: string,
  agentId: string,
  db?: Database.Database
): string | undefined {
  const conn = db ?? getDb();
  const row = conn
    .prepare(
      'SELECT relationship FROM team_members WHERE team_id = ? AND agent_id = ?'
    )
    .get(teamId, agentId) as { relationship: string } | undefined;
  return row?.relationship;
}
