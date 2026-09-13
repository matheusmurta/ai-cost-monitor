import * as vscode from 'vscode';
import { UsageRecord } from '../models/usage-record';

const RECORDS_KEY = 'aiCostMonitor.records';

/** Teto do histórico persistido (evita crescimento ilimitado do globalState). */
export const MAX_PERSISTED_RECORDS = 20000;

/**
 * Escolha de persistência (MVP)
 * -----------------------------
 * Usamos ExtensionContext.globalState (Memento). Motivos:
 * - é local, serializado em JSON e já vem com o lifecycle do VS Code;
 * - não requer banco externo, arquivo próprio a gerenciar ou I/O assíncrono;
 * - é simples para MVP e suficiente para manter histórico entre reinícios.
 *
 * Trade-off aceito: o globalState não é ideal para milhões de linhas, então
 * limitamos o histórico a MAX_PERSISTED_RECORDS (mantendo os mais recentes).
 */
export interface Store {
  loadRecords(): UsageRecord[];
  saveRecords(records: UsageRecord[]): void;
  clear(): void;
}

export class GlobalStateStore implements Store {
  constructor(private readonly state: vscode.Memento) {}

  loadRecords(): UsageRecord[] {
    try {
      const raw = this.state.get<unknown>(RECORDS_KEY);
      if (!Array.isArray(raw)) {
        return [];
      }
      return raw.filter(isUsageRecord);
    } catch {
      return [];
    }
  }

  saveRecords(records: UsageRecord[]): void {
    const trimmed = records.length > MAX_PERSISTED_RECORDS
      ? records.slice(records.length - MAX_PERSISTED_RECORDS)
      : records;
    void this.state.update(RECORDS_KEY, trimmed);
  }

  clear(): void {
    void this.state.update(RECORDS_KEY, []);
  }
}

function isUsageRecord(value: unknown): value is UsageRecord {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const rec = value as Record<string, unknown>;
  return (
    typeof rec.id === 'string' &&
    typeof rec.provider === 'string' &&
    typeof rec.tokensIn === 'number' &&
    typeof rec.tokensOut === 'number'
  );
}

/** Store em memória, útil para testes. */
export class InMemoryStore implements Store {
  private records: UsageRecord[] = [];

  loadRecords(): UsageRecord[] {
    return [...this.records];
  }

  saveRecords(records: UsageRecord[]): void {
    this.records = [...records];
  }

  clear(): void {
    this.records = [];
  }
}
