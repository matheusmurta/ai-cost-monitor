import { describe, it, expect } from 'vitest';
import { createRecordId, DedupSet } from '../src/core/dedup';
import { UsageRecord } from '../src/models/usage-record';

function record(overrides: Partial<UsageRecord> = {}): UsageRecord {
  const base: UsageRecord = {
    id: '',
    provider: 'cline',
    timestamp: '2026-09-13T14:32:00Z',
    model: 'claude',
    tokensIn: 100,
    tokensOut: 50,
    totalTokens: 150,
    costUsd: 0.1,
    sourceFile: 'task.json',
  };
  const rec = { ...base, ...overrides };
  rec.id = createRecordId([rec.provider, rec.sourceFile, rec.timestamp, rec.tokensIn, rec.tokensOut, rec.costUsd, rec.model]);
  return rec;
}

describe('dedup', () => {
  it('gera IDs determinísticos para o mesmo evento', () => {
    const a = record();
    const b = record();
    expect(a.id).toBe(b.id);
  });

  it('gera IDs diferentes para eventos diferentes', () => {
    const a = record();
    const b = record({ tokensIn: 999 });
    expect(a.id).not.toBe(b.id);
  });

  it('mesmo evento duas vezes é contabilizado somente uma vez', () => {
    const set = new DedupSet();
    const r = record();

    const first = set.filterNew([r]);
    const second = set.filterNew([r, record()]);

    expect(first).toHaveLength(1);
    // Apenas o registro NOVO (o segundo record é idêntico ao primeiro)
    expect(second).toHaveLength(0);
  });

  it('novos eventos distintos continuam passando', () => {
    const set = new DedupSet();
    const a = record({ tokensIn: 1 });
    const b = record({ tokensIn: 2 });

    expect(set.filterNew([a, b])).toHaveLength(2);
  });
});
