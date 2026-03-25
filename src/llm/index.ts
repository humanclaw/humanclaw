import type { LlmProvider, LlmApiFormat } from './types.js';
import { ClaudeProvider } from './claude.js';
import { OpenAIProvider } from './openai.js';
import { ResponsesProvider } from './responses.js';
import { getConfig } from '../models/config.js';

export interface LlmConfig {
  provider: LlmApiFormat;
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

function normalizeProvider(raw: string): LlmApiFormat {
  // Backward compat: 'claude' -> 'anthropic'
  if (raw === 'claude') return 'anthropic';
  return raw as LlmApiFormat;
}

export function getLlmConfig(): LlmConfig {
  // DB config takes priority over env vars
  const dbProvider = getConfig('llm_provider');
  const dbApiKey = getConfig('llm_api_key');
  const dbModel = getConfig('llm_model');
  const dbBaseUrl = getConfig('llm_base_url');

  const rawProvider = dbProvider || process.env.HUMANCLAW_LLM_PROVIDER || 'anthropic';
  const provider = normalizeProvider(rawProvider);
  const apiKey = dbApiKey || process.env.HUMANCLAW_LLM_API_KEY || '';
  const model = dbModel || process.env.HUMANCLAW_LLM_MODEL;
  const baseUrl = dbBaseUrl || process.env.HUMANCLAW_LLM_BASE_URL;

  if (!apiKey) {
    throw new Error(
      '未配置 LLM API Key。请在 Dashboard 设置中配置，或设置环境变量 HUMANCLAW_LLM_API_KEY。'
    );
  }

  const validFormats: LlmApiFormat[] = ['openai', 'anthropic', 'responses'];
  if (!validFormats.includes(provider)) {
    throw new Error(`不支持的 API 格式: ${provider}。支持: openai, anthropic, responses`);
  }

  return { provider, apiKey, model: model || undefined, baseUrl: baseUrl || undefined };
}

export function createLlmProvider(config?: LlmConfig): LlmProvider {
  const cfg = config || getLlmConfig();

  switch (cfg.provider) {
    case 'anthropic':
      return new ClaudeProvider(cfg.apiKey, cfg.model, cfg.baseUrl);
    case 'openai':
      return new OpenAIProvider(cfg.apiKey, cfg.model, cfg.baseUrl);
    case 'responses':
      return new ResponsesProvider(cfg.apiKey, cfg.model, cfg.baseUrl);
  }
}

export type { LlmProvider, LlmApiFormat, LlmProviderName } from './types.js';
