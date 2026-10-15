export const TOOL_LABEL: Record<string, string> = { 'claude-code': 'Claude Code', cline: 'Cline', 'roo-code': 'Roo Code', 'kilo-code': 'Kilo Code' };
export const TOOL_COLOR: Record<string, string> = { 'claude-code': '#8B5CF6', cline: '#3B82F6', 'roo-code': '#22D3EE', 'kilo-code': '#F59E0B' };
export const PALETTE = ['#3B82F6', '#8B5CF6', '#22D3EE', '#22C55E', '#F59E0B', '#EC4899', '#14B8A6', '#A3E635', '#F97316', '#64748B'];

export const tok = (n: number | null | undefined) => n === null || n === undefined ? '—'
  : n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${Math.round(n)}`;
export const int = (n: number | null | undefined) => n === null || n === undefined ? '—' : Math.round(n).toLocaleString('en-US');
export const usd = (n: number | null | undefined) => n === null || n === undefined ? '—'
  : `$${Math.abs(n) < 1 && n !== 0 ? n.toFixed(4) : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const brl = (n: number | null | undefined, rate: number) => n === null || n === undefined || !rate ? '' : `R$ ${(n * rate).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const dt = (t: number | null | undefined) => t ? new Date(t).toLocaleString() : '—';
export const dur = (ms: number | null | undefined) => ms === null || ms === undefined ? '—'
  : ms < 1000 ? `${ms}ms` : ms < 60000 ? `${(ms / 1000).toFixed(1)}s` : ms < 3600000 ? `${(ms / 60000).toFixed(1)}m` : `${(ms / 3600000).toFixed(1)}h`;
export const ago = (t: number | null | undefined) => {
  if (!t) return 'never';
  const s = (Date.now() - t) / 1000;
  return s < 60 ? 'just now' : s < 3600 ? `${Math.floor(s / 60)}m ago` : s < 86400 ? `${Math.floor(s / 3600)}h ago` : `${Math.floor(s / 86400)}d ago`;
};
/** Relative change; null when baseline is unavailable or zero (comparison not valid). */
export const delta = (cur: number, prev: number | null | undefined) => prev === null || prev === undefined || prev === 0 ? null : cur / prev - 1;
export const toolName = (t: string) => TOOL_LABEL[t] ?? t;
export const sessionLabel = (key: string) => { const [t, s] = key.split('|'); return `${toolName(t)} · ${s?.slice(0, 18) ?? key}`; };
