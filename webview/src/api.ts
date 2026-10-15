// Message bridge to the extension host. The webview never reads files itself.
declare function acquireVsCodeApi(): { postMessage(m: unknown): void };
const vscode = acquireVsCodeApi();

let seq = 0;
const pending = new Map<number, (d: any) => void>();
type Listener = (m: any) => void;
const listeners = new Set<Listener>();

window.addEventListener('message', e => {
  const m = e.data;
  if (m?.type === 'reply' && pending.has(m.id)) { pending.get(m.id)!(m.data); pending.delete(m.id); return; }
  listeners.forEach(l => l(m));
});

export function request<T = any>(type: string, payload: Record<string, unknown> = {}): Promise<T> {
  const id = ++seq;
  return new Promise(res => { pending.set(id, res); vscode.postMessage({ type, id, ...payload }); });
}
export const send = (type: string, payload: Record<string, unknown> = {}) => vscode.postMessage({ type, ...payload });
export const onMessage = (l: Listener) => { listeners.add(l); return () => listeners.delete(l); };
