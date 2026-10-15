import * as fs from 'fs';
import { Adapter, SourceLocation, SourceTool } from '../core/types';
import { Store } from '../storage/db';
import { finalize } from '../pricing/pricing';
import { claudeCodeAdapter } from '../adapters/claudeCode';
import { taskFolderAdapter } from '../adapters/taskFolder';
import { clineV2Adapter } from '../adapters/clineV2';

export function adapterFor(loc: SourceLocation): Adapter {
  if (loc.kind === 'claude-projects') return claudeCodeAdapter;
  if (loc.kind === 'cline-v2') return clineV2Adapter;
  return taskFolderAdapter(loc.tool);
}

export type Health = 'importing' | 'up-to-date' | 'partial' | 'unavailable' | 'error';
export interface SourceStatus {
  tool: SourceTool; kind: string; root: string; limitations: string[];
  files: number; sessions: number; requests: number; errors: number;
  lastSync: number | null; health: Health; message?: string;
}

export type Progress = (msg: string) => void;

/**
 * Incremental sync. Unchanged files (same size + mtime) are skipped. Append-only JSONL is read
 * from the stored byte offset; truncation/rotation (size < offset) triggers a full re-read of that
 * file. Whole-file JSON sources replace their rows (idempotent -> no duplication on re-import).
 */
export async function syncSources(store: Store, locs: SourceLocation[], custom: Record<string, any>, progress: Progress = () => {}): Promise<SourceStatus[]> {
  const out: SourceStatus[] = [];
  for (const loc of locs) {
    const a = adapterFor(loc);
    const st: SourceStatus = { tool: loc.tool, kind: loc.kind, root: loc.root, limitations: loc.limitations, files: 0, sessions: 0, requests: 0, errors: 0, lastSync: null, health: 'importing' };
    out.push(st);
    progress(`Scanning ${label(loc.tool)} (${loc.kind})...`);
    let files: string[];
    try { files = await a.listFiles(loc); } catch (e: any) { st.health = 'unavailable'; st.message = String(e?.message ?? e); continue; }
    st.files = files.length;
    progress(`Processing ${files.length} files from ${label(loc.tool)}...`);
    let imported = 0;
    for (const file of files) {
      try {
        const s = await fs.promises.stat(file);
        const cp = store.getCheckpoint(file);
        if (cp && cp.size === s.size && cp.mtimeMs === s.mtimeMs) continue;
        let from = a.incremental && cp && s.size >= cp.offset ? cp.offset : 0;
        if (a.incremental && from === 0 && cp) store.replaceFile(file, []); // truncated/rotated
        const res = await a.parseFile(file, loc, from);
        const rows = res.requests.map(r => finalize(r, custom));
        if (a.incremental) store.upsert(rows); else store.replaceFile(file, rows);
        st.errors += res.errors;
        imported += rows.length;
        store.setCheckpoint({ file, size: s.size, mtimeMs: s.mtimeMs, offset: a.incremental ? res.newOffset : s.size });
      } catch { st.errors++; }
      await new Promise(r => setImmediate(r)); // yield: never block the extension host
    }
    const prefix = loc.root;
    const agg = store.query<any>(`SELECT count(*) n, count(DISTINCT sessionId) s FROM requests WHERE sourceTool = ? AND substr(sourceFile,1,?) = ?`, [loc.tool, prefix.length, prefix])[0];
    st.requests = agg.n; st.sessions = agg.s;
    st.lastSync = Date.now();
    st.health = st.errors ? 'partial' : 'up-to-date';
    if (imported) progress(`Imported ${imported.toLocaleString('en-US')} requests from ${label(loc.tool)}.`);
  }
  store.flush();
  return out;
}

export function label(t: SourceTool) {
  return ({ 'claude-code': 'Claude Code', cline: 'Cline', 'roo-code': 'Roo Code', 'kilo-code': 'Kilo Code' } as const)[t];
}
