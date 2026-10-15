import * as fs from 'fs';
import * as path from 'path';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { AIRequest, FileCheckpoint } from '../core/types';

const COLS = ['id', 'sourceTool', 'sourceVersion', 'provider', 'model', 'projectId', 'workspacePath', 'sessionId', 'taskId',
  'requestId', 'messageId', 'startedAt', 'finishedAt', 'durationMs', 'inputTokens', 'outputTokens', 'cacheReadTokens',
  'cacheWriteTokens', 'cacheWrite5mTokens', 'cacheWrite1hTokens', 'reasoningTokens', 'totalTokens', 'reportedCostUSD',
  'estimatedCostUSD', 'effectiveCostUSD', 'costBasis', 'priceVersion', 'status', 'errorCategory', 'sourceFile',
  'sourceRecordId', 'metadata'] as const;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS requests (${COLS.map(c => c === 'id' ? 'id TEXT PRIMARY KEY' : c).join(', ')});
CREATE INDEX IF NOT EXISTS ix_ts ON requests(startedAt);
CREATE INDEX IF NOT EXISTS ix_tool ON requests(sourceTool);
CREATE INDEX IF NOT EXISTS ix_model ON requests(model);
CREATE INDEX IF NOT EXISTS ix_provider ON requests(provider);
CREATE INDEX IF NOT EXISTS ix_project ON requests(projectId);
CREATE INDEX IF NOT EXISTS ix_session ON requests(sessionId);
CREATE INDEX IF NOT EXISTS ix_file ON requests(sourceFile);
CREATE TABLE IF NOT EXISTS checkpoints (file TEXT PRIMARY KEY, size INTEGER, mtimeMs REAL, offset INTEGER);
CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT);
`;

let SQL: SqlJsStatic | undefined;

/**
 * SQLite (WASM, sql.js) persisted to a single file. Writes are atomic: export -> tmp file -> rename.
 * A corrupted file is moved aside (.corrupt) and the index is rebuilt from sources.
 */
export class Store {
  private constructor(public db: Database, private file: string | null) {}
  dirty = false;

  static async open(file: string | null, wasmDir?: string): Promise<Store> {
    SQL ??= await initSqlJs(wasmDir ? { locateFile: (f: string) => path.join(wasmDir, f) } : undefined);
    let db: Database;
    try {
      db = file && fs.existsSync(file) ? new SQL.Database(fs.readFileSync(file)) : new SQL.Database();
      db.exec('SELECT count(*) FROM sqlite_master');
    } catch {
      if (file) try { fs.renameSync(file, file + '.corrupt'); } catch { /* ignore */ }
      db = new SQL.Database();
    }
    db.exec(SCHEMA);
    return new Store(db, file);
  }

  upsert(rows: AIRequest[]) {
    if (!rows.length) return;
    const st = this.db.prepare(`INSERT OR REPLACE INTO requests (${COLS.join(',')}) VALUES (${COLS.map(() => '?').join(',')})`);
    this.db.exec('BEGIN');
    try {
      for (const r of rows) st.run(COLS.map(c => c === 'metadata' ? JSON.stringify(r.metadata ?? {}) : (r as any)[c] ?? null));
      this.db.exec('COMMIT');
    } catch (e) { this.db.exec('ROLLBACK'); throw e; } finally { st.free(); }
    this.dirty = true;
  }

  /** Replace all rows of a whole-file (non-incremental) source atomically. */
  replaceFile(file: string, rows: AIRequest[]) {
    this.db.run('DELETE FROM requests WHERE sourceFile = ?', [file]);
    this.upsert(rows);
    this.dirty = true;
  }

  getCheckpoint(file: string): FileCheckpoint | undefined {
    const r = this.query('SELECT * FROM checkpoints WHERE file = ?', [file])[0];
    return r as FileCheckpoint | undefined;
  }
  setCheckpoint(c: FileCheckpoint) {
    this.db.run('INSERT OR REPLACE INTO checkpoints VALUES (?,?,?,?)', [c.file, c.size, c.mtimeMs, c.offset]);
    this.dirty = true;
  }

  query<T = any>(sql: string, params: any[] = []): T[] {
    const st = this.db.prepare(sql);
    try {
      st.bind(params);
      const out: T[] = [];
      while (st.step()) out.push(st.getAsObject() as T);
      return out;
    } finally { st.free(); }
  }

  all(): AIRequest[] {
    return this.query<any>('SELECT * FROM requests ORDER BY startedAt').map(r => ({ ...r, metadata: safeJson(r.metadata) }));
  }

  count(): number { return this.query<any>('SELECT count(*) n FROM requests')[0].n; }

  clear() { this.db.exec('DELETE FROM requests; DELETE FROM checkpoints;'); this.dirty = true; }

  flush() {
    if (!this.file || !this.dirty) return;
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, Buffer.from(this.db.export()));
    fs.renameSync(tmp, this.file);
    this.dirty = false;
  }

  sizeBytes(): number { try { return this.file ? fs.statSync(this.file).size : 0; } catch { return 0; } }
  close() { this.flush(); this.db.close(); }
}

function safeJson(s: unknown) { try { return typeof s === 'string' ? JSON.parse(s) : {}; } catch { return {}; } }
