import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Store } from './storage/db';
import { discover } from './discovery/discovery';
import { syncSources, SourceStatus } from './sync/sync';
import { AIRequest, SourceLocation } from './core/types';
import { finalize } from './pricing/pricing';
import { dashboard, requestsPage, TableQuery } from './analytics/engine';
import { Filters, applyFilters } from './analytics/filters';
import { toCSV, toJSON } from './export/export';
import { previewContent } from './preview';

/** Owns store, sync loop and watchers. The UI only receives normalized data via messages. */
export class Controller {
  store!: Store;
  statuses: SourceStatus[] = [];
  locs: SourceLocation[] = [];
  syncing = false;
  progressLog: string[] = [];
  lastSync: number | null = null;
  lastError: string | null = null;
  private cache: AIRequest[] | null = null;
  private timer?: NodeJS.Timeout;
  private debounce?: NodeJS.Timeout;
  private watchers: { dispose(): void }[] = [];
  readonly onChange = new vscode.EventEmitter<void>();
  readonly onProgress = new vscode.EventEmitter<string>();

  constructor(private ctx: vscode.ExtensionContext) {}

  get cfg() { return vscode.workspace.getConfiguration('aiTokenObservatory'); }

  async init() {
    const dir = this.ctx.globalStorageUri.fsPath;
    fs.mkdirSync(dir, { recursive: true });
    this.store = await Store.open(path.join(dir, 'observatory.sqlite'), path.join(this.ctx.extensionPath, 'dist'));
    this.statuses = this.ctx.globalState.get<SourceStatus[]>('statuses') ?? [];
    void this.rescan(); // background; persisted index is available immediately
    this.schedule();
  }

  schedule() {
    clearInterval(this.timer);
    const s = Math.max(5, this.cfg.get<number>('refreshIntervalSeconds', 30));
    this.timer = setInterval(() => void this.sync(), s * 1000);
  }

  async rescan() {
    this.locs = await discover({ manual: this.cfg.get<string[]>('manualSourceFolders', []) });
    this.setupWatchers();
    await this.sync(true);
  }

  private setupWatchers() {
    this.watchers.forEach(w => w.dispose());
    this.watchers = [];
    for (const l of this.locs) {
      try {
        const w = fs.watch(l.root, { recursive: true }, () => {
          clearTimeout(this.debounce);
          this.debounce = setTimeout(() => void this.sync(), 1500);
        });
        w.on('error', () => w.close());
        this.watchers.push({ dispose: () => w.close() });
      } catch { /* polling fallback covers this source */ }
    }
  }

  async sync(verbose = false) {
    if (this.syncing || !this.store) return;
    this.syncing = true;
    this.progressLog = [];
    this.onChange.fire();
    const log = (m: string) => { if (verbose || !this.lastSync) { this.progressLog.push(m); this.onProgress.fire(m); } };
    try {
      this.statuses = await syncSources(this.store, this.locs, this.cfg.get('customPricing', {}), log);
      void this.ctx.globalState.update('statuses', this.statuses);
      this.lastSync = Date.now();
      this.lastError = null;
    } catch (e: any) {
      this.lastError = String(e?.message ?? e);
    } finally {
      this.syncing = false;
      this.cache = null;
      this.onChange.fire();
    }
  }

  all(): AIRequest[] { return (this.cache ??= this.store.all()); }
  dashboard(f: Filters) { return dashboard(this.all(), f); }
  requests(q: TableQuery) { return requestsPage(this.all(), q); }
  request(id: string) { return this.all().find(r => r.id === id) ?? null; }
  filtered(f: Filters) { return applyFilters(this.all(), f).cur; }

  /** Re-price indexed rows after a custom pricing change, without re-reading sources. */
  reprice() {
    const custom = this.cfg.get<Record<string, any>>('customPricing', {});
    this.store.upsert(this.store.all().map(r => finalize(r, custom)));
    this.store.flush();
    this.cache = null;
    this.onChange.fire();
  }

  async rebuild() { this.store.clear(); this.store.flush(); this.cache = null; await this.rescan(); }
  async clearIndex() { this.store.clear(); this.store.flush(); this.cache = null; this.onChange.fire(); }

  async exportReport(fmt: 'csv' | 'json', f?: Filters, includePaths = false) {
    const rows = f ? this.filtered(f) : this.all();
    const uri = await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file(`ai-token-report.${fmt}`), filters: { [fmt.toUpperCase()]: [fmt] } });
    if (!uri) return;
    const body = fmt === 'csv' ? toCSV(rows, includePaths) : toJSON(rows, includePaths);
    await vscode.workspace.fs.writeFile(uri, Buffer.from(body, 'utf8'));
    vscode.window.showInformationMessage(`Exported ${rows.length} requests to ${uri.fsPath}`);
  }

  async preview(id: string): Promise<string> {
    if (!this.cfg.get('allowContentPreview', false)) return 'Content preview is disabled (Settings → Privacy).';
    return previewContent(this.request(id), this.locs);
  }

  /** Cost of the most recent session if active within the last hour and fully priced. */
  sessionCostToday(): { cost: number; session: string } | null {
    if (!this.store) return null;
    const rows = this.all();
    const last = rows[rows.length - 1];
    if (!last?.sessionId || Date.now() - last.startedAt > 3600000) return null;
    const s = rows.filter(r => r.sessionId === last.sessionId && r.sourceTool === last.sourceTool);
    if (s.some(r => r.effectiveCostUSD === null)) return null;
    return { cost: s.reduce((a, r) => a + (r.effectiveCostUSD ?? 0), 0), session: `${last.sourceTool}: ${last.projectId ?? last.sessionId}` };
  }

  dispose() { clearInterval(this.timer); this.watchers.forEach(w => w.dispose()); this.store?.close(); }
}
