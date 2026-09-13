import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { AIProvider, IncrementalProvider, WatchTarget } from '../ai-provider';
import { UsageRecord } from '../../models/usage-record';
import { ILogger } from '../../core/logger';
import { DiagnosticsState } from '../../core/diagnostics-state';
import { CostCalculator } from '../../core/cost-calculator';
import { recordIdFor } from '../../core/dedup';
import { walkFiles } from '../../core/fs-walk';
import { ClaudeEvent, parseClaudeJsonl } from './claude-code-parser';
import { PriceResolver } from './pricing';

const DEFAULT_MODEL = 'claude-3-5-sonnet';

/**
 * O Claude Code CLI grava os transcripts de sessão em:
 *   ~/.claude/projects/<cwd-hash>/<session-uuid>.jsonl
 */
function projectsRoot(): string {
  return path.join(os.homedir(), '.claude', 'projects');
}

export class ClaudeCodeProvider implements AIProvider, IncrementalProvider {
  readonly id = 'claude-code';
  readonly name = 'Claude Code';

  private readonly calculator = new CostCalculator();
  private readonly resolver: PriceResolver;

  constructor(
    private readonly logger: ILogger,
    private readonly diagnostics: DiagnosticsState,
    defaultModel: string = DEFAULT_MODEL,
  ) {
    this.resolver = new PriceResolver(defaultModel);
  }

  async detect(): Promise<boolean> {
    try {
      const stat = await fs.stat(projectsRoot());
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  async scan(): Promise<UsageRecord[]> {
    const files = await walkFiles(projectsRoot(), (filePath) => filePath.endsWith('.jsonl'));
    this.diagnostics.reportFilesFound('claude-code', files.length);

    const all: UsageRecord[] = [];
    for (const file of files) {
      all.push(...(await this.parseFile(file)));
    }
    return all;
  }

  async parseFile(filePath: string): Promise<UsageRecord[]> {
    let content: string;
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch (err) {
      this.logger.warn(`Claude Code: não foi possível ler ${filePath}`);
      void err;
      return [];
    }

    return this.processContent(content, path.basename(filePath));
  }

  /** Processa um lote de linhas novas sem reler o arquivo (leitura incremental). */
  parseChunk(sourceFile: string, lines: string[]): UsageRecord[] {
    return this.processContent(lines.join('\n'), sourceFile);
  }

  async listFiles(): Promise<string[]> {
    return walkFiles(projectsRoot(), (filePath) => filePath.endsWith('.jsonl'));
  }

  watchTargets(): WatchTarget[] {
    return [{ basePath: projectsRoot(), pattern: '**/*.jsonl' }];
  }

  private processContent(content: string, sourceFile: string): UsageRecord[] {
    const result = parseClaudeJsonl(content, sourceFile);

    if (result.malformed > 0) {
      this.diagnostics.malformedRecords += result.malformed;
      this.logger.warn(
        `Claude Code: ${result.malformed} linha(s) malformada(s) em ${sourceFile}`,
      );
    }

    const records = result.events.map((event) => this.toRecord(event, sourceFile));
    const last = records[records.length - 1];
    this.diagnostics.reportLastEvent('claude-code', last?.timestamp);

    return records;
  }

  private toRecord(event: ClaudeEvent, sourceFile: string): UsageRecord {
    const { pricing, model, inferred } = this.resolver.resolve(event.model);
    const cost = this.calculator.calculate(
      event.tokensIn,
      event.tokensOut,
      pricing,
      event.cacheReadTokens,
      event.cacheWriteTokens,
    );

    return {
      id: recordIdFor(
        'claude-code',
        sourceFile,
        event.timestamp,
        event.tokensIn,
        event.tokensOut,
        cost.totalCost,
        model,
      ),
      provider: 'claude-code',
      timestamp: event.timestamp,
      model,
      tokensIn: event.tokensIn,
      tokensOut: event.tokensOut,
      cachedTokens: event.cachedTokens,
      totalTokens: event.tokensIn + event.tokensOut,
      costUsd: cost.totalCost,
      inferredModel: inferred,
      sourceFile,
      metadata: {
        cacheReadTokens: event.cacheReadTokens,
        cacheWriteTokens: event.cacheWriteTokens,
      },
    };
  }
}
