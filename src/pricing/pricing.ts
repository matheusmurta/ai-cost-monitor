import { AIRequest, RawRequest, CostBasis } from '../core/types';

/** USD per 1M tokens. Public list prices (Anthropic / OpenAI pricing pages). Versioned. */
export interface Price { input: number; output: number; cacheRead?: number; cacheWrite5m?: number; cacheWrite1h?: number }
export const PRICE_VERSION = 'v1-2026-01';

// Matched by substring against the lowercased model id (first match wins, most specific first).
const TABLE: [string, Price][] = [
  ['opus-4-5', { input: 5, output: 25, cacheRead: 0.5, cacheWrite5m: 6.25, cacheWrite1h: 10 }],
  ['opus-4-6', { input: 5, output: 25, cacheRead: 0.5, cacheWrite5m: 6.25, cacheWrite1h: 10 }],
  ['opus-4', { input: 15, output: 75, cacheRead: 1.5, cacheWrite5m: 18.75, cacheWrite1h: 30 }],
  ['claude-3-opus', { input: 15, output: 75, cacheRead: 1.5, cacheWrite5m: 18.75, cacheWrite1h: 30 }],
  ['sonnet-4', { input: 3, output: 15, cacheRead: 0.3, cacheWrite5m: 3.75, cacheWrite1h: 6 }],
  ['sonnet-3-7', { input: 3, output: 15, cacheRead: 0.3, cacheWrite5m: 3.75, cacheWrite1h: 6 }],
  ['3-7-sonnet', { input: 3, output: 15, cacheRead: 0.3, cacheWrite5m: 3.75, cacheWrite1h: 6 }],
  ['3-5-sonnet', { input: 3, output: 15, cacheRead: 0.3, cacheWrite5m: 3.75, cacheWrite1h: 6 }],
  ['haiku-4-5', { input: 1, output: 5, cacheRead: 0.1, cacheWrite5m: 1.25, cacheWrite1h: 2 }],
  ['3-5-haiku', { input: 0.8, output: 4, cacheRead: 0.08, cacheWrite5m: 1, cacheWrite1h: 1.6 }],
  ['gpt-4o-mini', { input: 0.15, output: 0.6, cacheRead: 0.075 }],
  ['gpt-4o', { input: 2.5, output: 10, cacheRead: 1.25 }],
  ['gpt-4.1-mini', { input: 0.4, output: 1.6, cacheRead: 0.1 }],
  ['gpt-4.1', { input: 2, output: 8, cacheRead: 0.5 }],
];

export function findPrice(model: string | null, custom: Record<string, any> = {}): { price: Price; source: string } | null {
  if (!model) return null;
  const c = custom[model];
  if (c && typeof c.input === 'number' && typeof c.output === 'number') {
    return { price: { input: c.input, output: c.output, cacheRead: c.cacheRead, cacheWrite5m: c.cacheWrite ?? c.cacheWrite5m, cacheWrite1h: c.cacheWrite1h ?? c.cacheWrite }, source: 'custom' };
  }
  const m = model.toLowerCase();
  for (const [k, p] of TABLE) if (m.includes(k)) return { price: p, source: PRICE_VERSION };
  return null;
}

/** Returns null if any non-zero token category lacks a known price (never invents). */
export function estimateCost(r: RawRequest, custom?: Record<string, any>): { cost: number; source: string } | null {
  const f = findPrice(r.model, custom);
  if (!f) return null;
  const p = f.price, M = 1e6;
  if (r.inputTokens === null && r.outputTokens === null) return null;
  let cost = (r.inputTokens ?? 0) * p.input / M + (r.outputTokens ?? 0) * p.output / M;
  if (r.cacheReadTokens) { if (p.cacheRead === undefined) return null; cost += r.cacheReadTokens * p.cacheRead / M; }
  if (r.cacheWriteTokens) {
    const w1h = r.cacheWrite1hTokens ?? 0;
    const w5m = r.cacheWrite5mTokens ?? (r.cacheWriteTokens - w1h);
    if (p.cacheWrite5m === undefined) return null;
    cost += w5m * p.cacheWrite5m / M + w1h * (p.cacheWrite1h ?? p.cacheWrite5m) / M;
  }
  return { cost, source: f.source };
}

/**
 * Total tokens = input + output + cache read + cache write (+ reasoning when reported separately).
 * Anthropic reports input_tokens EXCLUDING cache tokens, so they are additive. Null if all unknown.
 */
export function totalTokens(r: RawRequest): number | null {
  const parts = [r.inputTokens, r.outputTokens, r.cacheReadTokens, r.cacheWriteTokens, r.reasoningTokens];
  if (parts.every(p => p === null)) return null;
  return parts.reduce<number>((a, b) => a + (b ?? 0), 0);
}

const LOCAL_PROVIDERS = new Set(['Ollama', 'LM Studio']);

export function finalize(r: RawRequest, custom?: Record<string, any>): AIRequest {
  const est = estimateCost(r, custom);
  let basis: CostBasis = 'unknown', eff: number | null = null;
  // Claude Code's costUSD (when present) and Cline/Roo `cost` are tool-recorded values.
  if (r.reportedCostUSD !== null) { basis = 'reported'; eff = r.reportedCostUSD; }
  else if (est) { basis = 'estimated'; eff = est.cost; }
  else if (r.provider && LOCAL_PROVIDERS.has(r.provider)) { basis = 'estimated'; eff = 0; }
  return {
    ...r,
    projectId: r.projectId ?? null,
    id: `${r.sourceTool}:${r.sourceRecordId}`,
    totalTokens: totalTokens(r),
    estimatedCostUSD: est?.cost ?? null,
    effectiveCostUSD: eff,
    costBasis: basis,
    priceVersion: est?.source ?? null,
  };
}
