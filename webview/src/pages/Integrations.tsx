import React from 'react';
import { RefreshCw, FolderPlus, CheckCircle2, XCircle, TriangleAlert, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { send } from '../api';
import { Card, Badge } from '../ui';
import { ago, int, toolName, TOOL_COLOR } from '../format';

const ALL = ['claude-code', 'cline', 'roo-code', 'kilo-code'];
const HC: Record<string, string> = { 'up-to-date': '#22C55E', partial: '#F59E0B', importing: '#3B82F6', unavailable: '#8193B2', error: '#EF4444' };

export function Integrations() {
  const { host, progress } = useStore();
  const st: any[] = host?.statuses ?? [];
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={() => send('rescan')} disabled={host?.syncing}><RefreshCw size={14} className={host?.syncing ? 'animate-spin' : ''} />Rescan Sources</button>
        <button className="btn" onClick={() => send('addFolder')}><FolderPlus size={14} />Add folder manually (fallback)</button>
      </div>
      {(host?.syncing || progress.length > 0) && <Card title="Import log" icon={host?.syncing ? <Loader2 size={14} className="animate-spin" /> : undefined}>
        <div className="font-mono text-[11px] text-muted space-y-0.5 max-h-40 overflow-auto">{progress.slice(-15).map((m, i) => <div key={i}>{m}</div>)}</div></Card>}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {ALL.map(tool => {
          const srcs = st.filter(s => s.tool === tool);
          const found = srcs.length > 0;
          return (
            <Card key={tool} title={toolName(tool)} right={found ? <span className="flex items-center gap-1 text-ok text-xs"><CheckCircle2 size={14} />Detected</span> : <span className="flex items-center gap-1 text-muted text-xs"><XCircle size={14} />Not found</span>}>
              {!found && <div className="text-xs text-muted">No local data directory found for this tool. Other integrations continue normally.</div>}
              {srcs.map(s => (
                <div key={s.root} className="bg-panel2 border border-line rounded-lg p-3 mb-2 text-xs space-y-1">
                  <div className="flex items-center gap-2"><Badge color={TOOL_COLOR[tool]}>{s.kind}</Badge><Badge color={HC[s.health]}>{s.health}</Badge></div>
                  <div className="font-mono text-[11px] text-slate-300 break-all">{s.root}</div>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <div><div className="text-muted">Files</div>{int(s.files)}</div><div><div className="text-muted">Sessions</div>{int(s.sessions)}</div>
                    <div><div className="text-muted">Requests</div>{int(s.requests)}</div><div><div className="text-muted">Last update</div>{ago(s.lastSync)}</div>
                  </div>
                  {s.errors > 0 && <div className="text-warn flex items-center gap-1"><TriangleAlert size={12} />{s.errors} invalid/partial records skipped</div>}
                  {s.message && <div className="text-bad">{s.message}</div>}
                  {s.limitations?.length > 0 && <ul className="text-muted list-disc pl-4">{s.limitations.map((l: string) => <li key={l}>{l}</li>)}</ul>}
                </div>))}
            </Card>);
        })}
      </div>
    </div>
  );
}
