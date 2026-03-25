export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmCompletionRequest {
  messages: LlmMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface LlmCompletionResponse {
  content: string;
}

export interface LlmProvider {
  complete(request: LlmCompletionRequest): Promise<LlmCompletionResponse>;
}

export type LlmApiFormat = 'openai' | 'anthropic' | 'responses';

// Backward compat alias
export type LlmProviderName = LlmApiFormat;
