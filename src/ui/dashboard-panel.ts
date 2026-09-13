import * as vscode from 'vscode';
import { UsageRecord } from '../models/usage-record';
import { UsageSummary } from '../models/usage-summary';
import { getDashboardHtml } from './webview-content';

export interface DashboardData {
  summary: UsageSummary;
  history: UsageRecord[];
}

export class DashboardPanel {
  public static current: DashboardPanel | undefined;

  private readonly panel: vscode.WebviewPanel;
  private readonly disposables: vscode.Disposable[] = [];
  private lastData?: DashboardData;

  static createOrShow(extensionUri: vscode.Uri): DashboardPanel {
    const column = vscode.ViewColumn.One;

    if (DashboardPanel.current) {
      DashboardPanel.current.panel.reveal(column);
      return DashboardPanel.current;
    }

    const panel = vscode.window.createWebviewPanel(
      'aiCostMonitor.dashboard',
      'AI Cost Monitor',
      column,
      {
        enableScripts: true,
        localResourceRoots: [],
        retainContextWhenHidden: true,
      },
    );

    DashboardPanel.current = new DashboardPanel(panel);
    return DashboardPanel.current;
  }

  private constructor(panel: vscode.WebviewPanel) {
    this.panel = panel;
    this.panel.webview.html = getDashboardHtml();
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    // Handshake: reenvia os dados quando o webview sinaliza estar pronto,
    // garantindo que a primeira renderização não seja perdida.
    this.disposables.push(
      this.panel.webview.onDidReceiveMessage((msg) => {
        if (msg?.type === 'ready' && this.lastData) {
          void this.panel.webview.postMessage({ type: 'update', ...this.lastData });
        }
      }),
    );
  }

  update(data: DashboardData): void {
    this.lastData = data;
    void this.panel.webview.postMessage({ type: 'update', ...data });
  }

  dispose(): void {
    DashboardPanel.current = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      this.disposables.pop()!.dispose();
    }
  }
}
