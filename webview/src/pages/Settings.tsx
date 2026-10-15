import React, { useEffect, useState } from 'react';
import { Trash2, Hammer, Download, Database, Shield, Wallet, Timer, FolderPlus, X } from 'lucide-react';
import { useStore } from '../store';
import { send } from '../api';
import { Card } from '../ui';
import { int } from '../format';

export function Settings() {
  const { host, filters } = useStore();
  const s = host?.settings ?? {};
  const [pricing, setPricing] = useState('');
  const [perr, setPerr] = useState('');
  useEffect(() => { setPricing(JSON.stringify(s.customPricing ?? {}, null, 2)); }, [host?.settings?.customPricing]);
  const set = (key: string, value: unknown) => send('setting', { key, value });
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card title="Sync" icon={<Timer size={14} />}>
        <label className="flex items-center justify-between text-xs">Refresh interval (seconds)
          <input type="number" min={5} className="input w-24" defaultValue={s.refreshIntervalSeconds} onBlur={e => set('refreshIntervalSeconds', Math.max(5, Number(e.target.value) || 30))} /></label>
        <p className="text-muted text-xs mt-2">File watchers trigger near-real-time updates; polling is the fallback.</p>
      </Card>
      <Card title="Storage diagnostics" icon={<Database size={14} />}>
        <div className="text-xs space-y-1"><div>Indexed requests: <b>{int(host?.totalIndexed)}</b></div><div>Index size: {((host?.dbBytes ?? 0) / 1024).toFixed(1)} KB (SQLite, local)</div>
          <div>Pricing table: {host?.priceVersion}</div>{host?.lastError && <div className="text-bad">Last error: {host.lastError}</div>}</div>
        <div className="flex gap-2 mt-3">
          <button className="btn" onClick={() => send('rebuild')}><Hammer size={14} />Rebuild index</button>
          <button className="btn" onClick={() => send('clear')}><Trash2 size={14} />Clear local index</button>
        </div>
      </Card>
      <Card title="Manual source folders (fallback)" icon={<FolderPlus size={14} />}>
        {(s.manualSourceFolders ?? []).map((f: string) => <div key={f} className="flex items-center justify-between text-xs font-mono py-1">{f}
          <button onClick={() => set('manualSourceFolders', s.manualSourceFolders.filter((x: string) => x !== f))}><X size={12} /></button></div>)}
        <button className="btn mt-2" onClick={() => send('addFolder')}><FolderPlus size={14} />Add folder</button>
      </Card>
      <Card title="Privacy" icon={<Shield size={14} />}>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!s.allowContentPreview} onChange={e => set('allowContentPreview', e.target.checked)} />
          Allow on-demand prompt/response preview (read from source, never stored)</label>
        <label className="flex items-center gap-2 text-xs mt-2"><input type="checkbox" checked={!!s.showStatusBar} onChange={e => set('showStatusBar', e.target.checked)} />Show active session cost in status bar</label>
        <p className="text-muted text-xs mt-2">No telemetry. No network calls. Only usage fields are indexed.</p>
      </Card>
      <Card title="Cost & currency" icon={<Wallet size={14} />} className="xl:col-span-2">
        <div className="flex gap-3 text-xs items-center mb-3">
          <label>USD→BRL rate <input type="number" step="0.0001" className="input w-28 ml-1" defaultValue={s.brlRate} onBlur={e => set('brlRate', Number(e.target.value) || 0)} /></label>
          <label>Rate date <input type="date" className="input ml-1" defaultValue={s.brlRateDate} onBlur={e => set('brlRateDate', e.target.value)} /></label>
          <span className="text-muted">Manual rate; 0 disables BRL.</span>
        </div>
        <div className="text-xs text-muted mb-1">Custom pricing (USD per 1M tokens), e.g. {'{"my-model": {"input": 1, "output": 2, "cacheRead": 0.1, "cacheWrite": 1.25}}'}</div>
        <textarea className="input w-full font-mono text-[11px] h-32" value={pricing} onChange={e => setPricing(e.target.value)} />
        {perr && <div className="text-bad text-xs">{perr}</div>}
        <button className="btn mt-2" onClick={() => { try { set('customPricing', JSON.parse(pricing)); setPerr(''); } catch { setPerr('Invalid JSON'); } }}>Save pricing & re-price</button>
      </Card>
      <Card title="Data export" icon={<Download size={14} />}>
        <div className="flex gap-2">
          <button className="btn" onClick={() => send('export', { format: 'csv', filters })}>CSV (current filters)</button>
          <button className="btn" onClick={() => send('export', { format: 'json', filters })}>JSON (current filters)</button>
          <button className="btn" onClick={() => send('export', { format: 'json', filters: { period: 'all' }, includePaths: true })}>JSON incl. paths</button>
        </div>
        <p className="text-muted text-xs mt-2">Exports never include prompt or response content.</p>
      </Card>
    </div>
  );
}
