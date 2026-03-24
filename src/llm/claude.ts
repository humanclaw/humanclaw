import type { LlmProvider, LlmCompletionRequest, LlmCompletionResponse } from './types.js';

const DEFAULT_BASE_URL = 'https://api.anthropic.com';

export class ClaudeProvider implements LlmProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model?: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.model = model || 'claude-sonnet-4-20250514';
    this.baseUrl = (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
  }

  async complete(request: LlmCompletionRequest): Promise<LlmCompletionResponse> {
    const systemMessages = request.messages.filter(m => m.role === 'system');
    const nonSystemMessages = request.messages.filter(m => m.role !== 'system');

    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: request.max_tokens || 4096,
      messages: nonSystemMessages.map(m => ({ role: m.role, content: m.content })),
    };

    if (request.temperature !== undefined) {
      body.temperature = request.temperature;
    }

    if (systemMessages.length > 0) {
      body.system = systemMessages.map(m => m.content).join('\n\n');
    }

    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as { content: Array<{ type: string; text: string }> };
    const textBlock = data.content.find(c => c.type === 'text');

    if (!textBlock) {
      throw new Error('Claude API returned no text content');
    }

    return { content: textBlock.text };
  }
}
