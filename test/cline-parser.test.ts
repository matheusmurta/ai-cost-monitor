import { describe, it, expect } from 'vitest';
import {
  parseClineContent,
  extractApiReqResValues,
  extractUsage,
} from '../src/providers/cline/cline-parser';

describe('cline-parser', () => {
  it('parse JSON válido com api_req_res como string JSON', () => {
    const content = JSON.stringify({
      api_req_res: JSON.stringify({ tokensIn: 1234, tokensOut: 567, cost: 0.0123 }),
    });
    const result = parseClineContent(content, 'task.json');

    expect(result.records).toHaveLength(1);
    const rec = result.records[0];
    expect(rec.provider).toBe('cline');
    expect(rec.tokensIn).toBe(1234);
    expect(rec.tokensOut).toBe(567);
    expect(rec.totalTokens).toBe(1801);
    expect(rec.costUsd).toBeCloseTo(0.0123);
    expect(rec.id).toBeTruthy();
  });

  it('aceita api_req_res já como objeto', () => {
    const content = JSON.stringify({
      api_req_res: { tokensIn: 10, tokensOut: 20, cost: 0.5 },
    });
    const result = parseClineContent(content, 'task.json');

    expect(result.records).toHaveLength(1);
    expect(result.records[0].tokensIn).toBe(10);
    expect(result.records[0].tokensOut).toBe(20);
    expect(result.records[0].costUsd).toBeCloseTo(0.5);
  });

  it('extrai múltiplos registros do mesmo arquivo', () => {
    const content = JSON.stringify({
      history: [
        { api_req_res: JSON.stringify({ tokensIn: 1, tokensOut: 2, cost: 0.001 }) },
        { api_req_res: JSON.stringify({ tokensIn: 3, tokensOut: 4, cost: 0.002 }) },
      ],
    });
    const result = parseClineContent(content, 'task.json');

    expect(result.records).toHaveLength(2);
    expect(result.records.map((r) => r.tokensIn)).toEqual([1, 3]);
  });

  it('não quebra com JSON inválido', () => {
    expect(() => parseClineContent('isso não é json {', 'task.json')).not.toThrow();
    const result = parseClineContent('isso não é json {', 'task.json');
    expect(result.records).toHaveLength(0);
  });

  it('conta entrada sem tokens como malformed', () => {
    const content = JSON.stringify({ api_req_res: JSON.stringify({ foo: 1 }) });
    const result = parseClineContent(content, 'task.json');

    expect(result.records).toHaveLength(0);
    expect(result.malformed).toBe(1);
  });

  it('cost ausente resulta em costUsd 0 sem quebrar', () => {
    const content = JSON.stringify({
      api_req_res: JSON.stringify({ tokensIn: 10, tokensOut: 5 }),
    });
    const result = parseClineContent(content, 'task.json');

    expect(result.records).toHaveLength(1);
    expect(result.records[0].costUsd).toBe(0);
  });

  it('valores numéricos armazenados como string', () => {
    const content = JSON.stringify({
      api_req_res: JSON.stringify({ tokensIn: '100', tokensOut: '50', cost: '0.02' }),
    });
    const result = parseClineContent(content, 'task.json');

    expect(result.records).toHaveLength(1);
    expect(result.records[0].tokensIn).toBe(100);
    expect(result.records[0].tokensOut).toBe(50);
    expect(result.records[0].costUsd).toBeCloseTo(0.02);
  });

  it('suporta tokens aninhados em usage', () => {
    const content = JSON.stringify({
      api_req_res: JSON.stringify({
        usage: { input_tokens: 10, output_tokens: 20 },
        cost: 0.005,
      }),
    });
    const result = parseClineContent(content, 'task.json');

    expect(result.records).toHaveLength(1);
    expect(result.records[0].tokensIn).toBe(10);
    expect(result.records[0].tokensOut).toBe(20);
    expect(result.records[0].costUsd).toBeCloseTo(0.005);
  });
});

describe('cline-parser helpers', () => {
  it('extractApiReqResValues via regex em arquivo parcial', () => {
    const partial = '{"api_req_res": "{\\"tokensIn\\":7,\\"tokensOut\\":8,\\"cost\\":0.003}"}';
    const values = extractApiReqResValues(partial);
    expect(values.length).toBeGreaterThanOrEqual(1);
  });

  it('extractUsage retorna undefined para payload sem tokens', () => {
    expect(extractUsage({ foo: 'bar' })).toBeUndefined();
    expect(extractUsage(null)).toBeUndefined();
  });

  it('extractUsage lida com valores nulos', () => {
    const usage = extractUsage({ tokensIn: null, tokensOut: 5, cost: null });
    expect(usage).toBeDefined();
    expect(usage!.tokensIn).toBe(0);
    expect(usage!.tokensOut).toBe(5);
    expect(usage!.costUsd).toBeUndefined();
  });
});

describe('cline-parser (resumo de sessão v3)', () => {
  it('extrai tokens/custo/modelo do resumo de sessão', () => {
    const content = JSON.stringify({
      version: 1,
      session_id: '123_abc',
      model: 'ignored',
      started_at: '2026-09-13T17:21:46.364Z',
      metadata: {
        totalCost: 1.03897948665,
        usage: {
          inputTokens: 6289400,
          outputTokens: 102270,
          cacheReadTokens: 6018947,
          cacheWriteTokens: 0,
          totalCost: 1.017841845865,
        },
        modelId: 'cline-pass/deepseek-v4-pro',
      },
    });
    const result = parseClineContent(content, '123_abc.json');

    expect(result.records).toHaveLength(1);
    const rec = result.records[0];
    expect(rec.provider).toBe('cline');
    expect(rec.tokensIn).toBe(6289400);
    expect(rec.tokensOut).toBe(102270);
    expect(rec.cachedTokens).toBe(6018947);
    expect(rec.costUsd).toBeCloseTo(1.03897948665);
    expect(rec.model).toBe('cline-pass/deepseek-v4-pro');
    expect(rec.totalTokens).toBe(6289400 + 102270);
  });

  it('usa aggregateUsage como fallback do usage', () => {
    const content = JSON.stringify({
      session_id: 'x',
      metadata: {
        aggregateUsage: { inputTokens: 100, outputTokens: 50, totalCost: 0.01 },
      },
    });
    const result = parseClineContent(content, 'x.json');
    expect(result.records[0].tokensIn).toBe(100);
    expect(result.records[0].costUsd).toBeCloseTo(0.01);
  });

  it('gera ID estável para a mesma sessão mesmo com custo diferente', () => {
    const make = (cost: number) =>
      JSON.stringify({
        session_id: 's1',
        started_at: '2026-09-13T17:00:00Z',
        metadata: { totalCost: cost, usage: { inputTokens: 10, outputTokens: 5 } },
      });
    const a = parseClineContent(make(0.1), 's1.json').records[0];
    const b = parseClineContent(make(0.2), 's1.json').records[0];

    expect(a.id).toBe(b.id);
    expect(a.costUsd).toBeCloseTo(0.1);
    expect(b.costUsd).toBeCloseTo(0.2);
  });
});
