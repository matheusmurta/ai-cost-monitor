import { AIRequest } from '../core/types';
import { totals, dimension } from './aggregate';
import { median, robustZ, quantile } from './stats';
import { forecast } from './forecast';
import { Insight, rankInsights, usd, fmt, MIN_REQ, MIN_DAYS } from './insightsRank';
export type { Insight } from './insightsRank';

/** Deterministic offline insights. Each one states its baseline/method and confidence. */
export function computeInsights(cur: AIRequest[], prev: AIRequest[], hasPrev: boolean, now = Date.now()): Insight[] {
  if (!cur.length) return [];
  const t = totals(cur);
  const out = rankInsights(cur, t);

  if (hasPrev && cur.length >= MIN_REQ && prev.length >= MIN_REQ) {
    const p = totals(prev);
    if (p.total > 0) {
      const g = t.total / p.total - 1;
      out.push({ id: 'growth', kind: g > 0.25 ? 'warning' : g < -0.25 ? 'positive' : 'info', title: 'Token Consumption Growth',
        value: `${g >= 0 ? '+' : ''}${(g * 100).toFixed(0)}%`,
        detail: `Token consumption ${g >= 0 ? 'increased' : 'decreased'} ${Math.abs(g * 100).toFixed(0)}% vs the previous equivalent period.`,
        confidence: 'medium', basis: `${cur.length} vs ${prev.length} requests; correlation only, no causality implied` });
    }
  }

  const byDay = new Map<number, number>();
  for (const r of cur) { const d = new Date(r.startedAt); d.setHours(0, 0, 0, 0); byDay.set(d.getTime(), (byDay.get(d.getTime()) ?? 0) + (r.totalTokens ?? 0)); }
  const days = [...byDay.entries()];
  if (days.length >= MIN_DAYS) {
    const vals = days.map(d => d[1]);
    const s = days.map(([d, v]) => ({ d, v, z: robustZ(v, vals) })).filter(x => x.z > 3.5).sort((a, b) => b.z - a.z)[0];
    if (s) out.push({ id: 'spike', kind: 'warning', title: 'Spike Detected', value: new Date(s.d).toLocaleDateString(),
      detail: `${fmt(s.v)} tokens vs median ${fmt(median(vals))} per active day.`, confidence: days.length >= 14 ? 'high' : 'medium',
      basis: `Robust z over ${days.length} active days` });
  }

  const promptSide = t.input + t.cacheRead + t.cacheWrite;
  if (promptSide > 0 && t.cacheRead > 0) {
    const best = dimension(cur, r => r.model).filter(m => m.requests >= MIN_REQ && m.cacheHitRate !== null).sort((a, b) => b.cacheHitRate! - a.cacheHitRate!)[0];
    out.push({ id: 'cache', kind: 'positive', title: 'Highest Cache Hit Rate',
      value: `${(((best?.cacheHitRate) ?? t.cacheRead / promptSide) * 100).toFixed(0)}%`,
      detail: best ? `${best.key}: cache read / (input + cache read + cache write).` : 'Overall share of prompt tokens served from cache.',
      confidence: best ? 'high' : 'low', basis: 'Measures token reuse, not technical efficiency' });
  }

  const fc = forecast(cur.concat(prev), now);
  if (fc) out.push({ id: 'forecast', kind: 'info', title: 'Monthly Forecast', value: usd(fc.expected),
    detail: `Range ${usd(fc.low)} – ${usd(fc.high)} (month to date ${usd(fc.mtd)}).`, confidence: fc.days >= 14 ? 'medium' : 'low',
    basis: `Linear trend over ${fc.days} days of daily cost, ±1.96·SE` });

  if (cur.length >= 30) {
    const hours = new Array(24).fill(0); for (const r of cur) hours[new Date(r.startedAt).getHours()]++;
    const h = hours.indexOf(Math.max(...hours));
    out.push({ id: 'hour', kind: 'info', title: 'Peak Hour', value: `${String(h).padStart(2, '0')}:00`,
      detail: `${((hours[h] / cur.length) * 100).toFixed(0)}% of requests start in this hour (local time).`, confidence: 'medium', basis: `${cur.length} requests` });
  }

  const toks = cur.map(r => r.totalTokens ?? 0);
  if (toks.length >= 20) {
    const p99 = quantile([...toks].sort((a, b) => a - b), 0.99);
    const n = toks.filter(x => x > p99).length;
    if (n) out.push({ id: 'p99', kind: 'info', title: 'Exceptional Requests', value: `${n}`,
      detail: `Requests above p99 (${fmt(p99)} tokens).`, confidence: 'medium', basis: 'Percentile of total tokens per request' });
  }
  return out;
}
