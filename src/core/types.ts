export type SourceTool = 'claude-code' | 'cline' | 'roo-code' | 'kilo-code';
export type CostBasis = 'reported' | 'estimated' | 'unknown';

/** Canonical normalized AI request. Fields not guaranteed by the source are nullable (unknown != 0). */
export interface AIRequest {
  id: string;
  sourceTool: SourceTool;
  sourceVersion: string | null;
  provider: string | null;
  model: string | null;
  projectId: string | null;
  workspacePath: string | null;
  sessionId: string | null;
  taskId: string | null;
  requestId: string | null;
  messageId: string | null;
  startedAt: number; // epoch ms
  finishedAt: number | null;
  durationMs: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  cacheReadTokens: number | null;
  cacheWriteTokens: number | null;
  cacheWrite5mTokens: number | null;
  cacheWrite1hTokens: number | null;
  reasoningTokens: number | null;
  totalTokens: number | null;
  reportedCostUSD: number | null;
  estimatedCostUSD: number | null;
  effectiveCostUSD: number | null;
  costBasis: CostBasis;
  priceVersion: string | null;
  status: 'ok' | 'error' | 'cancelled' | 'unknown';
  errorCategory: string | null;
  sourceFile: string;
  sourceRecordId: string;
  metadata: Record<string, unknown>;
}

export type RawRequest = Omit<AIRequest, 'id' | 'totalTokens' | 'estimatedCostUSD' | 'effectiveCostUSD' | 'costBasis' | 'priceVersion' | 'projectId'> & { projectId?: string | null };

export interface SourceLocation {
  tool: SourceTool;
  kind: string; // e.g. 'claude-projects', 'cline-legacy', 'cline-v2'
  root: string;
  limitations: string[];
}

export interface FileCheckpoint { file: string; size: number; mtimeMs: number; offset: number; }

export interface ParseResult {
  requests: RawRequest[];
  newOffset: number; // for incremental (jsonl) parsers
  sessions: string[];
  errors: number;
}

export interface Adapter {
  tool: SourceTool;
  /** List candidate files for a source root. */
  listFiles(loc: SourceLocation): Promise<string[]>;
  /** True if file is append-only (parse from checkpoint offset). */
  incremental: boolean;
  parseFile(file: string, loc: SourceLocation, fromOffset: number): Promise<ParseResult>;
}

export const num = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null;
