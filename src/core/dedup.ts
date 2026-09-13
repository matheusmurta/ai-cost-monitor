import { createHash } from 'node:crypto';
import { UsageRecord } from '../models/usage-record';

const SEP = '\u001f';

/**
 * Estratégia de deduplicação (idempotência)
 * ----------------------------------------
 * Cada registro recebe um ID determinístico baseado no conteúdo estável do
 * evento: provider + arquivo de origem + timestamp + tokens de entrada/saída +
 * custo + modelo.
 *
 * Como o hash é determinístico, processar o MESMO evento várias vezes produz o
 * MESMO id. O AggregationService/MonitoringService mantém um Set de ids já
 * contabilizados; ids repetidos são ignorados, tornando o sistema idempotente.
 *
 * Limitações conhecidas (documentadas):
 * - Se um arquivo for escrito parcialmente e o evento mudar (ex.: tokens
 *   aparecerem em dois pedaços), o id muda e o evento parcial pode ser
 *   contabilizado até a escrita final. Para mitigar, o parser descarta
 *   registros incompletos (tokens indefinidos) e o debounce de 150ms espera a
 *   escrita terminar antes de processar.
 * - Eventos sem timestamp ficam com campos vazios no hash, o que reduz a
 *   capacidade de distinguir dois eventos idênticos consecutivos do mesmo
 *   arquivo. Providers que expõem timestamp preenchem esse campo sempre que
 *   possível.
 */
export function createRecordId(parts: Array<string | number | undefined | null>): string {
  const joined = parts
    .map((p) => (p === undefined || p === null ? '' : String(p)))
    .join(SEP);
  return createHash('sha256').update(joined).digest('hex');
}

export function recordIdFor(
  provider: string,
  sourceFile: string,
  timestamp: string | undefined,
  tokensIn: number,
  tokensOut: number,
  costUsd: number,
  model: string | undefined,
): string {
  return createRecordId([provider, sourceFile, timestamp, tokensIn, tokensOut, costUsd, model]);
}

export class DedupSet {
  private readonly seen = new Set<string>();

  constructor(initialIds?: Iterable<string>) {
    if (initialIds) {
      for (const id of initialIds) {
        this.seen.add(id);
      }
    }
  }

  add(id: string): boolean {
    if (this.seen.has(id)) {
      return false;
    }
    this.seen.add(id);
    return true;
  }

  has(id: string): boolean {
    return this.seen.has(id);
  }

  /** Retorna apenas os registros nunca vistos antes e os marca como vistos. */
  filterNew(records: UsageRecord[]): UsageRecord[] {
    const result: UsageRecord[] = [];
    for (const rec of records) {
      if (this.add(rec.id)) {
        result.push(rec);
      }
    }
    return result;
  }

  get size(): number {
    return this.seen.size;
  }

  ids(): string[] {
    return Array.from(this.seen);
  }
}
