import React, { useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { useStore } from './store';
import { toolName } from './format';

const PERIODS = [['today', 'Today'], ['7d', '7D'], ['30d', '30D'], ['90d', '90D'], ['1y', '1Y'], ['all', 'All Time'], ['custom', 'Custom']] as const;
const DIMS = [['tool', 'Tool'], ['provider', 'Provider'], ['model', 'Model'], ['project', 'Project'], ['session', 'Session']] as const;

export function FilterBar() {
  const { filters, setFilters, data } = useStore();
  const [from, setFrom] = useState(''); const [to, setTo] = useState('');
  const opts = data?.options ?? {};
  const active = DIMS.filter(([k]) => (filters as any)[k]?.length);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-0.5 bg-panel2 border border-line rounded-lg p-0.5">
        <CalendarDays size={14} className="text-muted mx-1.5" />
        {PERIODS.map(([p, l]) => (
          <button key={p} className={`chip ${filters.period === p ? 'chip-on' : ''}`} onClick={() => setFilters({ period: p })}>{l}</button>
        ))}
      </div>
      {filters.period === 'custom' && (
        <div className="flex items-center gap-1">
          <input type="date" className="input text-xs" value={from} onChange={e => setFrom(e.target.value)} />
          <span className="text-muted">→</span>
          <input type="date" className="input text-xs" value={to} onChange={e => setTo(e.target.value)} />
          <button className="btn text-xs" disabled={!from} onClick={() => setFilters({ from: new Date(from + 'T00:00').getTime(), to: to ? new Date(to + 'T23:59:59').getTime() : undefined })}>Apply</button>
        </div>
      )}
      {DIMS.map(([k, l]) => (
        <select key={k} className="input text-xs max-w-[160px]" value="" onChange={e => { if (e.target.value) setFilters({ [k]: [...new Set([...((filters as any)[k] ?? []), e.target.value])] } as any); }}>
          <option value="">{l}: All</option>
          {(opts[k] ?? []).map((v: string) => <option key={v} value={v}>{k === 'tool' ? toolName(v) : v}</option>)}
        </select>
      ))}
      {active.map(([k, l]) => ((filters as any)[k] as string[]).map(v => (
        <span key={k + v} className="flex items-center gap-1 bg-blue/15 text-blue-glow text-xs rounded-md pl-2 pr-1 py-0.5">
          {l}: {k === 'tool' ? toolName(v) : v.length > 28 ? v.slice(0, 28) + '…' : v}
          <button aria-label="remove filter" onClick={() => setFilters({ [k]: ((filters as any)[k] as string[]).filter(x => x !== v) } as any)}><X size={12} /></button>
        </span>
      )))}
      {active.length > 0 && <button className="chip" onClick={() => setFilters({ tool: [], provider: [], model: [], project: [], session: [] })}>Clear all</button>}
    </div>
  );
}
