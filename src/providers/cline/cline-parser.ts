import { UsageRecord } from '../../models/usage-record';
import { createRecordId, recordIdFor } from '../../core/dedup';
import { toNumber, toStringValue } from '../../core/value-utils';

/**
 * Parser Cline
 * ---------------------------------------------------------------------------
 * O formato interno do Cline mudou ao longo das versões; este parser cobre os
 * dois cenários observados e é defensivo (JSON inválido, campo ausente, nulo e
 * arquivo parcial nunca derrubam o monitoramento).
 *
 * 1. Cline v3+ (atual): cada sessão tem um arquivo RESUMO `<id>.json` com:
 *       metadata.totalCost                (custo USD total, já calculado)
 *       metadata.usage.inputTokens/outputTokens/cacheReadTokens/cacheWriteTokens
 *       metadata.modelId                  (modelo)
 *       started_at / ended_at             (timestamps)
 *    -> gera 1 registro por sessão, com ID ESTÁVEL baseado na identidade da
 *       sessão (o resumo é reescrito e cresce, então usamos upsert no core).
 *
 * 2. Formato legado: campos `api_req_res` com `{tokensIn, tokensOut, cost}`
 *    (possivelmente aninhados em `usage`). Usado como fallback.
 */

export interface ClineParseResult {
  records: UsageRecord[];
  /** Número de entradas encontradas mas não parseáveis (fallback legado). */
  malformed: number;
}

export interface ParsedClineUsage {
  tokensIn: number;
  tokensOut: number;
  costUsd?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  cachedTokens?: number;
  model?: string;
  timestamp?: string;
}

export function parseClineContent(content: string, sourceFile: string): ClineParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return parseLegacyApiReqRes(content, sourceFile);
  }

  const summary = parseSessionSummary(parsed, sourceFile);
  if (summary) {
    return { records: [summary], malformed: 0 };
  }

  return parseLegacyApiReqRes(content, sourceFile);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Parses o formato de resumo por sessão do Cline v3+. */
function parseSessionSummary(value: unknown, sourceFile: string): UsageRecord | undefined {
  if (!isObject(value)) {
    return undefined;
  }

  const metadata = isObject(value.metadata) ? value.metadata : undefined;
  const usageRaw: unknown = metadata?.usage ?? metadata?.aggregateUsage;
  const usage = isObject(usageRaw) ? usageRaw : undefined;

  const tokensIn = toNumber(usage?.inputTokens) ?? toNumber(metadata?.tokensIn);
  const tokensOut = toNumber(usage?.outputTokens) ?? toNumber(metadata?.tokensOut);
  const cacheRead = toNumber(usage?.cacheReadTokens) ?? toNumber(metadata?.cacheReads);
  const cacheWrite = toNumber(usage?.cacheWriteTokens) ?? toNumber(metadata?.cacheWrites);

  if (
    tokensIn === undefined &&
    tokensOut === undefined &&
    cacheRead === undefined &&
    cacheWrite === undefined
  ) {
    return undefined;
  }

  // Custo já vem calculado pelo Cline (totalCost em USD). Não aplicamos pricing.
  const costUsd = toNumber(metadata?.totalCost) ?? toNumber(usage?.totalCost) ?? 0;
  const model = toStringValue(metadata?.modelId) ?? toStringValue(value.model);
  const timestamp = toStringValue(value.started_at) ?? toStringValue(value.ended_at);
  const sessionId = toStringValue(value.session_id);

  const input = tokensIn ?? 0;
  const output = tokensOut ?? 0;
  const read = cacheRead ?? 0;
  const write = cacheWrite ?? 0;
  const cachedTokens = read + write > 0 ? read + write : undefined;

  return {
    // ID estável por sessão: permite upsert quando o resumo é atualizado.
    id: createRecordId(['cline', sourceFile, sessionId]),
    provider: 'cline',
    timestamp,
    model,
    tokensIn: input,
    tokensOut: output,
    cachedTokens,
    totalTokens: input + output,
    costUsd,
    sourceFile,
    metadata: {
      sessionId,
      cacheReadTokens: read,
      cacheWriteTokens: write,
    },
  };
}

/** Fallback para o formato legado com `api_req_res`. */
function parseLegacyApiReqRes(content: string, sourceFile: string): ClineParseResult {
  const records: UsageRecord[] = [];
  let malformed = 0;

  for (const value of extractApiReqResValues(content)) {
    const usage = extractUsage(value);
    if (!usage) {
      malformed += 1;
      continue;
    }

    const costUsd = usage.costUsd ?? 0;
    const totalTokens = usage.tokensIn + usage.tokensOut;

    records.push({
      id: recordIdFor(
        'cline',
        sourceFile,
        usage.timestamp,
        usage.tokensIn,
        usage.tokensOut,
        costUsd,
        usage.model,
      ),
      provider: 'cline',
      timestamp: usage.timestamp,
      model: usage.model,
      tokensIn: usage.tokensIn,
      tokensOut: usage.tokensOut,
      cachedTokens: usage.cachedTokens,
      totalTokens,
      costUsd,
      sourceFile,
      metadata: {
        cacheReadTokens: usage.cacheReadTokens,
        cacheWriteTokens: usage.cacheWriteTokens,
      },
    });
  }

  return { records, malformed };
}

