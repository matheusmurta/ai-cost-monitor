import { describe, it, expect } from 'vitest';
import { parseClaudeJsonl } from '../src/providers/claude-code/claude-code-parser';

describe('claude-code-parser', () => {
  it('parseia JSONL válido com usage aninhado em message', () => {
    const line = JSON.stringify({
      type: 'assistant',
      message: { usage: { input_tokens: 1500, output_tokens: 500 } },
      model: 'claude-3-5-sonnet-20241022',
      timestamp: '2026-09-13T14:32:00Z',
    });
    const result = parseClaudeJsonl(line, 'session.jsonl');

    expect(result.events).toHaveLength(1);
    expect(result.events[0].tokensIn).toBe(1500);
    expect(result.events[0].tokensOut).toBe(500);
    expect(result.events[0].model).toBe('claude-3-5-sonnet-20241022');
    expect(result.events[0].timestamp).toBe('2026-09-13T14:32:00Z');
  });

  it('parseia usage no topo', () => {
    const line = JSON.stringify({
      usage: { input_tokens: 100, output_tokens: 200 },
    });
    const result = parseClaudeJsonl(line, 'session.jsonl');
    expect(result.events).toHaveLength(1);
    expect(result.events[0].tokensIn).toBe(100);
    expect(result.events[0].tokensOut).toBe(200);
  });

  it('processa múltiplas linhas e ignora linhas sem usage', () => {
    const lines = [
      JSON.stringify({ type: 'system', message: 'não é uso' }),
      JSON.stringify({ usage: { input_tokens: 10, output_tokens: 20 } }),
      JSON.stringify({ type: 'usage' }),
      JSON.stringify({ usage: { input_tokens: 30, output_tokens: 40 } }),
    ].join('\n');

    const result = parseClaudeJsonl(lines, 'session.jsonl');
    expect(result.events).toHaveLength(2);
    expect(result.events.map((e) => e.tokensIn)).toEqual([10, 30]);
  });

  it('ignora linha com usage sem nenhum token', () => {
    const line = JSON.stringify({ usage: { foo: 1 } });
    const result = parseClaudeJsonl(line, 'session.jsonl');
    expect(result.events).toHaveLength(0);
  });

  it('extrai cache tokens', () => {
    const line = JSON.stringify({
      usage: {
        input_tokens: 100,
        output_tokens: 200,
        cache_creation_input_tokens: 5,
        cache_read_input_tokens: 50,
      },
    });
    const result = parseClaudeJsonl(line, 'session.jsonl');
    expect(result.events).toHaveLength(1);
    expect(result.events[0].cacheWriteTokens).toBe(5);
    expect(result.events[0].cacheReadTokens).toBe(50);
    expect(result.events[0].cachedTokens).toBe(55);
  });

  it('conta JSON inválido como malformed sem quebrar', () => {
    const lines = ['{ isso não é json', JSON.stringify({ usage: { input_tokens: 1, output_tokens: 1 } })].join(
      '\n',
    );
    expect(() => parseClaudeJsonl(lines, 'session.jsonl')).not.toThrow();
    const result = parseClaudeJsonl(lines, 'session.jsonl');
    expect(result.malformed).toBe(1);
    expect(result.events).toHaveLength(1);
  });

  it('preserva modelo desconhecido (custo é resolvido depois)', () => {
    const line = JSON.stringify({
      usage: { input_tokens: 1, output_tokens: 1 },
      model: 'some-future-model',
    });
    const result = parseClaudeJsonl(line, 'session.jsonl');
    expect(result.events).toHaveLength(1);
    expect(result.events[0].model).toBe('some-future-model');
  });
});
