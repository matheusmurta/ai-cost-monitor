import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../store';
import { request } from '../api';
import { Card, Chart, axis, Empty, Badge } from '../ui';
import { tok, usd, int, dt, dur, toolName, TOOL_COLOR } from '../format';

export function Sessions() {
  const { data, sessionKey, openSession } = useStore();
  if (!data) return null;
  if (sessionKey) return <SessionView k={sessionKey} back={() => openSession(null)} />;
  if (!data.sessions.length) return <Card><Empty title="No sessions in range" /></Card>;
  return (
    <Card title={`Sessions (${data.sessions.length})`}>
      <div className="overflow-auto rounded-lg border border-line"><table className="w-full text-xs">
        <thead className="bg-panel2"><tr>{['Tool', 'Session', 'Project', 'Start', 'End', 'Duration', 'Requests', 'Total tokens', 'Cost', 'Models'].map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
        <tbody>{data.sessions.map((s: any) => (
          <tr key={s.key} className="border-t border-line/60 hover:bg-[#13213a] cursor-pointer" onClick={() => openSession(s.key)}>
            <td className="px-3 py-2"><Badge color={TOOL_COLOR[s.tool]}>{toolName(s.tool)}</Badge></td>
            <td className="px-3 py-2 font-mono text-[11px]">{s.key.split('|')[1]?.slice(0, 14)}</td><td className="px-3 py-2">{s.project ?? '—'}</td>
            <td className="px-3 py-2 whitespace-nowrap">{dt(s.first)}</td><td className="px-3 py-2 whitespace-nowrap">{dt(s.last)}</td><td className="px-3 py-2">{dur(s.durationMs)}</td>
            <td className="px-3 py-2">{int(s.requests)}</td><td className="px-3 py-2 text-white">{tok(s.total)}</td><td className="px-3 py-2">{usd(s.cost)}</td>
            <td className="px-3 py-2 text-muted max-w-[200px] truncate" title={s.models.join(', ')}>{s.models.join(', ')}</td>
          </tr>))}</tbody></table></div>
    </Card>
  );
}

function SessionView({ k, back }: { k: string; back: () => void }) {
  const { filters, openDetail } = useStore();
  const [tool, sid] = k.split('|');
  const [rows, setRows] = useState<any[] | null>(null);
  useEffect(() => {
    request('requests', { query: { ...filters, period: 'all', tool: [tool], session: [sid], page: 0, sort: 'startedAt', dir: 'asc' } }).then(r => setRows(r.rows));
  }, [k]);
  if (!rows) return <div className="skeleton h-80" />;
  let cum = 0, cc = 0;
  const cumT = rows.map(r => (cum += r.totalTokens ?? 0)), cumC = rows.map(r => (cc += r.effectiveCostUSD ?? 0));
  return (
    <div className="space-y-4">
      <button className="btn" onClick={back}><ArrowLeft size={14} />All sessions</button>
      <Card title={`${toolName(tool)} session ${sid}`} right={<span className="text-xs text-muted">{rows.length} requests (first 50 shown) · {tok(cum)} tokens · {usd(cc)}</span>}>
        <Chart option={{ tooltip: { trigger: 'axis' }, legend: { top: 0, right: 0, textStyle: { color: '#8193B2' } }, xAxis: axis({ type: 'category', data: rows.map(r => new Date(r.startedAt).toLocaleTimeString()) }),
          yAxis: [axis({ type: 'value', axisLabel: { color: '#8193B2', formatter: (v: number) => tok(v) } }), axis({ type: 'value', splitLine: { show: false }, axisLabel: { color: '#8193B2', formatter: (v: number) => usd(v) } })],
          series: [{ name: 'Cumulative tokens', type: 'line', areaStyle: { color: '#3B82F622' }, data: cumT, itemStyle: { color: '#3B82F6' } },
            { name: 'Per-request tokens', type: 'bar', data: rows.map(r => r.totalTokens ?? 0), itemStyle: { color: '#8B5CF6' }, barMaxWidth: 10 },
            { name: 'Cumulative cost', type: 'line', yAxisIndex: 1, data: cumC, itemStyle: { color: '#22C55E' } }] }} />
      </Card>
      <Card title="Timeline">{!rows.length ? <Empty title="No requests" /> : rows.map(r => (
        <button key={r.id} onClick={() => openDetail(r.id)} className="w-full flex items-center gap-3 py-2 border-b border-line/60 text-xs hover:bg-[#13213a] px-2 text-left">
          <span className="w-2 h-2 rounded-full bg-blue" /><span className="text-muted w-40">{dt(r.startedAt)}</span><span className="flex-1 truncate">{r.model ?? '—'}</span>
          <span className="w-20">{tok(r.totalTokens)}</span><span className="w-20">{usd(r.effectiveCostUSD)}</span>
        </button>))}</Card>
    </div>
  );
}
