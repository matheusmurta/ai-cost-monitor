import React, { useEffect } from 'react';
import { LayoutDashboard, ListFilter, History, FolderKanban, BrainCircuit, Wallet, Lightbulb, Plug, Settings2, RefreshCw, Download, Activity, Loader2, TriangleAlert } from 'lucide-react';
import { useStore, Page } from './store';
import { onMessage, send } from './api';
import { FilterBar } from './FilterBar';
import { ago } from './format';
import { Overview } from './pages/Overview';
import { Requests } from './pages/Requests';
import { Sessions } from './pages/Sessions';
import { Projects, Models, Costs } from './pages/Dims';
import { Insights } from './pages/Insights';
import { Integrations } from './pages/Integrations';
import { Settings } from './pages/Settings';
import { Detail } from './pages/Detail';

const NAV: [Page, string, React.ElementType][] = [
  ['overview', 'Overview', LayoutDashboard], ['requests', 'Requests', ListFilter], ['sessions', 'Sessions', History],
  ['projects', 'Projects', FolderKanban], ['models', 'Models & Providers', BrainCircuit], ['costs', 'Cost Analysis', Wallet],
  ['insights', 'Insights', Lightbulb], ['integrations', 'Integrations', Plug], ['settings', 'Settings', Settings2],
];
const PAGES: Record<Page, React.FC> = { overview: Overview, requests: Requests, sessions: Sessions, projects: Projects, models: Models, costs: Costs, insights: Insights, integrations: Integrations, settings: Settings };

export function App() {
  const { page, setPage, host, setHost, load, pushProgress, filters, detailId } = useStore();
  useEffect(() => {
    const off = onMessage(m => {
      if (m.type === 'changed') { setHost(m.state); if (!m.state.syncing) void load(); }
      if (m.type === 'progress') pushProgress(m.message);
      if (m.type === 'navigate') setPage(m.page);
    });
    send('ready');
    return () => { off(); };
  }, []);
  const Cur = PAGES[page] ?? Overview;
  const status = host?.syncing ? 'Importing' : host?.lastError ? 'Error' : host?.statuses?.some((s: any) => s.health === 'partial') ? 'Partial data' : host?.lastSync ? 'Up to date' : 'Waiting';
  return (
    <div className="flex h-full">
      <aside className="w-52 shrink-0 border-r border-line bg-[#0A101C] flex flex-col">
        <div className="flex items-center gap-2 px-4 h-14 border-b border-line">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue to-violet grid place-items-center"><Activity size={15} className="text-white" /></div>
          <div className="leading-tight"><div className="text-white font-semibold text-[13px]">Token Observatory</div><div className="text-[10px] text-muted">local-first</div></div>
        </div>
        <nav className="p-2 flex-1 space-y-0.5">
          {NAV.map(([id, l, I]) => (
            <button key={id} onClick={() => setPage(id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${page === id ? 'bg-blue/15 text-white border border-blue/30' : 'text-muted hover:text-slate-100 hover:bg-panel border border-transparent'}`}>
              <I size={15} className={page === id ? 'text-blue-glow' : ''} />{l}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-line text-xs space-y-1">
          <div className="flex items-center gap-1.5">
            {host?.syncing ? <Loader2 size={12} className="animate-spin text-blue-glow" /> : status === 'Error' ? <TriangleAlert size={12} className="text-bad" /> : <span className={`w-2 h-2 rounded-full ${status === 'Up to date' ? 'bg-ok' : 'bg-warn'}`} />}
            <span className="text-slate-300">{status}</span>
          </div>
          <div className="text-muted">Last sync {ago(host?.lastSync)}</div>
          <div className="text-muted">{(host?.totalIndexed ?? 0).toLocaleString()} requests indexed</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-bg/95 backdrop-blur border-b border-line px-6 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-white">AI Token Observatory</h1>
              <p className="text-muted text-xs">Complete visibility into your AI token usage.</p>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={() => send('refresh')} disabled={host?.syncing}><RefreshCw size={14} className={host?.syncing ? 'animate-spin' : ''} />Refresh</button>
              <button className="btn btn-primary" onClick={() => send('export', { format: 'csv', filters })}><Download size={14} />Export</button>
            </div>
          </div>
          {!['integrations', 'settings'].includes(page) && <FilterBar />}
        </header>
        <div className="p-6"><Cur /></div>
      </main>
      {detailId && <Detail />}
    </div>
  );
}
