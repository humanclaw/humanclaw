import { Router } from 'express';
import {
  createTeam,
  listTeams,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  updateTeamMemberRelationship,
  getTeamWithMembers,
} from '../models/team.js';
import { getAgent } from '../models/agent.js';
import { generateId } from '../utils/trace-id.js';

const router = Router();

// GET /api/v1/teams - List all teams with members
router.get('/', (_req, res) => {
  const teams = listTeams();
  const teamsWithMembers = teams.map(t => {
    const full = getTeamWithMembers(t.team_id);
    return full || { ...t, members: [] };
  });
  res.json({ teams: teamsWithMembers });
});

// GET /api/v1/teams/:id - Get team with members
router.get('/:id', (req, res) => {
  const team = getTeamWithMembers(req.params.id);
  if (!team) {
    res.status(404).json({ error: `团队不存在: ${req.params.id}` });
    return;
  }
  res.json(team);
});

// POST /api/v1/teams - Create team
router.post('/', (req, res) => {
  const { name, description } = req.body;

  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'name is required' });
    return;
  }

  const team = createTeam({
    team_id: generateId('team'),
    name,
    description: description || '',
  });

  res.status(201).json(team);
});

// DELETE /api/v1/teams/:id - Delete team
router.delete('/:id', (req, res) => {
  const deleted = deleteTeam(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: `团队不存在: ${req.params.id}` });
    return;
  }
  res.json({ deleted: req.params.id });
});

// POST /api/v1/teams/:id/members - Add member to team
router.post('/:id/members', (req, res) => {
  const { agent_id, relationship } = req.body;

  if (!agent_id || typeof agent_id !== 'string') {
    res.status(400).json({ error: 'agent_id is required' });
    return;
  }

  const agent = getAgent(agent_id);
  if (!agent) {
    res.status(404).json({ error: `Agent 不存在: ${agent_id}` });
    return;
  }

  try {
    addTeamMember(req.params.id, agent_id, relationship || '');
    res.status(201).json({ team_id: req.params.id, agent_id, relationship: relationship || '' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// DELETE /api/v1/teams/:id/members/:agent_id - Remove member
router.delete('/:id/members/:agent_id', (req, res) => {
  const removed = removeTeamMember(req.params.id, req.params.agent_id);
  if (!removed) {
    res.status(404).json({ error: '成员不在该团队中' });
    return;
  }
  res.json({ removed: req.params.agent_id, team_id: req.params.id });
});

// PUT /api/v1/teams/:id/members/:agent_id - Update member relationship
router.put('/:id/members/:agent_id', (req, res) => {
  const { relationship } = req.body;

  if (relationship === undefined || typeof relationship !== 'string') {
    res.status(400).json({ error: 'relationship is required' });
    return;
  }

  const updated = updateTeamMemberRelationship(req.params.id, req.params.agent_id, relationship);
  if (!updated) {
    res.status(404).json({ error: '成员不在该团队中' });
    return;
  }
  res.json({ team_id: req.params.id, agent_id: req.params.agent_id, relationship });
});

export default router;
