import React from 'react';
import { useStore } from '../store';
import { Card, Chart, axis } from '../ui';
import { tok, usd, int, dt, PALETTE, brl } from '../format';
import { DimTable, bars } from './DimTable';

export function Projects() {
  const { data, drill } = useStore();
  if (!data) return null;
  const rows = data.byProject;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Tokens by Project"><Chart onClick={p => drill('project', p.name)} option={bars(rows, 'total', tok, '#3B82F6')} /></Card>
        <Card title="Cost by Project"><Chart onClick={p => drill('project', p.name)} option={bars([...rows].sort((a, b) => b.cost - a.cost), 'cost', usd, '#8B5CF6')} /></Card>
      </div>
      <Card title="Project Comparison"><DimTable rows={rows} kind="project" /></Card>
    </div>
  );
}

export function Models() {
  const { data, drill } = useStore();
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Requests by Model"><Chart onClick={p => drill('model', p.name)} option={bars([...data.byModel].sort((a, b) => b.requests - a.requests), 'requests', v => int(v), '#22D3EE')} /></Card>
        <Card title="Tokens by Provider"><Chart onClick={p => drill('provider', p.name)} option={{ tooltip: { trigger: 'item' }, legend: { bottom: 0, textStyle: { color: '#8193B2' } },
          series: [{ type: 'pie', radius: ['45%', '70%'], center: ['50%', '44%'], label: { show: false }, itemStyle: { borderColor: '#111C2E', borderWidth: 2 },
            data: data.byProvider.map((d: any, i: number) => ({ name: d.key, value: d.total, itemStyle: { color: PALETTE[i % PALETTE.length] } })) }] }} /></Card>
      </div>
      <Card title="Models"><DimTable rows={data.byModel} kind="model" extra /></Card>
      <Card title="Providers" tip="Provider is the API vendor, distinct from the tool."><DimTable rows={data.byProvider} kind="provider" extra /></Card>
    </div>
  );
}

export function Costs() {
  const { data, host } = useStore();
  if (!data) return null;
  const t = data.totals, rate = host?.settings?.brlRate ?? 0;
  const fc = data.insights.find((i: any) => i.id === 'forecast');
  const pts = data.series.points;
  const cards: [string, number][] = [['Effective cost', t.cost], ['Reported by tools', t.costReported], ['Estimated API-equivalent', t.costEstimated]];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(([l, v]) => (
          <Card key={l}><div className="text-muted text-xs">{l}</div><div className="text-2xl text-white font-semibold mt-1">{usd(v)}</div>
            {rate > 0 && <div className="text-xs text-muted">{brl(v, rate)} @ {rate} ({host.settings.brlRateDate || 'date not set'})</div>}</Card>))}
        <Card><div className="text-muted text-xs">Monthly forecast</div><div className="text-2xl text-white font-semibold mt-1">{fc ? fc.value : '—'}</div>
          <div className="text-xs text-muted">{fc ? fc.detail : 'Requires ≥7 active days in last 30 days'}</div></Card>
      </div>
      <div className="text-xs text-muted">Actual billed cost: not available from any source. {t.costUnknownCount} requests have unknown cost (no recorded value and no known price).</div>
      <Card title="Cost per period"><Chart option={{ tooltip: { trigger: 'axis', valueFormatter: (v: number) => usd(v) }, xAxis: axis({ type: 'category', data: pts.map((p: any) => dt(p.t).split(',')[0]) }),
        yAxis: axis({ type: 'value', axisLabel: { color: '#8193B2', formatter: (v: number) => usd(v) } }),
        series: [{ type: 'bar', barMaxWidth: 18, itemStyle: { color: '#22C55E' }, data: pts.map((p: any) => p.cost) }] }} /></Card>
      <Card title="Cost by Model"><DimTable rows={[...data.byModel].sort((a, b) => b.cost - a.cost)} kind="model" /></Card>
    </div>
  );
}
