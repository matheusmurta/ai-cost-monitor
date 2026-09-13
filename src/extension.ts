import * as vscode from 'vscode';
import { Logger, LogLevel } from './core/logger';
import { DiagnosticsState } from './core/diagnostics-state';
import { GlobalStateStore } from './core/persistence-service';
import { MonitoringService } from './core/monitoring-service';
import { formatCompact, formatUsd } from './core/format';
import { UsageSummary } from './models/usage-summary';
import { UsageRecord } from './models/usage-record';
import { ProviderRegistry } from './providers/provider-registry';
import { ClineProvider } from './providers/cline/cline-provider';
import { ClaudeCodeProvider } from './providers/claude-code/claude-code-provider';
import { DashboardPanel } from './ui/dashboard-panel';
import { DiagnosticsPanel } from './ui/diagnostics-panel';

const HISTORY_LIMIT = 100;
const DEFAULT_MODEL = 'claude-3-5-sonnet';

export function activate(context: vscode.ExtensionContext): void {
  const config = vscode.workspace.getConfiguration('aiCostMonitor');
  const enableDebugLogs = config.get<boolean>('enableDebugLogs', false);

  const logger = Logger.getInstance();
  logger.setLevel(enableDebugLogs ? LogLevel.DEBUG : LogLevel.INFO);
  logger.info('AI Cost Monitor ativado.');

  const enabled = config.get<boolean>('enabled', true);
  if (!enabled) {
    logger.info('Extensão desativada pela configuração aiCostMonitor.enabled.');
    return;
  }

  const diagnostics = new DiagnosticsState();
  const store = new GlobalStateStore(context.globalState);

  const registry = new ProviderRegistry();
  registry.register(new ClineProvider(logger, diagnostics));
  registry.register(
    new ClaudeCodeProvider(
      logger,
      diagnostics,
      config.get<string>('defaultModel', DEFAULT_MODEL),
    ),
  );

  const monitoring = new MonitoringService(registry.getAll(), logger, diagnostics, store);

  // Status bar
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.command = 'aiCostMonitor.openDashboard';
  statusBar.tooltip = 'AI Cost Monitor — clique para abrir o dashboard';
  statusBar.show();
  context.subscriptions.push(statusBar);

  const updateStatusBar = (summary: UsageSummary): void => {
    statusBar.text = `$(pulse) AI Cost: ${formatUsd(summary.totalCostUsd)} | ${formatCompact(
      summary.totalTokens,
    )} tokens`;
  };
  updateStatusBar(monitoring.summary);

  // Tempo real: dashboard e status bar se atualizam sem Refresh manual.
  context.subscriptions.push(
    monitoring.onRecordsChanged.event((summary) => {
      updateStatusBar(summary);
      if (DashboardPanel.current) {
        DashboardPanel.current.update(buildDashboardData(summary, monitoring.history));
      }
    }),
  );

  context.subscriptions.push(
    monitoring.onDiagnosticsChanged.event(() => {
      if (DiagnosticsPanel.current) {
        DiagnosticsPanel.current.update(buildDiagnosticsData(logger, diagnostics));
      }
    }),
  );

  // Comandos
  context.subscriptions.push(
    vscode.commands.registerCommand('aiCostMonitor.openDashboard', () => {
      const panel = DashboardPanel.createOrShow(context.extensionUri);
      panel.update(buildDashboardData(monitoring.summary, monitoring.history));
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('aiCostMonitor.refresh', async () => {
      logger.info('Refresh manual solicitado.');
      await monitoring.refresh();
      vscode.window.setStatusBarMessage('AI Cost Monitor: refresh concluído.', 2000);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('aiCostMonitor.resetStatistics', async () => {
      const answer = await vscode.window.showWarningMessage(
        'Resetar todas as estatísticas do AI Cost Monitor? Esta ação não pode ser desfeita.',
        { modal: true },
        'Reset',
      );
      if (answer === 'Reset') {
        await monitoring.reset();
        vscode.window.showInformationMessage('AI Cost Monitor: estatísticas resetadas.');
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('aiCostMonitor.showDiagnostics', () => {
      logger.show();
      const panel = DiagnosticsPanel.createOrShow(context.extensionUri);
      panel.update(buildDiagnosticsData(logger, diagnostics));
    }),
  );

  // Lifecycle: watchers, timers e output channel são liberados no deactivate.
  context.subscriptions.push({ dispose: () => monitoring.dispose() });
  context.subscriptions.push({ dispose: () => logger.dispose() });

  const folder = vscode.workspace.workspaceFolders?.[0];
  void monitoring.start(folder);
}

function buildDashboardData(summary: UsageSummary, history: UsageRecord[]) {
  return {
    summary,
    history: history.slice(-HISTORY_LIMIT).reverse(),
  };
}

function buildDiagnosticsData(logger: Logger, diagnostics: DiagnosticsState) {
  const workspace = vscode.workspace.workspaceFolders?.[0]?.name ?? '(none)';
  return {
    workspace,
    clineDetected: diagnostics.clineDetected,
    claudeDetected: diagnostics.claudeDetected,
    clineFilesFound: diagnostics.clineFilesFound,
    claudeFilesFound: diagnostics.claudeFilesFound,
    recordsProcessed: diagnostics.recordsProcessed,
    lastClineEvent: diagnostics.lastClineEvent,
    lastClaudeEvent: diagnostics.lastClaudeEvent,
    malformedRecords: diagnostics.malformedRecords,
    errors: logger.errorCount,
    warnings: logger.warnCount,
  };
}

export function deactivate(): void {
  // Recursos são liberados via context.subscriptions (dispose automático).
}
