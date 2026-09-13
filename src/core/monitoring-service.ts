import * as vscode from 'vscode';
import { AIProvider, IncrementalProvider } from '../providers/ai-provider';
import { UsageRecord } from '../models/usage-record';
import { UsageSummary } from '../models/usage-summary';
import { AggregationService } from './aggregation-service';
import { DiagnosticsState } from './diagnostics-state';
import { Emitter } from './emitter';
import { ILogger } from './logger';
import { Store } from './persistence-service';
import { IncrementalFileReader } from './incremental-file-reader';

const DEBOUNCE_MS = 150;

/**
 * Orquestra detecção, scan, watchers, deduplicação, agregação e persistência.
 *
 * Fluxo em tempo real:
 *   watcher (create/change) -> debounce -> provider.parseFile/parseChunk
 *   -> dedup (AggregationService) -> persist (Store) -> emite resumo.
 */
export class MonitoringService {
  private aggregation: AggregationService;
  private readonly watchers: vscode.FileSystemWatcher[] = [];
  private readonly debounceTimers = new Map<string, NodeJS.Timeout>();
  private readonly fileOffsets = new Map<string, number>();
  private readonly reader = new IncrementalFileReader();
  private workspacePath?: string;

  readonly onRecordsChanged = new Emitter<UsageSummary>();
  readonly onDiagnosticsChanged = new Emitter<void>();

  constructor(
    private readonly providers: AIProvider[],
    private readonly logger: ILogger,
    private readonly diagnostics: DiagnosticsState,
    private readonly store: Store,
  ) {
    this.aggregation = new AggregationService(this.store.loadRecords());
  }

  get summary(): UsageSummary {
    return this.aggregation.summarize();
  }

  get history(): UsageRecord[] {
    return this.aggregation.getAll();
  }

  get workspace(): string | undefined {
    return this.workspacePath;
  }

  async start(workspaceFolder: vscode.WorkspaceFolder | undefined): Promise<void> {
    this.workspacePath = workspaceFolder?.uri.fsPath;
    if (this.workspacePath) {
      this.logger.info(`Workspace: ${this.workspacePath}`);
    } else {
      this.logger.info('Nenhum workspace aberto — monitorando diretórios HOME globais.');
    }

    for (const provider of this.providers) {
      await this.activateProvider(provider);
    }

    this.emitAll();
  }

  private async activateProvider(provider: AIProvider): Promise<void> {
    const detected = await this.safeDetect(provider);
    this.diagnostics.reportDetection(provider.id, detected);

    if (!detected) {
      this.logger.info(`\u25CB ${provider.name} not detected`);
      return;
    }
    this.logger.info(`\u2713 ${provider.name} detected`);

    try {
      const records = await provider.scan();
      this.logger.debug(`${provider.name}: ${records.length} registro(s) no scan inicial.`);
      this.ingest(records);
    } catch (err) {
      this.logger.error(`${provider.name}: falha no scan inicial`, err);
    }

    await this.initOffsets(provider);
    this.setupWatcher(provider);
  }

  private async safeDetect(provider: AIProvider): Promise<boolean> {
    try {
      return await provider.detect();
    } catch (err) {
      this.logger.error(`${provider.name}: falha na detecção`, err);
      return false;
    }
  }

  private async initOffsets(provider: AIProvider): Promise<void> {
    if (!isIncremental(provider)) {
      return;
    }
    try {
      const files = await provider.listFiles();
      for (const file of files) {
        this.fileOffsets.set(file, await this.reader.fullFilePathSize(file));
      }
    } catch (err) {
      this.logger.error(`${provider.name}: falha ao inicializar offsets`, err);
    }
  }

  private setupWatcher(provider: AIProvider): void {
    for (const target of provider.watchTargets()) {
      const descr = `${target.basePath} :: ${target.pattern}`;
      try {
        const relative = new vscode.RelativePattern(
          vscode.Uri.file(target.basePath),
          target.pattern,
        );
        const watcher = vscode.workspace.createFileSystemWatcher(relative);
        watcher.onDidCreate((uri) => this.schedule(provider, uri));
        watcher.onDidChange((uri) => this.schedule(provider, uri));
        watcher.onDidDelete((uri) => this.onDelete(uri));
        this.watchers.push(watcher);
        this.logger.debug(`${provider.name}: watcher criado para '${descr}'.`);
      } catch (err) {
        this.logger.error(`${provider.name}: falha ao criar watcher para '${descr}'`, err);
      }
    }
  }

  private schedule(provider: AIProvider, uri: vscode.Uri): void {
    const filePath = uri.fsPath;

    const existing = this.debounceTimers.get(filePath);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(filePath);
      void this.processFile(provider, filePath);
    }, DEBOUNCE_MS);

    this.debounceTimers.set(filePath, timer);
  }

  private onDelete(uri: vscode.Uri): void {
    const filePath = uri.fsPath;
    this.fileOffsets.delete(filePath);
    // Histórico é preservado (não removemos registros já contabilizados).
    this.logger.debug(`Arquivo removido (histórico mantido): ${filePath}`);
  }

  private async processFile(provider: AIProvider, filePath: string): Promise<void> {
    try {
      let records: UsageRecord[];

      if (isIncremental(provider)) {
        const from = this.fileOffsets.get(filePath) ?? 0;
        const { lines, nextOffset } = await this.reader.readNewLines(filePath, from);
        this.fileOffsets.set(filePath, nextOffset);
        records = provider.parseChunk(filePath, lines);
      } else {
        records = await provider.parseFile(filePath);
      }

      this.ingest(records);
    } catch (err) {
      this.logger.error(`Falha ao processar ${filePath}`, err);
    }
  }

  private ingest(records: UsageRecord[]): void {
    const fresh = this.aggregation.ingest(records);
    if (fresh.length === 0) {
      return;
    }
    this.store.saveRecords(this.aggregation.getAll());
    this.logger.debug(`${fresh.length} registro(s) novo(s) contabilizado(s).`);
    this.emitAll();
  }

  async refresh(): Promise<void> {
    const folder = vscode.workspace.workspaceFolders?.[0];
    this.workspacePath = folder?.uri.fsPath;

    for (const provider of this.providers) {
      const detected = await this.safeDetect(provider);
      this.diagnostics.reportDetection(provider.id, detected);
      if (!detected) {
        continue;
      }
      try {
        const records = await provider.scan();
        this.ingest(records);
        await this.initOffsets(provider);
      } catch (err) {
        this.logger.error(`${provider.name}: falha no refresh`, err);
      }
    }

    this.emitAll();
  }

  async reset(): Promise<void> {
    this.aggregation = new AggregationService();
    this.store.clear();
    this.fileOffsets.clear();
    this.diagnostics.reset();

    for (const provider of this.providers) {
      this.diagnostics.reportDetection(provider.id, await this.safeDetect(provider));
    }

    this.emitAll();
    this.logger.info('Estatísticas resetadas.');
  }

  private emitAll(): void {
    this.diagnostics.recordsProcessed = this.aggregation.getAll().length;
    this.onRecordsChanged.fire(this.aggregation.summarize());
    this.onDiagnosticsChanged.fire();
  }

  dispose(): void {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    for (const watcher of this.watchers) {
      watcher.dispose();
    }
    this.watchers.length = 0;

    this.onRecordsChanged.dispose();
    this.onDiagnosticsChanged.dispose();
  }
}

function isIncremental(provider: AIProvider): provider is AIProvider & IncrementalProvider {
  return typeof (provider as unknown as IncrementalProvider).parseChunk === 'function';
}
