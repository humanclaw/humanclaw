import { describe, it, expect } from 'vitest';
import { ResponsesProvider } from '../../src/llm/responses.js';

describe('Responses API Provider', () => {
  it('should construct with correct defaults', () => {
    const provider = new ResponsesProvider('test-key');
    expect(provider).toBeDefined();
  });

  it('should construct with custom model and base URL', () => {
    const provider = new ResponsesProvider('test-key', 'custom-model', 'https://custom.api.com');
    expect(provider).toBeDefined();
  });
});
