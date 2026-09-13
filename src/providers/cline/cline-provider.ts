import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { AIProvider, WatchTarget } from '../ai-provider';
import { UsageRecord } from '../../models/usage-record';
import { ILogger } from '../../core/logger';
import { DiagnosticsState } from '../../core/diagnostics-state';
import { walkFiles } from '../../core/fs-walk';
import { parseClineContent } from './cline-parser';

/**
 * Cline v3+ grava os resumos de sessão em:
 *   ~/.cline/data/sessions/<session_id>/<session_id>.json
 *
 * Nesse mesmo diretório há `<id>.messages.json` (conversa completa, grande) e
 * `<id>.compaction.json` (histórico compactado). Ambos são ignorados: apenas o
 * RESUMO já contém o agregado de tokens/custo que nos interessa.
 */
function sessionsRoot(): string {
  return path.join(os.homedir(), '.cline', 'data', 'sessions');
}

function isSummaryFile(filePath: string): boolean {
  return (
    filePath.endsWith('.json') &&
    !filePath.endsWith('.messages.json') &&
    !filePath.endsWith('.compaction.json')
  );
}

export class ClineProvider implements AIProvider {
  readonly id = 'cline';
  readonly name = 'Cline';

  constructor(
    private readonly logger: ILogger,
    private readonly diagnostics: DiagnosticsState,
  ) {}

  async detect(): Promise<boolean> {
    try {
      const stat = await fs.stat(sessionsRoot());
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  async scan(): Promise<UsageRecord[]> {
    const files = await walkFiles(sessionsRoot(), isSummaryFile);
    this.diagnostics.reportFilesFound('cline', files.length);

    const all: UsageRecord[] = [];
    for (const file of files) {
      all.push(...(await this.parseFile(file)));
    }
    return all;
  }

  async parseFile(filePath: string): Promise<UsageRecord[]> {
    if (!isSummaryFile(filePath)) {
      return [];
    }

    let content: string;
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch (err) {
      this.logger.warn(`Cline: não foi possível ler ${filePath}`);
      void err;
      return [];
    }

    const sourceFile = path.basename(filePath);
    const result = parseClineContent(content, sourceFile);

    if (result.malformed > 0) {
      this.diagnostics.malformedRecords += result.malformed;
      this.logger.warn(`Cline: ${result.malformed} registro(s) malformado(s) em ${sourceFile}`);
    }

    const last = result.records[result.records.length - 1];
    this.diagnostics.reportLastEvent('cline', last?.timestamp);

    return result.records;
  }

  watchTargets(): WatchTarget[] {
    return [{ basePath: sessionsRoot(), pattern: '**/*.json' }];
  }
}
