import React from 'react';
import { useStore } from '../store';
import { axis, Empty, Badge } from '../ui';
import { tok, usd, int, dur, toolName, TOOL_COLOR } from '../format';

export function DimTable({ rows, kind, extra }: { rows: any[]; kind: 'project' | 'model' | 'provider'; extra?: boolean }) {
  const { drill } = useStore();
  if (!rows.length) return <Empty title="No data in range" />;
  const heads = ['Name', 'Requests', 'Total tokens', 'Cost', 'Avg tokens/req', 'Avg cost/req', 'Cache hit', ...(extra ? ['Avg duration'] : []), 'Tools', 'Models'];
  return (
    <div className="overflow-auto rounded-lg border border-line">
      <table className="w-full text-xs"><thead className="bg-panel2"><tr>{heads.map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
        <tbody>{rows.map(r => (
          <tr key={r.key} className="border-t border-line/60 hover:bg-[#13213a] cursor-pointer" onClick={() => drill(kind, r.key)}>
            <td className="px-3 py-2 text-white max-w-[220px] truncate" title={r.key}>{r.key}</td><td className="px-3 py-2">{int(r.requests)}</td>
            <td className="px-3 py-2">{tok(r.total)}</td><td className="px-3 py-2">{usd(r.cost)}</td><td className="px-3 py-2">{tok(r.avgTokens)}</td>
            <td className="px-3 py-2">{usd(r.avgCost)}</td><td className="px-3 py-2">{r.cacheHitRate === null ? '—' : `${(r.cacheHitRate * 100).toFixed(0)}%`}</td>
            {extra && <td className="px-3 py-2">{dur(r.avgDurationMs)}</td>}
            <td className="px-3 py-2"><div className="flex gap-1 flex-wrap">{Object.keys(r.tools).map(t => <Badge key={t} color={TOOL_COLOR[t]}>{toolName(t)}</Badge>)}</div></td>
            <td className="px-3 py-2 text-muted" title={r.models.join(', ')}>{r.models.length}</td>
          </tr>))}</tbody></table>
    </div>
  );
}

export const bars = (rows: any[], f: string, fmt: (v: number) => string, color: string) => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: fmt },
  xAxis: axis({ type: 'value', axisLabel: { color: '#8193B2', formatter: fmt } }),
  yAxis: axis({ type: 'category', inverse: true, data: rows.slice(0, 10).map(r => r.key), axisLabel: { color: '#8193B2', width: 120, overflow: 'truncate' } }),
  series: [{ type: 'bar', barMaxWidth: 14, itemStyle: { color, borderRadius: [0, 4, 4, 0] }, data: rows.slice(0, 10).map(r => r[f]) }],
});
