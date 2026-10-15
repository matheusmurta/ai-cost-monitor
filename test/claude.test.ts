import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { tmpDir, write, claudeLine } from './fixtures';
import { claudeCodeAdapter } from '../src/adapters/claudeCode';
import { discover } from '../src/discovery/discovery';
import { SourceLocation } from '../src/core/types';

const loc = (root: string): SourceLocation => ({ tool: 'claude-code', kind: 'claude-projects', root, limitations: [] });

describe('Claude Code adapter', () => {
  it('dedups streaming lines by message.id+requestId (last wins) and skips <synthetic>', async () => {
    const d = tmpDir(), f = path.join(d, 'proj', 's1.jsonl');
    write(f, claudeLine({ id: 'm1', req: 'r1', ts: '2026-01-01T00:00:00Z', out: 1 }) + claudeLine({ id: 'm1', req: 'r1', ts: '2026-01-01T00:00:01Z', out: 50, cr: 100, cw: 20 })
      + claudeLine({ id: 'm2', req: 'r2', ts: '2026-01-01T00:01:00Z' }) + claudeLine({ id: 'm3', req: 'r3', ts: '2026-01-01T00:02:00Z', model: '<synthetic>' }));
    const r = await claudeCodeAdapter.parseFile(f, loc(d), 0);
    expect(r.requests).toHaveLength(2);
    const m1 = r.requests.find(x => x.messageId === 'm1')!;
    expect(m1.outputTokens).toBe(50); expect(m1.cacheReadTokens).toBe(100); expect(m1.cacheWrite5mTokens).toBe(20);
    expect(m1.projectId).toBe('api-service'); expect(m1.provider).toBe('Anthropic'); expect(m1.reportedCostUSD).toBeNull();
  });
  it('leaves a partial trailing line for the next sync and resumes from offset', async () => {
    const d = tmpDir(), f = path.join(d, 'p', 's.jsonl');
    const full = claudeLine({ id: 'a', req: 'r', ts: '2026-01-01T00:00:00Z' });
    const partial = claudeLine({ id: 'b', req: 'r2', ts: '2026-01-01T00:00:00Z' });
    write(f, full + partial.slice(0, 40));
    const r1 = await claudeCodeAdapter.parseFile(f, loc(d), 0);
    expect(r1.requests).toHaveLength(1); expect(r1.newOffset).toBe(Buffer.byteLength(full));
    fs.appendFileSync(f, partial.slice(40));
    const r2 = await claudeCodeAdapter.parseFile(f, loc(d), r1.newOffset);
    expect(r2.requests.map(x => x.messageId)).toEqual(['b']);
  });
  it('counts invalid lines as errors without failing', async () => {
    const d = tmpDir(), f = path.join(d, 'p', 's.jsonl');
    write(f, '{broken\n' + claudeLine({ id: 'a', req: 'r', ts: '2026-01-01T00:00:00Z' }));
    const r = await claudeCodeAdapter.parseFile(f, loc(d), 0);
    expect(r.errors).toBe(1); expect(r.requests).toHaveLength(1);
  });
});

describe('Discovery', () => {
  it('detects present tools, skips absent ones, honors CLAUDE_CONFIG_DIR and manual folders', async () => {
    const home = tmpDir(), gs = path.join(home, 'gs'), alt = path.join(home, 'altclaude');
    fs.mkdirSync(path.join(alt, 'projects'), { recursive: true });
    fs.mkdirSync(path.join(gs, 'rooveterinaryinc.roo-cline'), { recursive: true });
    fs.mkdirSync(path.join(home, '.cline', 'data'), { recursive: true });
    const manual = path.join(home, 'kilo-backup'); fs.mkdirSync(manual);
    const r = await discover({ home, env: { CLAUDE_CONFIG_DIR: alt }, globalStorageParent: gs, manual: [manual] });
    expect(r.map(x => x.kind).sort()).toEqual(['claude-projects', 'cline-v2', 'kilo-code-tasks', 'roo-code-tasks']);
  });
});
