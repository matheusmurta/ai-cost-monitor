import { ModelPricing } from '../../models/usage-record';

/**
 * Tabela de preços — CENTRALIZADA.
 * ---------------------------------------------------------------------------
 * IMPORTANTE: estes valores são provisórios, baseados em documentação pública
 * conhecida, e DEVEM ser revisados/atualizados contra os preços oficiais da
 * Anthropic antes de qualquer uso em produção. Nada aqui é enviado para fora
 * da máquina; são apenas constantes locais usadas para calcular custo.
 *
 * Unidade: USD por 1 milhão de tokens.
 * cacheRead  ~ 0.1x input;  cacheWrite ~ 1.25x input (quando aplicável).
 */
const USD_PER_MILLION = 1;

function m(
  input: number,
  output: number,
  cacheRead?: number,
  cacheWrite?: number,
): ModelPricing {
  const pricing: ModelPricing = {
    inputPerMillionTokens: input * USD_PER_MILLION,
    outputPerMillionTokens: output * USD_PER_MILLION,
  };
  if (cacheRead !== undefined) {
    pricing.cacheReadPerMillionTokens = cacheRead * USD_PER_MILLION;
  }
  if (cacheWrite !== undefined) {
    pricing.cacheWritePerMillionTokens = cacheWrite * USD_PER_MILLION;
  }
  return pricing;
}

export const DEFAULT_MODEL_KEY = 'claude-3-5-sonnet';

/**
 * Fallback usado quando nenhum modelo é identificado.
 * Baseado no default configurável (aiCostMonitor.defaultModel).
 */
export const FALLBACK_PRICING: ModelPricing = m(3, 15, 0.3, 3.75);

export const MODEL_PRICING: Record<string, ModelPricing> = {
  // Claude 3.5 Sonnet
  'claude-3-5-sonnet': m(3, 15, 0.3, 3.75),
  'claude-3-5-sonnet-20240620': m(3, 15),
  'claude-3-5-sonnet-20241022': m(3, 15, 0.3, 3.75),

  // Claude 3.5 Haiku
  'claude-3-5-haiku': m(0.8, 4, 0.08, 1.0),
  'claude-3-5-haiku-20241022': m(0.8, 4, 0.08, 1.0),

  // Claude 3.7 Sonnet
  'claude-3-7-sonnet': m(3, 15, 0.3, 3.75),
  'claude-3-7-sonnet-20250219': m(3, 15, 0.3, 3.75),

  // Claude 4
  'claude-sonnet-4': m(3, 15, 0.3, 3.75),
  'claude-sonnet-4-20250514': m(3, 15, 0.3, 3.75),
  'claude-opus-4': m(15, 75, 1.5, 18.75),
  'claude-opus-4-20250514': m(15, 75, 1.5, 18.75),

  // Claude 3 (legado)
  'claude-3-haiku': m(0.25, 1.25),
  'claude-3-sonnet': m(3, 15),
  'claude-3-opus': m(15, 75),
};

function normalizeModel(model: string): string {
  return model.trim().toLowerCase();
}

export interface ResolvedPricing {
  key: string;
  pricing: ModelPricing;
}

/** Retorna a melhor correspondência para um nome de modelo. */
export function findPricing(model: string): ResolvedPricing | undefined {
  const normalized = normalizeModel(model);
  if (!normalized) {
    return undefined;
  }

  if (MODEL_PRICING[normalized]) {
    return { key: normalized, pricing: MODEL_PRICING[normalized] };
  }

  // Remove sufixo de data/versão (ex.: -20241022, -20250514).
  const withoutDate = normalized.replace(/-\d{8,}$/, '');
  if (withoutDate && MODEL_PRICING[withoutDate]) {
    return { key: withoutDate, pricing: MODEL_PRICING[withoutDate] };
  }

  // Correspondência por substring (ex.: nome com prefixo "anthropic.").
  let best: ResolvedPricing | undefined;
  for (const [key, pricing] of Object.entries(MODEL_PRICING)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      if (!best || key.length > best.key.length) {
        best = { key, pricing };
      }
    }
  }
  return best;
}

/**
 * Resolve o preço de um modelo. Se o modelo não for identificado, usamos o
 * default (configurável) e marcamos como inferido.
 */
export class PriceResolver {
  constructor(private readonly defaultModel: string) {}

  resolve(model?: string): { pricing: ModelPricing; model: string; inferred: boolean } {
    if (model) {
      const match = findPricing(model);
      if (match) {
        return { pricing: match.pricing, model: match.key, inferred: false };
      }
    }

    const fallback = findPricing(this.defaultModel);
    if (fallback) {
      return { pricing: fallback.pricing, model: fallback.key, inferred: true };
    }
    return { pricing: FALLBACK_PRICING, model: DEFAULT_MODEL_KEY, inferred: true };
  }
}
