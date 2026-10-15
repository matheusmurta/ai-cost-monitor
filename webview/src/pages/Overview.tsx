import React from 'react';
import { Layers3, ArrowDownToLine, ArrowUpFromLine, DatabaseZap, Wallet, Activity, Gauge, Zap, TriangleAlert, Plug } from 'lucide-react';
import { useStore } from '../store';
import { Card, Kpi, Empty, Skel } from '../ui';
import { tok, usd, int, delta, dt } from '../format';
import { InsightGrid } from './Insights';
import { OverviewCharts, TOTAL_TIP } from './OverviewCharts';

export function Overview() {
  const { data, loading, setPage, host } = useStore();
  if (!data) return <div className="grid grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <Skel key={i} h={110} />)}</div>;
  if (data.empty) return (
    <Card><Empty title={host?.syncing ? 'Importing your history…' : 'No AI requests found yet'}
      text={host?.syncing ? (host.progress ?? []).slice(-1)[0] : 'No supported source contained usage records. Check Integrations for detected tools or add a folder manually.'}
      action={<button className="btn mt-2" onClick={() => setPage('integrations')}><Plug size={14} />Open Integrations</button>} /></Card>
  );
  const t = data.totals, p = data.prevTotals;
  const kpis: [string, string, number | null, React.ReactNode, string, string][] = [
    ['Total Tokens', tok(t.total), delta(t.total, p?.total), <Layers3 size={15} />, '#3B82F6', TOTAL_TIP],
    ['Input Tokens', tok(t.input), delta(t.input, p?.input), <ArrowDownToLine size={15} />, '#22D3EE', 'Uncached prompt tokens'],
    ['Output Tokens', tok(t.output), delta(t.output, p?.output), <ArrowUpFromLine size={15} />, '#8B5CF6', 'Generated tokens'],
    ['Cache Tokens', tok(t.cacheRead + t.cacheWrite), delta(t.cacheRead + t.cacheWrite, p ? p.cacheRead + p.cacheWrite : null), <DatabaseZap size={15} />, '#22C55E', `Read ${tok(t.cacheRead)} · Write ${tok(t.cacheWrite)}`],
    ['Estimated Cost', usd(t.cost), delta(t.cost, p?.cost), <Wallet size={15} />, '#F59E0B', `Reported ${usd(t.costReported)} + estimated API-equivalent ${usd(t.costEstimated)}. ${t.costUnknownCount} requests without price. Not actual billing.`],
    ['Total Requests', int(t.requests), delta(t.requests, p?.requests), <Activity size={15} />, '#3B82F6', 'Individual model calls (local tool calls excluded)'],
    ['Avg Tokens / Request', tok(t.requests ? t.total / t.requests : 0), p?.requests ? delta(t.total / Math.max(t.requests, 1), p.total / p.requests) : null, <Gauge size={15} />, '#22D3EE', ''],
    ['Peak Usage', tok(data.peak.total), null, <Zap size={15} />, '#EF4444', data.peak.t ? `Busiest ${data.peak.bucket}: ${dt(data.peak.t)}` : ''],
  ];
  return (
    <div className={`space-y-4 ${loading ? 'opacity-70' : ''} transition-opacity`}>
      {t.costEstimated > 0 && <div className="flex items-center gap-2 text-xs text-muted"><TriangleAlert size={13} className="text-warn" />Estimated costs are API-equivalent values from public list prices; subscription usage (e.g. Claude Code) is not billed per request.</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(([l, v, c, i, col, tip]) => <Kpi key={l} label={l} value={v} change={c} icon={i} color={col} tip={tip} invert={l === 'Estimated Cost'} />)}
      </div>
      <OverviewCharts />
      <InsightGrid limit={8} />
    </div>
  );
}
