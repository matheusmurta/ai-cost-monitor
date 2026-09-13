import { toNumber, toStringValue } from '../../core/value-utils';

/**
 * Parser Claude Code (JSONL)
 * ---------------------------------------------------------------------------
 * Cada linha é um JSON independente. Eventos que NÃO representam uso são
 * ignorados silenciosamente (não são erros). O parser busca a propriedade
 * `usage` e extrai `input_tokens`/`output_tokens`, além de campos de cache
 * opcionais (`cache_creation_input_tokens`, `cache_read_input_tokens`).
 *
 * Hipóteses (documentadas — o formato do Claude Code pode mudar):
 * - `usage` pode estar no topo ou aninhado dentro de `message`.
 * - `model` e `timestamp` são opcionais e procurados em alguns níveis.
 * - O custo NÃO é calculado aqui (fica no provider, via pricing centralizado).
 */

export interface ClaudeEvent {
  tokensIn: number;
  tokensOut: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  cachedTokens?: number;
  model?: string;
  timestamp?: string;
}

export interface ClaudeParseResult {
  events: ClaudeEvent[];
  /** Linhas com JSON inválido (não confundir com linhas sem usage). */
  malformed: number;
}

export function parseClaudeJsonl(content: string, sourceFile: string): ClaudeParseResult {
  const events: ClaudeEvent[] = [];
  let malformed = 0;

  const lines = content.split('\n');
  for (const line of lines) {
    if (line.trim().length === 0) {
      continue;
    }

    let obj: unknown;
    try {
      obj = JSON.parse(line);
    } catch {
      malformed += 1;
      continue;
    }

    const usage = findUsage(obj);
    if (!usage) {
      // Linha sem evento de uso — ignora (não é erro).
      continue;
    }

    const tokensIn = toNumber(usage.input_tokens);
    const tokensOut = toNumber(usage.output_tokens);
    if (tokensIn === undefined && tokensOut === undefined) {
      continue;
    }

    const cacheRead = toNumber(usage.cache_read_input_tokens);
    const cacheWrite = toNumber(usage.cache_creation_input_tokens);
    const read = cacheRead ?? 0;
    const write = cacheWrite ?? 0;

    const input = tokensIn ?? 0;
    const output = tokensOut ?? 0;
    if (input === 0 && output === 0 && read === 0 && write === 0) {
      // Evento sem consumo real (ex.: billing_error) — não representa uso.
      continue;
    }

    events.push({
      tokensIn: input,
      tokensOut: output,
      cacheReadTokens: cacheRead,
      cacheWriteTokens: cacheWrite,
      cachedTokens: read + write > 0 ? read + write : undefined,
      model: extractModel(obj),
      timestamp: extractTimestamp(obj),
    });
  }

  return { events, malformed };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function findUsage(value: unknown, depth: number = 0): Record<string, unknown> | undefined {
  if (depth > 10) {
    return undefined;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findUsage(item, depth + 1);
      if (found) {
        return found;
      }
    }
    return undefined;
  }
  if (!isObject(value)) {
    return undefined;
  }
  if (isObject(value.usage)) {
    const inner = findUsage(value.usage, depth + 1);
    if (inner) {
      return inner;
    }
    // `usage` que contém os campos diretamente.
    if ('input_tokens' in value.usage || 'output_tokens' in value.usage) {
      return value.usage as Record<string, unknown>;
    }
  }
  for (const child of Object.values(value)) {
    const found = findUsage(child, depth + 1);
    if (found) {
      return found;
    }
  }
  return undefined;
}

function findStringKey(value: unknown, keys: string[], depth: number = 0): string | undefined {
  if (depth > 10) {
    return undefined;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findStringKey(item, keys, depth + 1);
      if (found) {
        return found;
      }
    }
    return undefined;
  }
  if (!isObject(value)) {
    return undefined;
  }
  for (const [key, v] of Object.entries(value)) {
    if (keys.includes(key)) {
      const s = toStringValue(v);
      if (s) {
        return s;
      }
    }
  }
  for (const child of Object.values(value)) {
    const found = findStringKey(child, keys, depth + 1);
    if (found) {
      return found;
    }
  }
  return undefined;
}

function extractModel(obj: unknown): string | undefined {
  return findStringKey(obj, ['model']);
}

function extractTimestamp(obj: unknown): string | undefined {
  return findStringKey(obj, ['timestamp', 'created_at', 'createdAt']);
}
