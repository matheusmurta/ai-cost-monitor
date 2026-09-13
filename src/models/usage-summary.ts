export interface ProviderBreakdown {
  tokensIn: number;
  tokensOut: number;
  totalTokens: number;
  costUsd: number;
  records: number;
}

export interface ModelBreakdown {
  tokensIn: number;
  tokensOut: number;
  totalTokens: number;
  costUsd: number;
  records: number;
}

export interface UsageSummary {
  totalTokensIn: number;
  totalTokensOut: number;
  totalTokens: number;
  totalCostUsd: number;
  totalRecords: number;

  byProvider: Record<string, ProviderBreakdown>;
  byModel: Record<string, ModelBreakdown>;
}
