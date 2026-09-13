import { describe, it, expect } from 'vitest';
import { AggregationService, summarizeRecords } from '../src/core/aggregation-service';
import { createRecordId } from '../src/core/dedup';
import { UsageRecord } from '../src/models/usage-record';

function record(overrides: Partial<UsageRecord> = {}): UsageRecord {
  const base: UsageRecord = {
    id: '',
    provider: 'cline',
    timestamp: '2026-09-13T14:32:00Z',
    model: 'claude-3-5-sonnet',
    tokensIn: 1000,
    tokensOut: 500,
    totalTokens: 1500,
    costUsd: 1.0,
    sourceFile: 'task.json',
  };
  const rec = { ...base, ...overrides };
  rec.totalTokens = rec.tokensIn + rec.tokensOut;
  rec.id = createRecordId([
    rec.provider,
    rec.sourceFile,
    rec.timestamp,
    rec.tokensIn,
    rec.tokensOut,
    rec.costUsd,
    rec.model,
  ]);
  return rec;
}

describe('aggregation-service', () => {
  it('agrega totais por provider e por modelo', () => {
    const records = [
      record({ provider: 'cline', tokensIn: 1000, tokensOut: 500, costUsd: 1.5 }),
      record({ provider: 'cline', tokensIn: 2000, tokensOut: 500, costUsd: 2.5 }),
      record({
        provider: 'claude-code',
        model: 'claude-3-7-sonnet',
        tokensIn: 3000,
        tokensOut: 1000,
        costUsd: 4.0,
      }),
    ];
    const summary = summarizeRecords(records);

    expect(summary.totalRecords).toBe(3);
    expect(summary.totalTokensIn).toBe(6000);
    expect(summary.totalTokensOut).toBe(2000);
    expect(summary.totalTokens).toBe(8000);
    expect(summary.totalCostUsd).toBeCloseTo(8.0);

    expect(summary.byProvider['cline'].costUsd).toBeCloseTo(4.0);
    expect(summary.byProvider['claude-code'].costUsd).toBeCloseTo(4.0);
    expect(summary.byModel['claude-3-5-sonnet'].costUsd).toBeCloseTo(4.0);
    expect(summary.byModel['claude-3-7-sonnet'].costUsd).toBeCloseTo(4.0);
  });

  it('é idempotente: processar o mesmo conjunto duas vezes não duplica', () => {
    const records = [record({ tokensIn: 1000, tokensOut: 500, costUsd: 1.5 })];

    const service = new AggregationService();
    const first = service.ingest(records);
    const second = service.ingest(records);

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(0);
    expect(service.getAll()).toHaveLength(1);
    expect(service.summarize().totalRecords).toBe(1);
    expect(service.summarize().totalCostUsd).toBeCloseTo(1.5);
  });

  it('modelo ausente cai em Unknown', () => {
    const summary = summarizeRecords([record({ model: undefined })]);
    expect(summary.byModel['Unknown']).toBeDefined();
    expect(summary.byModel['Unknown'].records).toBe(1);
  });

  it('faz upsert: mesmo id com conteúdo diferente substitui (não duplica)', () => {
    const service = new AggregationService();
    const a = record({ tokensIn: 100, tokensOut: 50, costUsd: 0.1 });
    const updated: UsageRecord = {
      ...a,
      tokensIn: 200,
      tokensOut: 100,
      totalTokens: 300,
      costUsd: 0.2,
    };

    service.ingest([a]);
    const changed = service.ingest([updated]);

    expect(changed).toHaveLength(1);
    expect(service.getAll()).toHaveLength(1);
    expect(service.summarize().totalTokensIn).toBe(200);
    expect(service.summarize().totalCostUsd).toBeCloseTo(0.2);
  });
});
