import React, { useEffect, useState } from 'react';
import { X, Copy, FolderOpen, Eye } from 'lucide-react';
import { useStore } from '../store';
import { request, send } from '../api';
import { Field, Badge } from '../ui';
import { int, usd, dt, dur, toolName, TOOL_COLOR } from '../format';

export function Detail() {
  const { detailId, openDetail, host, drill } = useStore();
  const [r, setR] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => { setR(null); setPreview(null); request('request', { requestId: detailId }).then(setR); }, [detailId]);
  const S = ({ t, children }: any) => <div className="mb-4"><div className="text-[11px] uppercase tracking-wide text-muted mb-1">{t}</div><div className="bg-panel2 rounded-lg px-3 py-1 border border-line">{children}</div></div>;
  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/40" onClick={() => openDetail(null)}>
      <div className="w-[460px] h-full bg-panel border-l border-line overflow-auto p-5 fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-white font-semibold">Request Detail</div>
          <button className="text-muted hover:text-white" onClick={() => openDetail(null)} aria-label="close"><X size={16} /></button>
        </div>
        {!r ? <div className="skeleton h-96" /> : (<>
          <div className="flex items-center gap-2 mb-4"><Badge color={TOOL_COLOR[r.sourceTool]}>{toolName(r.sourceTool)}</Badge><Badge color={r.status === 'ok' ? '#22C55E' : '#EF4444'}>{r.status}</Badge>
            <button className="btn ml-auto text-xs" onClick={() => send('copy', { text: r.id })}><Copy size={12} />Copy ID</button></div>
          <S t="Identification">
            <Field k="Record ID" v={r.id} mono /><Field k="Request ID" v={r.requestId} mono /><Field k="Message ID" v={r.messageId} mono />
            <Field k="Session ID" v={r.sessionId && <button className="text-blue-glow hover:underline" onClick={() => { openDetail(null); drill('session', `${r.sourceTool}|${r.sessionId}`); }}>{r.sessionId}</button>} />
            <Field k="Task ID" v={r.taskId} mono /><Field k="Provider" v={r.provider} /><Field k="Model" v={r.model} /><Field k="Tool version" v={r.sourceVersion} />
          </S>
          <S t="Token breakdown">
            <Field k="Input" v={r.inputTokens !== null ? int(r.inputTokens) : null} /><Field k="Output" v={r.outputTokens !== null ? int(r.outputTokens) : null} />
            <Field k="Cache read" v={r.cacheReadTokens !== null ? int(r.cacheReadTokens) : null} /><Field k="Cache write" v={r.cacheWriteTokens !== null ? int(r.cacheWriteTokens) : null} />
            <Field k="Cache write 5m / 1h" v={r.cacheWrite5mTokens !== null || r.cacheWrite1hTokens !== null ? `${int(r.cacheWrite5mTokens)} / ${int(r.cacheWrite1hTokens)}` : null} />
            <Field k="Reasoning" v={r.reasoningTokens !== null ? int(r.reasoningTokens) : null} /><Field k="Total" v={r.totalTokens !== null ? int(r.totalTokens) : null} />
          </S>
          <S t="Billing">
            <Field k="Recorded cost (tool)" v={r.reportedCostUSD !== null ? usd(r.reportedCostUSD) : null} />
            <Field k="Estimated API-equivalent" v={r.estimatedCostUSD !== null ? usd(r.estimatedCostUSD) : null} />
            <Field k="Effective cost" v={r.effectiveCostUSD !== null ? usd(r.effectiveCostUSD) : null} /><Field k="Cost basis" v={r.costBasis} />
            <Field k="Pricing source" v={r.priceVersion ?? (r.costBasis === 'reported' ? 'tool-recorded' : null)} />
            <Field k="Actual billed cost" v={null} />
          </S>
          <S t="Timeline">
            <Field k="Start" v={dt(r.startedAt)} /><Field k="End" v={r.finishedAt ? dt(r.finishedAt) : null} />
            <Field k="Duration" v={r.durationMs !== null ? dur(r.durationMs) + (r.metadata?.durationIsProxy ? ' (approx.)' : '') : null} /><Field k="Error" v={r.errorCategory} />
          </S>
          <S t="Context">
            <Field k="Project" v={r.projectId} /><Field k="Workspace" v={r.workspacePath} mono /><Field k="Source file" v={r.sourceFile} mono /><Field k="Source record" v={r.sourceRecordId} mono />
          </S>
          <S t="Metadata">{Object.entries(r.metadata ?? {}).map(([k, v]) => <Field key={k} k={k} v={v === null ? null : String(v)} />)}</S>
          <div className="flex gap-2 mb-3">
            <button className="btn text-xs" onClick={() => send('openSource', { requestId: r.id })}><FolderOpen size={12} />Reveal source file</button>
            <button className="btn text-xs" disabled={!host?.settings?.allowContentPreview} title={host?.settings?.allowContentPreview ? '' : 'Enable content preview in Settings → Privacy'}
              onClick={() => request('preview', { requestId: r.id }).then(setPreview)}><Eye size={12} />Preview content</button>
          </div>
          {preview !== null && <pre className="bg-panel2 border border-line rounded-lg p-3 text-[11px] whitespace-pre-wrap max-h-80 overflow-auto text-slate-300">{preview}</pre>}
        </>)}
      </div>
    </div>
  );
}
