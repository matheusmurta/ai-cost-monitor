import { AIRequest } from '../core/types';
import { Filters, applyFilters, applyDims } from './filters';
import { totals, timeSeries, dimension, sessions } from './aggregate';
import { computeInsights } from './insights';

export const PAGE = 50;

/** Builds the full dashboard payload for the current filters (runs in extension host, not in UI thread). */
export function dashboard(all: AIRequest[], f: Filters, now = Date.now()) {
  const { cur, prev, from, to, hasPrev } = applyFilters(all, f, now);
  const t = totals(cur), p = hasPrev ? totals(prev) : null;
  const ts = timeSeries(cur, from, to);
  const peak = ts.points.reduce((a, b) => (b.total > a.total ? b : a), ts.points[0] ?? { t: 0, total: 0 } as any);
  const options = {
    tool: uniq(all.map(r => r.sourceTool)), provider: uniq(all.map(r => r.provider ?? '(unknown)')),
    model: uniq(all.map(r => r.model ?? '(unknown)')), project: uniq(all.map(r => r.projectId ?? '(unknown)')),
    session: uniq(applyDims(all, { ...f, session: [] }).map(r => r.sessionId ?? '(unknown)')).slice(0, 500),
  };
  return {
    range: { from, to }, totals: t, prevTotals: p, series: ts, peak: { t: peak?.t ?? null, total: peak?.total ?? 0, bucket: ts.bucket },
    byTool: dimension(cur, r => r.sourceTool), byProject: dimension(cur, r => r.projectId), byModel: dimension(cur, r => r.model),
    byProvider: dimension(cur, r => r.provider), sessions: sessions(cur).slice(0, 1000),
    insights: computeInsights(cur, prev, hasPrev, now), options, empty: all.length === 0,
  };
}

export interface TableQuery extends Filters { page: number; sort: string; dir: 'asc' | 'desc' }
export function requestsPage(all: AIRequest[], q: TableQuery, now = Date.now()) {
  const { cur } = applyFilters(all, q, now);
  const k = q.sort as keyof AIRequest;
  const sorted = [...cur].sort((a, b) => {
    const x = a[k] as any, y = b[k] as any;
    const c = x === y ? 0 : x === null ? 1 : y === null ? -1 : x < y ? -1 : 1;
    return q.dir === 'asc' ? c : -c;
  });
  return { total: sorted.length, page: q.page, rows: sorted.slice(q.page * PAGE, (q.page + 1) * PAGE).map(slim) };
}

/** Never send sourceFile-adjacent content or metadata in table rows; details fetched on demand. */
export function slim(r: AIRequest) { const { metadata, ...rest } = r; return rest; }

const uniq = (xs: string[]) => [...new Set(xs)].sort();
