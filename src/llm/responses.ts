import type { LlmProvider, LlmCompletionRequest, LlmCompletionResponse } from './types.js';

const DEFAULT_BASE_URL = 'https://api.openai.com';

export class ResponsesProvider implements LlmProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model?: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.model = model || 'gpt-4o';
    this.baseUrl = (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
  }

  async complete(request: LlmCompletionRequest): Promise<LlmCompletionResponse> {
    const systemMessages = request.messages.filter(m => m.role === 'system');
    const nonSystemMessages = request.messages.filter(m => m.role !== 'system');

    const input = nonSystemMessages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const body: Record<string, unknown> = {
      model: this.model,
      input,
    };

    if (systemMessages.length > 0) {
      body.instructions = systemMessages.map(m => m.content).join('\n\n');
    }

    if (request.temperature !== undefined) {
      body.temperature = request.temperature;
    }

    if (request.max_tokens) {
      body.max_output_tokens = request.max_tokens;
    }

    const response = await fetch(`${this.baseUrl}/v1/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Responses API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as {
      output: Array<{
        type: string;
        content?: Array<{ type: string; text: string }>;
      }>;
    };

    // Find the message output with output_text content
    for (const item of data.output) {
      if (item.type === 'message' && item.content) {
        const textBlock = item.content.find(c => c.type === 'output_text');
        if (textBlock) {
          return { content: textBlock.text };
        }
      }
    }

    throw new Error('Responses API returned no text content');
  }
}
