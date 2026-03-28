import { Router } from 'express';
import { getConfig, setConfig, deleteConfig } from '../models/config.js';
import { getDb } from '../db/connection.js';
import { createAgent } from '../models/agent.js';
import { createTeam, addTeamMember } from '../models/team.js';
import { generateId } from '../utils/trace-id.js';
import { DEMOS } from '../utils/demos.js';

const router = Router();

// GET /api/v1/config - Get LLM config (masks API key)
router.get('/', (_req, res) => {
  const rawProvider = getConfig('llm_provider') || process.env.HUMANCLAW_LLM_PROVIDER || 'anthropic';
  const provider = rawProvider === 'claude' ? 'anthropic' : rawProvider;
  const apiKey = getConfig('llm_api_key') || process.env.HUMANCLAW_LLM_API_KEY || '';
  const model = getConfig('llm_model') || process.env.HUMANCLAW_LLM_MODEL || '';
  const baseUrl = getConfig('llm_base_url') || process.env.HUMANCLAW_LLM_BASE_URL || '';

  const keySource = getConfig('llm_api_key') ? 'dashboard' : (process.env.HUMANCLAW_LLM_API_KEY ? 'env' : 'none');

  res.json({
    provider,
    api_key_set: apiKey.length > 0,
    api_key_masked: apiKey ? apiKey.slice(0, 8) + '...' + apiKey.slice(-4) : '',
    api_key_source: keySource,
    model,
    base_url: baseUrl,
    respect_level: getConfig('respect_level') ?? 'high',
  });
});

// PUT /api/v1/config - Update LLM config
router.put('/', (req, res) => {
  const { provider, api_key, model, base_url, respect_level } = req.body as {
    provider?: string;
    api_key?: string;
    model?: string;
    base_url?: string;
    respect_level?: string;
  };

  if (provider !== undefined) {
    // Backward compat: 'claude' -> 'anthropic'
    const normalized = provider === 'claude' ? 'anthropic' : provider;
    const validFormats = ['openai', 'anthropic', 'responses'];
    if (!validFormats.includes(normalized)) {
      res.status(400).json({ error: `不支持的 API 格式。支持: ${validFormats.join(', ')}` });
      return;
    }
    setConfig('llm_provider', normalized);
  }

  if (api_key !== undefined) {
    if (api_key === '') {
      deleteConfig('llm_api_key');
    } else {
      setConfig('llm_api_key', api_key);
    }
  }

  if (model !== undefined) {
    if (model === '') {
      deleteConfig('llm_model');
    } else {
      setConfig('llm_model', model);
    }
  }

  if (base_url !== undefined) {
    if (base_url === '') {
      deleteConfig('llm_base_url');
    } else {
      setConfig('llm_base_url', base_url);
    }
  }

  if (respect_level !== undefined) {
    const valid = ['high', 'medium', 'low'];
    if (!valid.includes(respect_level)) {
      res.status(400).json({ error: `无效的 respect_level。可选: ${valid.join(', ')}` });
      return;
    }
    setConfig('respect_level', respect_level);
  }

  res.json({ ok: true });
});

// POST /api/v1/config/reset - Clear all data (agents, jobs, tasks, teams, evaluations)
router.post('/reset', (_req, res) => {
  const db = getDb();
  db.exec(`
    DELETE FROM evaluations;
    DELETE FROM team_members;
    DELETE FROM tasks;
    DELETE FROM jobs;
    DELETE FROM teams;
    DELETE FROM agents;
  `);
  res.json({ ok: true });
});

// POST /api/v1/config/reset-to-demo - Clear all data and load a demo scenario
router.post('/reset-to-demo', (req, res) => {
  const { demo } = req.body as { demo?: string };

  if (!demo || !DEMOS[demo]) {
    res.status(400).json({ error: `未知 Demo: ${demo}。可选: ${Object.keys(DEMOS).join(', ')}` });
    return;
  }

  const db = getDb();
  db.exec(`
    DELETE FROM evaluations;
    DELETE FROM team_members;
    DELETE FROM tasks;
    DELETE FROM jobs;
    DELETE FROM teams;
    DELETE FROM agents;
  `);

  const scenario = DEMOS[demo];
  const nameToId: Record<string, string> = {};

  for (const a of scenario.agents) {
    const agent = createAgent({
      agent_id: generateId('emp'),
      name: a.name,
      capabilities: a.capabilities,
      relationship: a.relationship,
      status: 'IDLE',
    }, db);
    nameToId[a.name] = agent.agent_id;
  }

  for (const t of scenario.teams) {
    const team = createTeam({
      team_id: generateId('team'),
      name: t.name,
      description: t.description,
    }, db);

    for (const memberName of t.members) {
      const agentId = nameToId[memberName];
      if (agentId) {
        addTeamMember(team.team_id, agentId, t.relationships[memberName] ?? '', db);
      }
    }
  }

  res.json({ ok: true, demo, agents_created: scenario.agents.length });
});

export default router;