/**
 * Extrai todos os valores associados à chave `api_req_res`.
 *
 * Estratégia em camadas:
 * 1. Tenta parsear o arquivo inteiro como JSON e vasculhar recursivamente por
 *    `api_req_res` (funciona para arquivos bem formados).
 * 2. Se nada for encontrado (arquivo parcial/incompleto), usa regex para
 *    localizar `"api_req_res": "<string JSON>"` no texto bruto.
 */
export function extractApiReqResValues(content: string): unknown[] {
  const found: unknown[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = undefined;
  }

  if (parsed !== undefined) {
    collectApiReqResRecursive(parsed, found);
  }

  if (found.length === 0) {
    const re = /"api_req_res"\s*:\s*"((?:\\.|[^"\\])*)"/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const raw = m[1];
      try {
        const unescaped = JSON.parse('"' + raw + '"');
        // O valor pode ser ele mesmo uma string JSON (case do enunciado).
        if (typeof unescaped === 'string') {
          try {
            found.push(JSON.parse(unescaped));
          } catch {
            found.push(unescaped);
          }
        } else {
          found.push(unescaped);
        }
      } catch {
        // Ignora ocorrência malformada; será refletida como "sem tokens".
      }
    }
  }

  return found;
}

function collectApiReqResRecursive(value: unknown, out: unknown[]): void {
  if (value === null || value === undefined) {
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectApiReqResRecursive(item, out);
    }
    return;
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const [key, v] of Object.entries(obj)) {
      if (key === 'api_req_res') {
        out.push(resolveApiReqRes(v));
      } else {
        collectApiReqResRecursive(v, out);
      }
    }
  }
}

function resolveApiReqRes(value: unknown): unknown {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

/** Normaliza um payload `api_req_res` em números de uso. */
export function extractUsage(value: unknown): ParsedClineUsage | undefined {
  const block = findTokenBlock(value, 0);
  const root =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const tokensIn = toNumber(block?.tokensIn ?? block?.input_tokens ?? block?.inputTokens);
  const tokensOut = toNumber(block?.tokensOut ?? block?.output_tokens ?? block?.outputTokens);

  if (tokensIn === undefined && tokensOut === undefined) {
    return undefined;
  }

  const cacheRead = toNumber(block?.cache_read_input_tokens ?? block?.cacheReadInputTokens);
  const cacheWrite = toNumber(
    block?.cache_creation_input_tokens ?? block?.cacheWriteInputTokens,
  );

  const costUsd = toNumber(root.cost ?? block?.cost);
  const model = toStringValue(root.model ?? block?.model);
  const timestamp = toStringValue(
    root.timestamp ?? root.ts ?? root.created_at ?? block?.timestamp ?? block?.ts,
  );

  const input = tokensIn ?? 0;
  const output = tokensOut ?? 0;
  const read = cacheRead ?? 0;
  const write = cacheWrite ?? 0;
  const cachedTokens = read + write > 0 ? read + write : undefined;

  return {
    tokensIn: input,
    tokensOut: output,
    costUsd,
    cacheReadTokens: cacheRead,
    cacheWriteTokens: cacheWrite,
    cachedTokens,
    model,
    timestamp,
  };
}

/**
 * Procura (recursivamente, com profundidade limitada) o objeto que contém os
 * campos de tokens. Aceita `usage` como chave intermediária.
 */
function findTokenBlock(value: unknown, depth: number): Record<string, unknown> | undefined {
  if (depth > 8 || value === null || typeof value !== 'object') {
    return undefined;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findTokenBlock(item, depth + 1);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  const obj = value as Record<string, unknown>;

  if (obj.usage && typeof obj.usage === 'object' && !Array.isArray(obj.usage)) {
    const inner = findTokenBlock(obj.usage, depth + 1);
    if (inner) {
      return inner;
    }
  }

  const tokenKeys = [
    'tokensIn',
    'tokensOut',
    'input_tokens',
    'output_tokens',
    'inputTokens',
    'outputTokens',
  ];
  if (tokenKeys.some((k) => k in obj)) {
    return obj;
  }

  for (const child of Object.values(obj)) {
    const found = findTokenBlock(child, depth + 1);
    if (found) {
      return found;
    }
  }

  return undefined;
}
