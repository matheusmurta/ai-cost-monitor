import * as vscode from 'vscode';
import { Controller } from './controller';
import { DashboardPanel } from './panel';
import { label } from './sync/sync';

const PAGES: [string, string, string][] = [
  ['overview', 'Overview', 'dashboard'], ['requests', 'Requests', 'list-filter'], ['sessions', 'Sessions', 'history'],
  ['projects', 'Projects', 'folder'], ['models', 'Models & Providers', 'circuit-board'], ['costs', 'Cost Analysis', 'credit-card'],
  ['insights', 'Insights', 'lightbulb'], ['integrations', 'Integrations', 'plug'], ['settings', 'Settings', 'settings-gear'],
];

class NavProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  readonly _e = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._e.event;
  constructor(private c: Controller) { c.onChange.event(() => this._e.fire()); }
  getTreeItem(i: vscode.TreeItem) { return i; }
  getChildren(): vscode.TreeItem[] {
    const items = PAGES.map(([id, name, icon]) => {
      const t = new vscode.TreeItem(name);
      t.iconPath = new vscode.ThemeIcon(icon);
      t.command = { command: 'aiTokenObservatory.openDashboard', title: name, arguments: [id] };
      return t;
    });
    const s = new vscode.TreeItem(this.c.syncing ? 'Importing…' : this.c.lastSync ? `Up to date · ${this.c.store?.count() ?? 0} requests` : 'Not synced yet');
    s.iconPath = new vscode.ThemeIcon(this.c.syncing ? 'sync~spin' : this.c.lastError ? 'error' : 'pass');
    s.tooltip = this.c.statuses.map(x => `${label(x.tool)} (${x.kind}): ${x.health}, ${x.requests} requests`).join('\n') || 'No sources detected';
    s.command = { command: 'aiTokenObservatory.openDashboard', title: 'Integrations', arguments: ['integrations'] };
    return [...items, s];
  }
}

export async function activate(ctx: vscode.ExtensionContext) {
  const c = new Controller(ctx);
  ctx.subscriptions.push({ dispose: () => c.dispose() });
  await c.init();

  ctx.subscriptions.push(
    vscode.window.registerTreeDataProvider('aiTokenObservatory.nav', new NavProvider(c)),
    vscode.commands.registerCommand('aiTokenObservatory.openDashboard', (page?: string) => DashboardPanel.show(ctx, c, typeof page === 'string' ? page : undefined)),
    vscode.commands.registerCommand('aiTokenObservatory.rescan', () => c.rescan()),
    vscode.commands.registerCommand('aiTokenObservatory.refresh', () => c.sync(true)),
    vscode.commands.registerCommand('aiTokenObservatory.export', async () => {
      const f = await vscode.window.showQuickPick(['csv', 'json'], { placeHolder: 'Export format (all indexed requests, usage fields only)' });
      if (f) c.exportReport(f as 'csv' | 'json');
    }),
    vscode.commands.registerCommand('aiTokenObservatory.diagnostics', () => {
      const out = vscode.window.createOutputChannel('AI Token Observatory');
      out.clear();
      out.appendLine(`Indexed requests: ${c.store.count()}  DB: ${c.store.sizeBytes()} bytes  Last sync: ${c.lastSync ? new Date(c.lastSync).toISOString() : 'never'}`);
      if (c.lastError) out.appendLine(`Last error: ${c.lastError}`);
      for (const s of c.statuses) out.appendLine(`${label(s.tool)} [${s.kind}] ${s.health} root=${s.root} files=${s.files} sessions=${s.sessions} requests=${s.requests} errors=${s.errors}\n  limitations: ${s.limitations.join(' | ')}`);
      if (!c.statuses.length) out.appendLine('No supported sources detected.');
      out.show();
    }),
  );

  const sb = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  sb.command = 'aiTokenObservatory.openDashboard';
  const upd = () => {
    const s = c.sessionCostToday();
    if (!c.cfg.get('showStatusBar', true) || !s) { sb.hide(); return; }
    sb.text = `$(pulse) $${s.cost.toFixed(2)}`;
    sb.tooltip = `Active session (${s.session}) — reported/estimated API-equivalent cost`;
    sb.show();
  };
  c.onChange.event(upd); upd();
  ctx.subscriptions.push(sb, vscode.workspace.onDidChangeConfiguration(e => { if (e.affectsConfiguration('aiTokenObservatory')) { upd(); c.schedule(); } }));
}

export function deactivate() {}
