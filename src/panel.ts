import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { Controller } from './controller';
import { PRICE_VERSION } from './pricing/pricing';

/** Dashboard WebviewPanel. Strict CSP + nonce; only validated message types are accepted. */
export class DashboardPanel {
  static current: DashboardPanel | undefined;
  private disposables: vscode.Disposable[] = [];

  static show(ctx: vscode.ExtensionContext, c: Controller, page?: string) {
    if (DashboardPanel.current) {
      DashboardPanel.current.panel.reveal();
      if (page) DashboardPanel.current.post({ type: 'navigate', page });
      return;
    }
    const panel = vscode.window.createWebviewPanel('aiTokenObservatory', 'AI Token Observatory', vscode.ViewColumn.One, {
      enableScripts: true, retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(ctx.extensionUri, 'dist', 'webview')],
    });
    panel.iconPath = vscode.Uri.joinPath(ctx.extensionUri, 'media', 'icon.svg');
    DashboardPanel.current = new DashboardPanel(panel, ctx, c, page);
  }

  private constructor(private panel: vscode.WebviewPanel, private ctx: vscode.ExtensionContext, private c: Controller, private initialPage?: string) {
    panel.webview.html = this.html();
    panel.onDidDispose(() => this.dispose(), null, this.disposables);
    panel.webview.onDidReceiveMessage(m => this.handle(m).catch(e => this.post({ type: 'error', message: String(e?.message ?? e) })), null, this.disposables);
    this.disposables.push(c.onChange.event(() => this.post({ type: 'changed', state: this.state() })));
    this.disposables.push(c.onProgress.event(m => this.post({ type: 'progress', message: m })));
  }

  post(m: unknown) { this.panel.webview.postMessage(m); }

  state() {
    const cfg = this.c.cfg;
    return {
      syncing: this.c.syncing, lastSync: this.c.lastSync, lastError: this.c.lastError, progress: this.c.progressLog,
      statuses: this.c.statuses, totalIndexed: this.c.store.count(), dbBytes: this.c.store.sizeBytes(), priceVersion: PRICE_VERSION,
      settings: {
        refreshIntervalSeconds: cfg.get('refreshIntervalSeconds'), manualSourceFolders: cfg.get('manualSourceFolders'),
        allowContentPreview: cfg.get('allowContentPreview'), showStatusBar: cfg.get('showStatusBar'),
        brlRate: cfg.get('brlRate'), brlRateDate: cfg.get('brlRateDate'), customPricing: cfg.get('customPricing'),
      },
    };
  }

  private async handle(m: any) {
    if (!m || typeof m.type !== 'string') return;
    const reply = (data: unknown) => this.post({ type: 'reply', id: m.id, data });
    switch (m.type) {
      case 'ready': this.post({ type: 'changed', state: this.state() }); if (this.initialPage) this.post({ type: 'navigate', page: this.initialPage }); return;
      case 'dashboard': return reply(this.c.dashboard(m.filters));
      case 'requests': return reply(this.c.requests(m.query));
      case 'request': return reply(this.c.request(String(m.requestId)));
      case 'preview': return reply(await this.c.preview(String(m.requestId)));
      case 'rescan': this.c.rescan(); return;
      case 'refresh': this.c.sync(true); return;
      case 'rebuild': {
        const ok = await vscode.window.showWarningMessage('Rebuild the local index from sources?', { modal: true }, 'Rebuild');
        if (ok) await this.c.rebuild(); return;
      }
      case 'clear': {
        const ok = await vscode.window.showWarningMessage('Clear the local index? Source files are never touched.', { modal: true }, 'Clear');
        if (ok) await this.c.clearIndex(); return;
      }
      case 'export': return this.c.exportReport(m.format === 'json' ? 'json' : 'csv', m.filters, !!m.includePaths);
      case 'copy': await vscode.env.clipboard.writeText(String(m.text).slice(0, 500)); vscode.window.setStatusBarMessage('Copied', 1500); return;
      case 'openSource': {
        const r = this.c.request(String(m.requestId));
        if (r) vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(r.sourceFile)); return;
      }
      case 'addFolder': {
        const u = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false });
        if (!u?.[0]) return;
        const cur = this.c.cfg.get<string[]>('manualSourceFolders', []);
        await this.c.cfg.update('manualSourceFolders', [...new Set([...cur, u[0].fsPath])], vscode.ConfigurationTarget.Global);
        this.c.rescan(); return;
      }
      case 'setting': {
        const allowed = ['refreshIntervalSeconds', 'manualSourceFolders', 'allowContentPreview', 'showStatusBar', 'brlRate', 'brlRateDate', 'customPricing'];
        if (!allowed.includes(m.key)) return;
        await this.c.cfg.update(m.key, m.value, vscode.ConfigurationTarget.Global);
        if (m.key === 'refreshIntervalSeconds') this.c.schedule();
        if (m.key === 'customPricing') this.c.reprice();
        if (m.key === 'manualSourceFolders') this.c.rescan();
        this.post({ type: 'changed', state: this.state() }); return;
      }
    }
  }

  private html() {
    const w = this.panel.webview, nonce = crypto.randomBytes(16).toString('base64');
    const base = vscode.Uri.joinPath(this.ctx.extensionUri, 'dist', 'webview');
    const js = w.asWebviewUri(vscode.Uri.joinPath(base, 'main.js')), css = w.asWebviewUri(vscode.Uri.joinPath(base, 'main.css'));
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${w.cspSource} data:; style-src ${w.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${w.cspSource};">
<meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" href="${css}"><title>AI Token Observatory</title></head>
<body><div id="root"></div><script nonce="${nonce}" src="${js}"></script></body></html>`;
  }

  dispose() { DashboardPanel.current = undefined; this.panel.dispose(); this.disposables.forEach(d => d.dispose()); }
}
