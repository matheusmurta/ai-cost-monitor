import React, { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy, Columns3, FileJson, FileSpreadsheet } from 'lucide-react';
import { useStore } from '../store';
import { request, send } from '../api';
import { Card, Badge, Empty } from '../ui';
import { tok, usd, dt, dur, toolName, TOOL_COLOR } from '../format';

const COLS: [string, string, (r: any) => React.ReactNode][] = [
  ['startedAt', 'Timestamp', r => <span className="whitespace-nowrap">{dt(r.startedAt)}</span>],
  ['sourceTool', 'Tool', r => <Badge color={TOOL_COLOR[r.sourceTool]}>{toolName(r.sourceTool)}</Badge>],
  ['provider', 'Provider', r => r.provider ?? '—'],
  ['model', 'Model', r => <span className="truncate block max-w-[180px]" title={r.model}>{r.model ?? '—'}</span>],
  ['projectId', 'Project', r => r.projectId ?? '—'],
  ['sessionId', 'Session', r => <span className="font-mono text-[11px]">{r.sessionId?.slice(0, 10) ?? '—'}</span>],
  ['inputTokens', 'Input', r => tok(r.inputTokens)],
  ['outputTokens', 'Output', r => tok(r.outputTokens)],
  ['cacheReadTokens', 'Cache', r => r.cacheReadTokens === null && r.cacheWriteTokens === null ? '—' : tok((r.cacheReadTokens ?? 0) + (r.cacheWriteTokens ?? 0))],
  ['totalTokens', 'Total', r => <span className="text-white font-medium">{tok(r.totalTokens)}</span>],
  ['effectiveCostUSD', 'Cost', r => <span title={r.costBasis}>{usd(r.effectiveCostUSD)}{r.costBasis === 'estimated' ? <span className="text-muted">*</span> : ''}</span>],
  ['durationMs', 'Duration', r => dur(r.durationMs)],
  ['status', 'Status', r => <Badge color={r.status === 'ok' ? '#22C55E' : r.status === 'unknown' ? '#8193B2' : '#EF4444'}>{r.status}</Badge>],
];

export function Requests() {
  const { filters, openDetail, host } = useStore();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('startedAt'); const [dir, setDir] = useState<'asc' | 'desc'>('desc');
  const [q, setQ] = useState(''); const [res, setRes] = useState<any>(null);
  const [hidden, setHidden] = useState<string[]>([]); const [colMenu, setColMenu] = useState(false);
  useEffect(() => { setPage(0); }, [filters, q]);
  useEffect(() => {
    const h = setTimeout(() => request('requests', { query: { ...filters, search: q, page, sort, dir } }).then(setRes), 150);
    return () => clearTimeout(h);
  }, [filters, q, page, sort, dir, host?.lastSync]);
  const cols = COLS.filter(c => !hidden.includes(c[0]));
  const pages = res ? Math.max(1, Math.ceil(res.total / 50)) : 1;
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative"><Search size={14} className="absolute left-2.5 top-2 text-muted" /><input className="input pl-8 w-72" placeholder="Search id, model, project, session…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <span className="text-muted text-xs">{res ? `${res.total.toLocaleString()} requests` : 'Loading…'}</span>
        <div className="flex-1" />
        <div className="relative">
          <button className="btn" onClick={() => setColMenu(!colMenu)}><Columns3 size={14} />Columns</button>
          {colMenu && <div className="absolute right-0 mt-1 card p-2 z-20 w-44">{COLS.map(([k, l]) => (
            <label key={k} className="flex items-center gap-2 py-1 text-xs cursor-pointer"><input type="checkbox" checked={!hidden.includes(k)} onChange={() => setHidden(hidden.includes(k) ? hidden.filter(x => x !== k) : [...hidden, k])} />{l}</label>))}</div>}
        </div>
        <button className="btn" onClick={() => send('export', { format: 'csv', filters: { ...filters, search: q } })}><FileSpreadsheet size={14} />CSV</button>
        <button className="btn" onClick={() => send('export', { format: 'json', filters: { ...filters, search: q } })}><FileJson size={14} />JSON</button>
      </div>
      {res && res.total === 0 ? <Empty title="No requests match the current filters" /> : (
        <div className="overflow-auto rounded-lg border border-line">
          <table className="w-full text-xs">
            <thead className="bg-panel2 sticky top-0"><tr>
              {cols.map(([k, l]) => <th key={k} className="px-3 py-2 cursor-pointer select-none hover:text-slate-200" onClick={() => { if (sort === k) setDir(dir === 'asc' ? 'desc' : 'asc'); else { setSort(k); setDir('desc'); } }}>
                <span className="inline-flex items-center gap-1">{l}<ArrowUpDown size={10} className={sort === k ? 'text-blue-glow' : 'opacity-30'} /></span></th>)}
              <th className="px-2" />
            </tr></thead>
            <tbody>{(res?.rows ?? []).map((r: any) => (
              <tr key={r.id} className="border-t border-line/60 hover:bg-[#13213a] cursor-pointer" onClick={() => openDetail(r.id)}>
                {cols.map(([k, , f]) => <td key={k} className="px-3 py-2 text-slate-300">{f(r)}</td>)}
                <td className="px-2"><button title="Copy ID" className="text-muted hover:text-white" onClick={e => { e.stopPropagation(); send('copy', { text: r.id }); }}><Copy size={12} /></button></td>
              </tr>))}</tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between mt-3 text-xs text-muted">
        <span>* estimated API-equivalent cost</span>
        <div className="flex items-center gap-2">
          <button className="btn" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></button>
          <span>Page {page + 1} / {pages}</span>
          <button className="btn" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></button>
        </div>
      </div>
    </Card>
  );
}
