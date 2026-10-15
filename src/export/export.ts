import { AIRequest } from '../core/types';

export const EXPORT_COLS: (keyof AIRequest)[] = ['id', 'startedAt', 'sourceTool', 'provider', 'model', 'projectId', 'sessionId', 'taskId',
  'requestId', 'messageId', 'inputTokens', 'outputTokens', 'cacheReadTokens', 'cacheWriteTokens', 'cacheWrite5mTokens', 'cacheWrite1hTokens',
  'reasoningTokens', 'totalTokens', 'reportedCostUSD', 'estimatedCostUSD', 'effectiveCostUSD', 'costBasis', 'priceVersion', 'durationMs', 'status'];

function cell(v: unknown): string {
  if (v === null || v === undefined) return '';
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s) && typeof v === 'string') s = `'${s}`; // CSV formula-injection guard
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Exports usage fields only. Workspace paths are excluded unless includePaths (explicit consent). */
export function toCSV(rows: AIRequest[], includePaths = false): string {
  const cols = includePaths ? [...EXPORT_COLS, 'workspacePath', 'sourceFile'] as (keyof AIRequest)[] : EXPORT_COLS;
  const lines = [cols.join(',')];
  for (const r of rows) lines.push(cols.map(c => cell(c === 'startedAt' ? new Date(r.startedAt).toISOString() : r[c])).join(','));
  return lines.join('\r\n') + '\r\n';
}

export function toJSON(rows: AIRequest[], includePaths = false): string {
  const cols = includePaths ? [...EXPORT_COLS, 'workspacePath', 'sourceFile'] as (keyof AIRequest)[] : EXPORT_COLS;
  return JSON.stringify({ generatedAt: new Date().toISOString(), count: rows.length,
    requests: rows.map(r => Object.fromEntries(cols.map(c => [c, c === 'startedAt' ? new Date(r.startedAt).toISOString() : r[c] ?? null]))) }, null, 2);
}
