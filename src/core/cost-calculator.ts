import { ModelPricing } from '../models/usage-record';

export interface CostComponents {
  inputCost: number;
  outputCost: number;
  cacheReadCost: number;
  cacheWriteCost: number;
  totalCost: number;
}

/**
 * Fórmula de custo
 * ----------------
 * inputCost  = inputTokens  / 1_000_000 * inputPerMillionTokens
 * outputCost = outputTokens / 1_000_000 * outputPerMillionTokens
 * cache não é somado aos tokens de entrada/saída; é fatiado separadamente.
 */
export class CostCalculator {
  calculate(
    inputTokens: number,
    outputTokens: number,
    pricing: ModelPricing,
    cacheReadTokens: number = 0,
    cacheWriteTokens: number = 0,
  ): CostComponents {
    const safe = (n: number): number => (Number.isFinite(n) ? Math.max(0, n) : 0);

    const input = safe(inputTokens);
    const output = safe(outputTokens);
    const cacheRead = safe(cacheReadTokens);
    const cacheWrite = safe(cacheWriteTokens);

    const inputCost = (input / 1_000_000) * safe(pricing.inputPerMillionTokens);
    const outputCost = (output / 1_000_000) * safe(pricing.outputPerMillionTokens);
    const cacheReadCost =
      pricing.cacheReadPerMillionTokens !== undefined
        ? (cacheRead / 1_000_000) * safe(pricing.cacheReadPerMillionTokens)
        : 0;
    const cacheWriteCost =
      pricing.cacheWritePerMillionTokens !== undefined
        ? (cacheWrite / 1_000_000) * safe(pricing.cacheWritePerMillionTokens)
        : 0;

    return {
      inputCost,
      outputCost,
      cacheReadCost,
      cacheWriteCost,
      totalCost: inputCost + outputCost + cacheReadCost + cacheWriteCost,
    };
  }
}
