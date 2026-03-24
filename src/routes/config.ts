import { Router } from 'express';
import { getConfig, setConfig, deleteConfig } from '../models/config.js';

const router = Router();

// GET /api/v1/config - Get LLM config (masks API key)
router.get('/', (_req, res) => {
  const provider = getConfig('llm_provider') || process.env.HUMANCLAW_LLM_PROVIDER || 'claude';
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
  });
});

// PUT /api/v1/config - Update LLM config
router.put('/', (req, res) => {
  const { provider, api_key, model, base_url } = req.body as {
    provider?: string;
    api_key?: string;
    model?: string;
    base_url?: string;
  };

  if (provider !== undefined) {
    if (provider !== 'claude' && provider !== 'openai') {
      res.status(400).json({ error: '不支持的提供商，支持: claude, openai' });
      return;
    }
    setConfig('llm_provider', provider);
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

  res.json({ ok: true });
});

export default router;
