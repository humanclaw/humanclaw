import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema.js';
import { createAgent } from '../../src/models/agent.js';
import {
  createTeam,
  getTeam,
  listTeams,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  updateTeamMemberRelationship,
  getTeamWithMembers,
  listTeamsByAgent,
  getTeamMemberRelationship,
} from '../../src/models/team.js';

function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

describe('Team Model', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
    createAgent({ agent_id: 'emp_001', name: 'Alice', capabilities: ['frontend'], status: 'IDLE' }, db);
    createAgent({ agent_id: 'emp_002', name: 'Bob', capabilities: ['backend'], status: 'BUSY' }, db);
    createAgent({ agent_id: 'emp_003', name: 'Charlie', capabilities: ['design'], status: 'IDLE' }, db);
  });

  it('should create and retrieve a team', () => {
    const team = createTeam({ team_id: 'team_001', name: 'Frontend Team', description: 'UI folks' }, db);
    expect(team.team_id).toBe('team_001');
    expect(team.name).toBe('Frontend Team');

    const retrieved = getTeam('team_001', db);
    expect(retrieved).toBeDefined();
    expect(retrieved!.name).toBe('Frontend Team');
  });

  it('should list all teams', () => {
    createTeam({ team_id: 'team_001', name: 'A', description: '' }, db);
    createTeam({ team_id: 'team_002', name: 'B', description: '' }, db);

    const teams = listTeams(db);
    expect(teams).toHaveLength(2);
  });

  it('should delete a team', () => {
    createTeam({ team_id: 'team_001', name: 'A', description: '' }, db);
    expect(deleteTeam('team_001', db)).toBe(true);
    expect(getTeam('team_001', db)).toBeUndefined();
  });

  it('should return false when deleting non-existent team', () => {
    expect(deleteTeam('nonexistent', db)).toBe(false);
  });

  it('should add and remove team members', () => {
    createTeam({ team_id: 'team_001', name: 'A', description: '' }, db);
    addTeamMember('team_001', 'emp_001', '前端骨干', db);
    addTeamMember('team_001', 'emp_002', '后端支援', db);

    const team = getTeamWithMembers('team_001', db);
    expect(team).toBeDefined();
    expect(team!.members).toHaveLength(2);
    expect(team!.members[0].agent_id).toBe('emp_001');
    expect(team!.members[0].relationship).toBe('前端骨干');

    expect(removeTeamMember('team_001', 'emp_001', db)).toBe(true);
    const updated = getTeamWithMembers('team_001', db);
    expect(updated!.members).toHaveLength(1);
  });

  it('should update member relationship', () => {
    createTeam({ team_id: 'team_001', name: 'A', description: '' }, db);
    addTeamMember('team_001', 'emp_001', 'old relationship', db);

    expect(updateTeamMemberRelationship('team_001', 'emp_001', 'new relationship', db)).toBe(true);
    const rel = getTeamMemberRelationship('team_001', 'emp_001', db);
    expect(rel).toBe('new relationship');
  });

  it('should list teams by agent', () => {
    createTeam({ team_id: 'team_001', name: 'A', description: '' }, db);
    createTeam({ team_id: 'team_002', name: 'B', description: '' }, db);
    addTeamMember('team_001', 'emp_001', 'rel1', db);
    addTeamMember('team_002', 'emp_001', 'rel2', db);

    const teams = listTeamsByAgent('emp_001', db);
    expect(teams).toHaveLength(2);
  });

  it('should cascade delete members when team is deleted', () => {
    createTeam({ team_id: 'team_001', name: 'A', description: '' }, db);
    addTeamMember('team_001', 'emp_001', '', db);

    deleteTeam('team_001', db);
    const teams = listTeamsByAgent('emp_001', db);
    expect(teams).toHaveLength(0);
  });

  it('should return undefined for non-existent team with members', () => {
    expect(getTeamWithMembers('nonexistent', db)).toBeUndefined();
  });

  it('should return null for non-member relationship', () => {
    createTeam({ team_id: 'team_001', name: 'A', description: '' }, db);
    const rel = getTeamMemberRelationship('team_001', 'emp_001', db);
    expect(rel).toBeUndefined();
  });
});
