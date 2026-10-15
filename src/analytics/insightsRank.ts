import { AIRequest } from '../core/types';
import { Totals, dimension, sessions } from './aggregate';
import { median, robustZ } from './stats';

export interface Insight {
  id: string; kind: 'info' | 'warning' | 'positive'; title: string; value: string; detail: string;
  confidence: 'high' | 'medium' | 'low'; basis: string;
  drill?: { type: 'request' | 'session' | 'project' | 'model'; key: string };
}

export const MIN_REQ = 10, MIN_SESS = 5, MIN_DAYS = 7;
export const usd = (n: number) => `$${n < 1 ? n.toFixed(4) : n.toFixed(2)}`;
export const fmt = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${Math.round(n)}`;

/** Cost-ranking and session-outlier insights. */
export function rankInsights(cur: AIRequest[], t: Totals): Insight[] {
  const out: Insight[] = [];
  const priced = cur.filter(r => r.effectiveCostUSD !== null);
  if (priced.length) {
    const top = priced.reduce((a, b) => (b.effectiveCostUSD! > a.effectiveCostUSD! ? b : a));
    out.push({ id: 'top-req', kind: 'info', title: 'Most Expensive Request', value: usd(top.effectiveCostUSD!),
      detail: `${top.model ?? 'unknown model'} · ${fmt(top.totalTokens ?? 0)} tokens (${top.costBasis})`,
      confidence: 'high', basis: 'Max effective cost in selected range', drill: { type: 'request', key: top.id } });
  }
  const ss = sessions(cur);
  if (ss.length) {
    const top = [...ss].sort((a, b) => b.cost - a.cost)[0];
    out.push({ id: 'top-sess', kind: 'info', title: 'Most Expensive Session', value: usd(top.cost),
      detail: `${top.requests} requests · ${top.project ?? 'unknown project'}`, confidence: 'high',
      basis: 'Sum of effective cost per session', drill: { type: 'session', key: top.key } });
  }
  if (ss.length >= MIN_SESS) {
    const tot = ss.map(s => s.total), med = median(tot);
    const o = ss.map(s => ({ s, z: robustZ(s.total, tot) })).filter(x => x.z > 3.5).sort((a, b) => b.z - a.z)[0];
    if (o && med > 0) out.push({ id: 'sess-outlier', kind: 'warning', title: 'Outlier Session',
      value: `${(o.s.total / med).toFixed(1)}x median`,
      detail: `One session consumed ${(o.s.total / med).toFixed(1)}x the median tokens per session (${fmt(med)}).`,
      confidence: ss.length >= 20 ? 'high' : 'medium', basis: `Robust z (median/MAD) over ${ss.length} sessions, threshold 3.5`,
      drill: { type: 'session', key: o.s.key } });
  }
  if (t.cost > 0) {
    const m = dimension(cur, r => r.model).sort((a, b) => b.cost - a.cost)[0];
    out.push({ id: 'driver', kind: 'info', title: 'Biggest Cost Driver', value: m.key,
      detail: `${((m.cost / t.cost) * 100).toFixed(0)}% of cost in range (${usd(m.cost)}).`, confidence: 'high',
      basis: 'Share of effective cost by model', drill: { type: 'model', key: m.key } });
    const p = dimension(cur, r => r.projectId).sort((a, b) => b.cost - a.cost)[0];
    out.push({ id: 'top-proj', kind: 'info', title: 'Top Project by Cost', value: p.key,
      detail: `Project ${p.key} accounts for ${((p.cost / t.cost) * 100).toFixed(0)}% of costs in range.`, confidence: 'high',
      basis: 'Share of effective cost by project', drill: { type: 'project', key: p.key } });
  }
  return out;
}
