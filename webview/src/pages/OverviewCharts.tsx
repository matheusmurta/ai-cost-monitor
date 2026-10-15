import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Chart, axis } from '../ui';
import { tok, usd, toolName, TOOL_COLOR, PALETTE } from '../format';

export const SERIES = [['total', 'Total', '#3B82F6'], ['input', 'Input', '#22D3EE'], ['output', 'Output', '#8B5CF6'], ['cacheRead', 'Cache read', '#22C55E'], ['cacheWrite', 'Cache write', '#F59E0B']] as const;
export const TOTAL_TIP = 'Total = input + output + cache read + cache write (+ reasoning when reported separately). Anthropic input excludes cached tokens, so categories are additive.';
const fmtT = (t: number, b: string) => { const d = new Date(t); return b === 'hour' ? `${d.getHours()}:00` : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); };
const yTok = () => axis({ type: 'value', axisLabel: { color: '#8193B2', formatter: (v: number) => tok(v) } });
const toolKey = (name: string) => Object.keys(TOOL_COLOR).find(k => toolName(k) === name);

export function OverviewCharts() {
  const { data, drill } = useStore();
  const [sel, setSel] = useState<string[]>(['total']);
  const pts = data.series.points, b = data.series.bucket;
  const cats = pts.map((x: any) => fmtT(x.t, b));
  const tools = Object.keys(TOOL_COLOR).filter(k => data.byTool.some((d: any) => d.key === k));
  const models = data.byModel.slice().sort((a: any, c: any) => c.cost - a.cost).slice(0, 8);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card title="Token Usage Over Time" className="xl:col-span-2" tip={TOTAL_TIP} right={
        <div className="flex gap-1">{SERIES.map(([k, l, c]) => <button key={k} className={`chip ${sel.includes(k) ? 'chip-on' : ''}`} style={sel.includes(k) ? { color: c } : {}} onClick={() => setSel(sel.includes(k) ? sel.filter(x => x !== k) : [...sel, k])}>{l}</button>)}</div>}>
        <Chart option={{ tooltip: { trigger: 'axis' }, xAxis: axis({ type: 'category', data: cats, boundaryGap: false }), yAxis: yTok(),
          series: SERIES.filter(([k]) => sel.includes(k)).map(([k, l, c]) => ({ name: l, type: 'line', smooth: true, showSymbol: false, data: pts.map((x: any) => x[k]), lineStyle: { color: c, width: 2 }, itemStyle: { color: c },
            areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: c + '55' }, { offset: 1, color: c + '00' }] } } })) }} />
      </Card>
      <Card title="Usage by Project" tip="Click a slice to filter by project">
        <Chart onClick={p => drill('project', p.name)} option={{ tooltip: { trigger: 'item', formatter: (p: any) => `${p.name}<br/>${tok(p.value)} tokens (${p.percent}%)` },
          legend: { bottom: 0, textStyle: { color: '#8193B2', fontSize: 11 }, type: 'scroll' },
          series: [{ type: 'pie', radius: ['48%', '72%'], center: ['50%', '44%'], itemStyle: { borderColor: '#111C2E', borderWidth: 2 }, label: { show: false },
            data: data.byProject.slice(0, 9).map((d: any, i: number) => ({ name: d.key, value: d.total, itemStyle: { color: PALETTE[i] } })) }] }} />
      </Card>
      <Card title="Usage by Tool" className="xl:col-span-2" tip="Click a segment to filter by tool">
        <Chart onClick={p => { const k = toolKey(p.seriesName); if (k) drill('tool', k); }} option={{ tooltip: { trigger: 'axis' }, legend: { top: 0, right: 0, textStyle: { color: '#8193B2' } }, xAxis: axis({ type: 'category', data: cats }), yAxis: yTok(),
          series: tools.map(k => ({ name: toolName(k), type: 'bar', stack: 't', barMaxWidth: 18, itemStyle: { color: TOOL_COLOR[k] }, data: pts.map((x: any) => x.byTool[k] ?? 0) })) }} />
      </Card>
      <Card title="Cost by Model" tip="Effective cost (reported, else estimated). Click to filter.">
        <Chart onClick={p => drill('model', p.name)} option={{ tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v: number) => usd(v) },
          xAxis: axis({ type: 'value', axisLabel: { color: '#8193B2', formatter: (v: number) => usd(v) } }), yAxis: axis({ type: 'category', inverse: true, data: models.map((d: any) => d.key), axisLabel: { color: '#8193B2', width: 110, overflow: 'truncate' } }),
          series: [{ type: 'bar', barMaxWidth: 14, itemStyle: { color: '#8B5CF6', borderRadius: [0, 4, 4, 0] }, data: models.map((d: any) => d.cost) }] }} />
      </Card>
      <Card title="Token Composition" className="xl:col-span-2" tip={TOTAL_TIP}>
        <Chart option={{ tooltip: { trigger: 'axis' }, legend: { top: 0, right: 0, textStyle: { color: '#8193B2' } }, xAxis: axis({ type: 'category', data: cats }), yAxis: yTok(),
          series: SERIES.slice(1).map(([k, l, c]) => ({ name: l, type: 'bar', stack: 'c', barMaxWidth: 18, itemStyle: { color: c }, data: pts.map((x: any) => x[k]) })) }} />
      </Card>
      <Card title="Cost Evolution" tip="Effective USD cost per bucket">
        <Chart option={{ tooltip: { trigger: 'axis', valueFormatter: (v: number) => usd(v) }, xAxis: axis({ type: 'category', data: cats, boundaryGap: false }), yAxis: axis({ type: 'value', axisLabel: { color: '#8193B2', formatter: (v: number) => usd(v) } }),
          series: [{ type: 'line', smooth: true, showSymbol: false, data: pts.map((x: any) => x.cost), lineStyle: { color: '#22C55E', width: 2 }, areaStyle: { color: '#22C55E22' } }] }} />
      </Card>
    </div>
  );
}
