import { Router } from 'express';
import {
  listAgentsWithMetrics,
  createAgent,
  updateAgentStatus,
  deleteAgent,
} from '../models/agent.js';
import { generateId } from '../utils/trace-id.js';
import type { AgentStatus } from '../models/types.js';

const router = Router();

// GET /api/v1/nodes/status - Fleet status with metrics
router.get('/status', (_req, res) => {
  const agents = listAgentsWithMetrics();
  res.json({
    total: agents.length,
    idle: agents.filter(a => a.status === 'IDLE').length,
    busy: agents.filter(a => a.status === 'BUSY').length,
    offline: agents.filter(a => a.status === 'OFFLINE').length,
    oom: agents.filter(a => a.status === 'OOM').length,
    agents,
  });
});

// POST /api/v1/nodes - Register a new agent
router.post('/', (req, res) => {
  const { name, capabilities, relationship, status } = req.body;

  if (!name || !Array.isArray(capabilities)) {
    res.status(400).json({ error: 'name and capabilities[] are required' });
    return;
  }

  const agent = createAgent({
    agent_id: generateId('emp'),
    name,
    capabilities,
    relationship: relationship || '',
    status: (status as AgentStatus) ?? 'IDLE',
  });

  res.status(201).json(agent);
});

// PATCH /api/v1/nodes/:agent_id/status - Update agent status
router.patch('/:agent_id/status', (req, res) => {
  const { agent_id } = req.params;
  const { status } = req.body;

  const validStatuses: AgentStatus[] = ['IDLE', 'BUSY', 'OFFLINE', 'OOM'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
    return;
  }

  const updated = updateAgentStatus(agent_id, status);
  if (!updated) {
    res.status(404).json({ error: `Agent not found: ${agent_id}` });
    return;
  }

  res.json({ agent_id, status });
});

// DELETE /api/v1/nodes/:agent_id
router.delete('/:agent_id', (req, res) => {
  const { agent_id } = req.params;
  const deleted = deleteAgent(agent_id);
  if (!deleted) {
    res.status(404).json({ error: `Agent not found: ${agent_id}` });
    return;
  }
  res.json({ deleted: agent_id });
});

export default router;
