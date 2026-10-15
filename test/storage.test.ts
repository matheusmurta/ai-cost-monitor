import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { tmpDir, write, claudeLine, taskFolder, raw } from './fixtures';
import { Store } from '../src/storage/db';
import { syncSources } from '../src/sync/sync';
import { finalize, estimateCost, totalTokens } from '../src/pricing/pricing';
import { toCSV } from '../src/export/export';

describe('Pricing', () => {
  it('estimates with cache categories (sonnet: 3/15/0.3/3.75 per M)', () => {
    const c = estimateCost(raw({ inputTokens: 1e6, outputTokens: 1e6, cacheReadTokens: 1e6, cacheWriteTokens: 1e6, cacheWrite5mTokens: 1e6, cacheWrite1hTokens: 0 }))!;
    expect(c.cost).toBeCloseTo(3 + 15 + 0.3 + 3.75);
  });
  it('reported cost has priority; unknown model -> unknown (never invented)', () => {
    expect(finalize(raw({ reportedCostUSD: 0.5 })).costBasis).toBe('reported');
    const u = finalize(raw({ model: 'mystery-model', provider: 'X' }));
    expect(u.costBasis).toBe('unknown'); expect(u.effectiveCostUSD).toBeNull();
  });
  it('zero reported cost stays reported 0', () => {
    const r = finalize(raw({ reportedCostUSD: 0, model: 'copilot/x' }));
    expect(r.effectiveCostUSD).toBe(0); expect(r.costBasis).toBe('reported');
  });
  it('custom pricing applies', () => {
    expect(finalize(raw({ model: 'mine', inputTokens: 1e6, outputTokens: 0 }), { mine: { input: 2, output: 4 } }).effectiveCostUSD).toBeCloseTo(2);
  });
  it('total includes cache; null when all unknown', () => {
    expect(totalTokens(raw({ cacheReadTokens: 5, cacheWriteTokens: 5 }))).toBe(2010);
    expect(totalTokens(raw({ inputTokens: null, outputTokens: null }))).toBeNull();
  });
});

describe('Sync & persistence', () => {
  it('no duplicates on re-sync/restart; picks up appends; handles truncation', async () => {
    const d = tmpDir(), proj = path.join(d, 'claude'), f = path.join(proj, 'x', 's.jsonl'), cl = path.join(d, 'cline');
    write(f, claudeLine({ id: 'a', req: '1', ts: '2026-01-01T00:00:00Z' }) + claudeLine({ id: 'a', req: '1', ts: '2026-01-01T00:00:01Z' }));
    taskFolder(cl, 't', [{ ts: 1000, info: { tokensIn: 1, tokensOut: 1, cost: 0.1 } }]);
    const locs = [{ tool: 'claude-code' as const, kind: 'claude-projects', root: proj, limitations: [] }, { tool: 'cline' as const, kind: 'cline-tasks', root: cl, limitations: [] }];
    const db = path.join(d, 'idx.sqlite');
    let s = await Store.open(db);
    const st = await syncSources(s, locs, {});
    expect(s.count()).toBe(2); expect(st[0].health).toBe('up-to-date');
    await syncSources(s, locs, {}); expect(s.count()).toBe(2);
    s.close();
    s = await Store.open(db);
    expect(s.count()).toBe(2);
    fs.appendFileSync(f, claudeLine({ id: 'b', req: '2', ts: '2026-01-01T00:05:00Z' }));
    await syncSources(s, locs, {}); expect(s.count()).toBe(3);
    taskFolder(cl, 't', [{ ts: 1000, info: { tokensIn: 1, tokensOut: 1, cost: 0.1 } }, { ts: 3000, info: { tokensIn: 2, tokensOut: 2, cost: 0.2 } }]);
    await syncSources(s, locs, {}); expect(s.count()).toBe(4);
    fs.writeFileSync(f, claudeLine({ id: 'c', req: '3', ts: '2026-01-01T00:09:00Z' }));
    await syncSources(s, locs, {});
    expect(s.all().filter(r => r.sourceTool === 'claude-code').map(r => r.messageId)).toEqual(['c']);
    s.close();
  });
  it('recovers from a corrupted index file', async () => {
    const d = tmpDir(), db = path.join(d, 'idx.sqlite'); fs.writeFileSync(db, 'garbage');
    const s = await Store.open(db); expect(s.count()).toBe(0); expect(fs.existsSync(db + '.corrupt')).toBe(true);
  });
});

describe('Export', () => {
  it('CSV escapes, guards formulas, excludes paths by default', () => {
    const r = finalize(raw({ projectId: '=cmd,"x"', workspacePath: 'C:\\secret' }));
    const csv = toCSV([r]);
    expect(csv).toContain(`"'=cmd,""x"""`); expect(csv).not.toContain('secret');
    expect(toCSV([r], true)).toContain('secret');
  });
});
