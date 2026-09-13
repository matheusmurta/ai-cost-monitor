import { UsageRecord } from '../models/usage-record';
import {
  ModelBreakdown,
  ProviderBreakdown,
  UsageSummary,
} from '../models/usage-summary';

/**
 * Agregação pura, resiliente a qualquer entrada (nunca lança exceção).
 *
 * Upsert por ID:
 * - Um ID novo é adicionado.
 * - Um ID já existente com conteúdo diferente é SUBSTITUÍDO (ex.: o resumo de
 *   sessão do Cline é reescrito e o custo cresce ao longo do tempo).
 * - Um ID já existente com conteúdo idêntico é ignorado (idempotência: reprocessar
 *   o mesmo evento não duplica).
 */
export class AggregationService {
  private records: UsageRecord[] = [];
  private readonly index = new Map<string, number>();

  constructor(initialRecords?: UsageRecord[]) {
    if (initialRecords && initialRecords.length > 0) {
      this.seed(initialRecords);
    }
  }

  /** Retorna apenas os registros que mudaram (novos ou substituídos). */
  ingest(records: UsageRecord[]): UsageRecord[] {
    const changed: UsageRecord[] = [];
    for (const rec of records) {
      const idx = this.index.get(rec.id);
      if (idx === undefined) {
        this.index.set(rec.id, this.records.length);
        this.records.push(rec);
        changed.push(rec);
      } else if (!usageRecordsEqual(this.records[idx], rec)) {
        this.records[idx] = rec;
        changed.push(rec);
      }
    }
    return changed;
  }

  private seed(records: UsageRecord[]): void {
    for (const rec of records) {
      const idx = this.index.get(rec.id);
      if (idx === undefined) {
        this.index.set(rec.id, this.records.length);
        this.records.push(rec);
      } else {
        this.records[idx] = rec;
      }
    }
  }

  getAll(): UsageRecord[] {
    return this.records;
  }

  summarize(): UsageSummary {
    return summarizeRecords(this.records);
  }
}

function usageRecordsEqual(a: UsageRecord, b: UsageRecord): boolean {
  return (
    a.tokensIn === b.tokensIn &&
    a.tokensOut === b.tokensOut &&
    a.costUsd === b.costUsd &&
    a.totalTokens === b.totalTokens &&
    a.model === b.model &&
    a.timestamp === b.timestamp
  );
}

export function summarizeRecords(records: UsageRecord[]): UsageSummary {
  const summary: UsageSummary = {
    totalTokensIn: 0,
    totalTokensOut: 0,
    totalTokens: 0,
    totalCostUsd: 0,
    totalRecords: records.length,
    byProvider: {},
    byModel: {},
  };

  for (const rec of records) {
    summary.totalTokensIn += rec.tokensIn;
    summary.totalTokensOut += rec.tokensOut;
    summary.totalTokens += rec.totalTokens;
    summary.totalCostUsd += rec.costUsd;

    const providerKey = rec.provider || 'unknown';
    const provider = (summary.byProvider[providerKey] ??= emptyBreakdown());
    provider.tokensIn += rec.tokensIn;
    provider.tokensOut += rec.tokensOut;
    provider.totalTokens += rec.totalTokens;
    provider.costUsd += rec.costUsd;
    provider.records += 1;

    const model = (summary.byModel[rec.model ?? 'Unknown'] ??= emptyBreakdown());
    model.tokensIn += rec.tokensIn;
    model.tokensOut += rec.tokensOut;
    model.totalTokens += rec.totalTokens;
    model.costUsd += rec.costUsd;
    model.records += 1;
  }

  return summary;
}

function emptyBreakdown(): ProviderBreakdown | ModelBreakdown {
  return { tokensIn: 0, tokensOut: 0, totalTokens: 0, costUsd: 0, records: 0 };
}

export const EMPTY_SUMMARY: UsageSummary = {
  totalTokensIn: 0,
  totalTokensOut: 0,
  totalTokens: 0,
  totalCostUsd: 0,
  totalRecords: 0,
  byProvider: {},
  byModel: {},
};
