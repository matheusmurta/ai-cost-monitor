/**
 * Modelo unificado para todos os providers.
 * O núcleo (monitoring, aggregation, persistence) só conhece estas estruturas,
 * nunca o formato específico de logs de um provider.
 */

export type ProviderId = 'cline' | 'claude-code';

export interface UsageRecord {
  /** ID estável usado para deduplicação (ver core/dedup.ts). */
  id: string;

  provider: ProviderId;

  timestamp?: string;

  model?: string;

  tokensIn: number;

  tokensOut: number;

  /** Tokens de cache (quando o provider expõe). Somatório ou detalhado em metadata. */
  cachedTokens?: number;

  totalTokens: number;

  costUsd: number;

  /** true quando o custo foi calculado com um modelo inferido/default. */
  inferredModel?: boolean;

  /** Caminho (relativo ao workspace quando possível) do arquivo de origem. */
  sourceFile: string;

  metadata?: Record<string, unknown>;
}

/**
 * Tabela de preço por 1 milhão de tokens.
 * Centralizada para ser facilmente atualizada.
 */
export interface ModelPricing {
  inputPerMillionTokens: number;
  outputPerMillionTokens: number;
  cacheReadPerMillionTokens?: number;
  cacheWritePerMillionTokens?: number;
}
