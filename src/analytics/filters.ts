import { AIRequest } from '../core/types';

export type Period = 'today' | '7d' | '30d' | '90d' | '1y' | 'all' | 'custom';
export interface Filters {
  period: Period; from?: number; to?: number;
  tool?: string[]; provider?: string[]; model?: string[]; project?: string[]; session?: string[];
  search?: string;
}

const DAY = 86400000;

/** Resolve [from, to) for the period. `all` -> from earliest record. */
export function resolveRange(f: Filters, now = Date.now(), earliest?: number): { from: number; to: number } {
  const to = f.period === 'custom' && f.to ? f.to : now;
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
  const days: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
  switch (f.period) {
    case 'today': return { from: startOfToday.getTime(), to };
    case 'custom': return { from: f.from ?? 0, to };
    case 'all': return { from: earliest ?? 0, to };
    default: return { from: now - days[f.period] * DAY, to };
  }
}

const inSet = (v: string | null, s?: string[]) => !s || !s.length || s.includes(v ?? '(unknown)');

export function applyDims(rows: AIRequest[], f: Filters): AIRequest[] {
  const q = f.search?.trim().toLowerCase();
  return rows.filter(r =>
    inSet(r.sourceTool, f.tool) && inSet(r.provider, f.provider) && inSet(r.model, f.model) &&
    inSet(r.projectId, f.project) && inSet(r.sessionId, f.session) &&
    (!q || [r.id, r.model, r.projectId, r.sessionId, r.provider, r.requestId, r.messageId].some(x => x?.toLowerCase().includes(q))));
}

export function applyFilters(rows: AIRequest[], f: Filters, now = Date.now()) {
  const earliest = rows.length ? rows[0].startedAt : undefined;
  const { from, to } = resolveRange(f, now, earliest);
  const dims = applyDims(rows, f);
  const cur = dims.filter(r => r.startedAt >= from && r.startedAt < to);
  // Previous equivalent window (only meaningful for bounded periods)
  const len = to - from;
  const prev = f.period === 'all' ? [] : dims.filter(r => r.startedAt >= from - len && r.startedAt < from);
  return { cur, prev, from, to, hasPrev: f.period !== 'all' && dims.some(r => r.startedAt < from) };
}
