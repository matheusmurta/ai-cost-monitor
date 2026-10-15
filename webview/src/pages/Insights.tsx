import React from 'react';
import { Lightbulb, TriangleAlert, TrendingUp, Info } from 'lucide-react';
import { useStore } from '../store';
import { Card, Empty } from '../ui';

const ICON = { warning: [TriangleAlert, '#F59E0B'], positive: [TrendingUp, '#22C55E'], info: [Lightbulb, '#3B82F6'] } as const;

export function InsightGrid({ limit }: { limit?: number }) {
  const { data, drill, openDetail } = useStore();
  const list = (data?.insights ?? []).slice(0, limit);
  if (!list.length) return <Card title="Insights"><Empty title="Not enough data for insights" text="Insights require minimum samples (e.g. 10 requests, 5 sessions, 7 active days) in the selected range." /></Card>;
  const go = (i: any) => {
    if (!i.drill) return;
    if (i.drill.type === 'request') openDetail(i.drill.key); else drill(i.drill.type, i.drill.key);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {list.map((i: any) => {
        const [I, c] = ICON[i.kind as keyof typeof ICON];
        return (
          <button key={i.id} onClick={() => go(i)} disabled={!i.drill} className="card p-4 text-left hover:border-blue/40 transition-colors fade-in disabled:cursor-default">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs text-muted"><span className="w-6 h-6 rounded-md grid place-items-center" style={{ background: c + '22', color: c }}><I size={13} /></span>{i.title}</span>
              <span title={`Method: ${i.basis}`} className="text-[10px] uppercase tracking-wide text-muted flex items-center gap-1"><Info size={11} />{i.confidence}</span>
            </div>
            <div className="text-lg font-semibold text-white mt-2 truncate" title={i.value}>{i.value}</div>
            <div className="text-xs text-muted mt-1 line-clamp-2">{i.detail}</div>
          </button>
        );
      })}
    </div>
  );
}

export function Insights() {
  return <div className="space-y-3"><p className="text-xs text-muted">Deterministic, offline analytics. Hover the confidence label to see the method and baseline. Correlation does not imply causality.</p><InsightGrid /></div>;
}
