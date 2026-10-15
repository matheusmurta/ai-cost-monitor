import { AIRequest } from '../core/types';

export interface Totals {
  requests: number; input: number; output: number; cacheRead: number; cacheWrite: number; reasoning: number;
  total: number; cost: number; costReported: number; costEstimated: number; costUnknownCount: number;
  tokensUnknownCount: number;
}

export function totals(rows: AIRequest[]): Totals {
  const t: Totals = { requests: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0, total: 0, cost: 0, costReported: 0, costEstimated: 0, costUnknownCount: 0, tokensUnknownCount: 0 };
  for (const r of rows) {
    t.requests++;
    t.input += r.inputTokens ?? 0; t.output += r.outputTokens ?? 0;
    t.cacheRead += r.cacheReadTokens ?? 0; t.cacheWrite += r.cacheWriteTokens ?? 0;
    t.reasoning += r.reasoningTokens ?? 0;
    if (r.totalTokens === null) t.tokensUnknownCount++; else t.total += r.totalTokens;
    if (r.effectiveCostUSD === null) t.costUnknownCount++;
    else { t.cost += r.effectiveCostUSD; if (r.costBasis === 'reported') t.costReported += r.effectiveCostUSD; else t.costEstimated += r.effectiveCostUSD; }
  }
  return t;
}

export function groupBy<K extends string>(rows: AIRequest[], key: (r: AIRequest) => K | null) {
  const m = new Map<string, AIRequest[]>();
  for (const r of rows) { const k = key(r) ?? '(unknown)'; let a = m.get(k); if (!a) m.set(k, a = []); a.push(r); }
  return m;
}

export type Bucket = 'hour' | 'day' | 'week' | 'month';
export function pickBucket(from: number, to: number): Bucket {
  const d = (to - from) / 86400000;
  return d <= 2 ? 'hour' : d <= 120 ? 'day' : d <= 730 ? 'week' : 'month';
}
export function bucketKey(ts: number, b: Bucket): number {
  const d = new Date(ts);
  if (b === 'hour') { d.setMinutes(0, 0, 0); return d.getTime(); }
  d.setHours(0, 0, 0, 0);
  if (b === 'week') d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  if (b === 'month') d.setDate(1);
  return d.getTime();
}
export function nextBucket(ts: number, b: Bucket): number {
  const d = new Date(ts);
  if (b === 'hour') d.setHours(d.getHours() + 1);
  else if (b === 'day') d.setDate(d.getDate() + 1);
  else if (b === 'week') d.setDate(d.getDate() + 7);
  else d.setMonth(d.getMonth() + 1);
  return d.getTime();
}

export interface SeriesPoint { t: number; input: number; output: number; cacheRead: number; cacheWrite: number; total: number; cost: number; requests: number; byTool: Record<string, number> }

/** Dense time series (empty buckets filled with 0 so gaps are visible). */
export function timeSeries(rows: AIRequest[], from: number, to: number): { bucket: Bucket; points: SeriesPoint[] } {
  const bucket = pickBucket(from, to);
  const pts = new Map<number, SeriesPoint>();
  const start = bucketKey(from, bucket);
  for (let t = start, i = 0; t < to && i < 2000; t = nextBucket(t, bucket), i++) pts.set(t, { t, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0, cost: 0, requests: 0, byTool: {} });
  for (const r of rows) {
    const p = pts.get(bucketKey(r.startedAt, bucket));
    if (!p) continue;
    p.input += r.inputTokens ?? 0; p.output += r.outputTokens ?? 0; p.cacheRead += r.cacheReadTokens ?? 0;
    p.cacheWrite += r.cacheWriteTokens ?? 0; p.total += r.totalTokens ?? 0; p.cost += r.effectiveCostUSD ?? 0; p.requests++;
    p.byTool[r.sourceTool] = (p.byTool[r.sourceTool] ?? 0) + (r.totalTokens ?? 0);
  }
  return { bucket, points: [...pts.values()] };
}

export interface DimRow { key: string; requests: number; total: number; cost: number; input: number; output: number; cacheRead: number; cacheWrite: number; avgTokens: number; avgCost: number | null; cacheHitRate: number | null; avgDurationMs: number | null; tools: Record<string, number>; models: string[]; first: number; last: number }

export function dimension(rows: AIRequest[], key: (r: AIRequest) => string | null): DimRow[] {
  const out: DimRow[] = [];
  for (const [k, rs] of groupBy(rows, key as any)) {
    const t = totals(rs);
    const durs = rs.map(r => r.durationMs).filter((x): x is number => x !== null);
    const tools: Record<string, number> = {};
    for (const r of rs) tools[r.sourceTool] = (tools[r.sourceTool] ?? 0) + (r.totalTokens ?? 0);
    const promptSide = t.input + t.cacheRead + t.cacheWrite;
    out.push({
      key: k, requests: t.requests, total: t.total, cost: t.cost, input: t.input, output: t.output, cacheRead: t.cacheRead, cacheWrite: t.cacheWrite,
      avgTokens: t.requests ? t.total / t.requests : 0,
      avgCost: t.requests - t.costUnknownCount ? t.cost / (t.requests - t.costUnknownCount) : null,
      cacheHitRate: promptSide ? t.cacheRead / promptSide : null,
      avgDurationMs: durs.length ? durs.reduce((a, b) => a + b, 0) / durs.length : null,
      tools, models: [...new Set(rs.map(r => r.model ?? '(unknown)'))],
      first: Math.min(...rs.map(r => r.startedAt)), last: Math.max(...rs.map(r => r.startedAt)),
    });
  }
  return out.sort((a, b) => b.total - a.total);
}

export interface SessionRow extends DimRow { tool: string; project: string | null; durationMs: number }
export function sessions(rows: AIRequest[]): SessionRow[] {
  const byS = groupBy(rows, r => (r.sessionId ? `${r.sourceTool}|${r.sessionId}` : null) as any);
  return dimension(rows, r => (r.sessionId ? `${r.sourceTool}|${r.sessionId}` : null)).map(d => {
    const rs = byS.get(d.key)!;
    return { ...d, tool: rs[0].sourceTool, project: rs[0].projectId, durationMs: d.last - d.first };
  }).sort((a, b) => b.last - a.last);
}
