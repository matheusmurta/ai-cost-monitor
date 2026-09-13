import * as vscode from 'vscode';
import { getDiagnosticsHtml } from './webview-content';

export interface DiagnosticsData {
  workspace: string;
  clineDetected: boolean;
  claudeDetected: boolean;
  clineFilesFound: number;
  claudeFilesFound: number;
  recordsProcessed: number;
  lastClineEvent?: string;
  lastClaudeEvent?: string;
  malformedRecords: number;
  errors: number;
  warnings: number;
}

export class DiagnosticsPanel {
  public static current: DiagnosticsPanel | undefined;

  private readonly panel: vscode.WebviewPanel;
  private readonly disposables: vscode.Disposable[] = [];
  private lastData?: DiagnosticsData;

  static createOrShow(extensionUri: vscode.Uri): DiagnosticsPanel {
    const column = vscode.ViewColumn.One;

    if (DiagnosticsPanel.current) {
      DiagnosticsPanel.current.panel.reveal(column);
      return DiagnosticsPanel.current;
    }

    const panel = vscode.window.createWebviewPanel(
      'aiCostMonitor.diagnostics',
      'AI Cost Monitor: Diagnostics',
      column,
      {
        enableScripts: true,
        localResourceRoots: [],
        retainContextWhenHidden: true,
      },
    );

    DiagnosticsPanel.current = new DiagnosticsPanel(panel);
    return DiagnosticsPanel.current;
  }

  private constructor(panel: vscode.WebviewPanel) {
    this.panel = panel;
    this.panel.webview.html = getDiagnosticsHtml();
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    // Handshake: reenvia os dados quando o webview sinaliza estar pronto.
    this.disposables.push(
      this.panel.webview.onDidReceiveMessage((msg) => {
        if (msg?.type === 'ready' && this.lastData) {
          void this.panel.webview.postMessage({ type: 'update', ...this.lastData });
        }
      }),
    );
  }

  update(data: DiagnosticsData): void {
    this.lastData = data;
    void this.panel.webview.postMessage({ type: 'update', ...data });
  }

  dispose(): void {
    DiagnosticsPanel.current = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      this.disposables.pop()!.dispose();
    }
  }
}
