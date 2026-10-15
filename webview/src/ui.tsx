import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { TrendingUp, TrendingDown, Info, Inbox } from 'lucide-react';

export function Card({ title, icon, right, children, className = '', tip }: { title?: string; icon?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; className?: string; tip?: string }) {
  return (
    <div className={`card p-4 fade-in ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-100 font-semibold text-[13px]">
            {icon && <span className="text-blue-glow">{icon}</span>}{title}
            {tip && <span title={tip} className="text-muted cursor-help"><Info size={13} /></span>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export function Kpi({ label, value, sub, change, icon, color = '#3B82F6', tip, invert }: { label: string; value: string; sub?: string; change: number | null; icon: React.ReactNode; color?: string; tip?: string; invert?: boolean }) {
  const good = change === null ? null : invert ? change <= 0 : change >= 0;
  return (
    <div className="card p-4 fade-in hover:border-blue/40 transition-colors" title={tip}>
      <div className="flex items-center justify-between">
        <span className="text-muted text-xs">{label}</span>
        <span className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: `${color}22`, color }}>{icon}</span>
      </div>
      <div className="text-2xl font-semibold text-white mt-2 tracking-tight">{value}</div>
      <div className="flex items-center gap-2 mt-1 text-xs min-h-[16px]">
        {change !== null ? (
          <span className={`flex items-center gap-0.5 ${good ? 'text-ok' : 'text-bad'}`}>
            {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{change >= 0 ? '+' : ''}{(change * 100).toFixed(1)}%
          </span>
        ) : <span className="text-muted/70">no comparable baseline</span>}
        {sub && <span className="text-muted truncate">{sub}</span>}
      </div>
    </div>
  );
}

const BASE = {
  backgroundColor: 'transparent', textStyle: { color: '#8193B2', fontFamily: 'Inter, Segoe UI, sans-serif' },
  tooltip: { backgroundColor: '#0E1828', borderColor: '#1E2B42', textStyle: { color: '#E2E8F0', fontSize: 12 }, confine: true },
  grid: { left: 8, right: 12, top: 28, bottom: 8, containLabel: true },
};

export function Chart({ option, height = 240, onClick }: { option: any; height?: number; onClick?: (p: any) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inst = useRef<echarts.ECharts>();
  const cb = useRef(onClick); cb.current = onClick;
  useEffect(() => {
    inst.current = echarts.init(ref.current!, undefined, { renderer: 'canvas' });
    inst.current.on('click', p => cb.current?.(p));
    const ro = new ResizeObserver(() => inst.current?.resize());
    ro.observe(ref.current!);
    return () => { ro.disconnect(); inst.current?.dispose(); };
  }, []);
  useEffect(() => { inst.current?.setOption({ ...BASE, ...option }, true); }, [option]);
  return <div ref={ref} style={{ height, cursor: onClick ? 'pointer' : 'default' }} />;
}

export const axis = (extra: any = {}) => ({ axisLine: { lineStyle: { color: '#1E2B42' } }, splitLine: { lineStyle: { color: '#1E2B42', type: 'dashed' } }, axisLabel: { color: '#8193B2', fontSize: 11 }, ...extra });

export function Empty({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 text-muted gap-2">
      <Inbox size={28} className="text-line" /><div className="text-slate-300 font-medium">{title}</div>
      {text && <div className="max-w-md text-xs">{text}</div>}{action}
    </div>
  );
}

export const Skel = ({ h = 240 }: { h?: number }) => <div className="skeleton w-full" style={{ height: h }} />;

export function Badge({ children, color = '#3B82F6' }: { children: React.ReactNode; color?: string }) {
  return <span className="px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap" style={{ background: `${color}22`, color }}>{children}</span>;
}

export function Field({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  const na = v === null || v === undefined || v === '';
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-line/60 last:border-0">
      <span className="text-muted text-xs shrink-0">{k}</span>
      <span className={`text-right break-all text-xs ${mono ? 'font-mono' : ''} ${na ? 'text-muted/60 italic' : 'text-slate-200'}`}>{na ? 'Not available from source' : v}</span>
    </div>
  );
}
