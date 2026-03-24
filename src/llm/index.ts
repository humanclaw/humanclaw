import type { LlmProvider, LlmProviderName } from './types.js';
import { ClaudeProvider } from './claude.js';
import { OpenAIProvider } from './openai.js';
import { getConfig } from '../models/config.js';

export interface LlmConfig {
  provider: LlmProviderName;
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export function getLlmConfig(): LlmConfig {
  // DB config takes priority over env vars
  const dbProvider = getConfig('llm_provider');
  const dbApiKey = getConfig('llm_api_key');
  const dbModel = getConfig('llm_model');
  const dbBaseUrl = getConfig('llm_base_url');

  const provider = (dbProvider || process.env.HUMANCLAW_LLM_PROVIDER || 'claude') as LlmProviderName;
  const apiKey = dbApiKey || process.env.HUMANCLAW_LLM_API_KEY || '';
  const model = dbModel || process.env.HUMANCLAW_LLM_MODEL;
  const baseUrl = dbBaseUrl || process.env.HUMANCLAW_LLM_BASE_URL;

  if (!apiKey) {
    throw new Error(
      '未配置 LLM API Key。请在 Dashboard 设置中配置，或设置环境变量 HUMANCLAW_LLM_API_KEY。'
    );
  }

  if (provider !== 'claude' && provider !== 'openai') {
    throw new Error(`不支持的 LLM 提供商: ${provider}。支持: claude, openai`);
  }

  return { provider, apiKey, model: model || undefined, baseUrl: baseUrl || undefined };
}

export function createLlmProvider(config?: LlmConfig): LlmProvider {
  const cfg = config || getLlmConfig();

  switch (cfg.provider) {
    case 'claude':
      return new ClaudeProvider(cfg.apiKey, cfg.model, cfg.baseUrl);
    case 'openai':
      return new OpenAIProvider(cfg.apiKey, cfg.model, cfg.baseUrl);
  }
}

export type { LlmProvider, LlmProviderName } from './types.js';
