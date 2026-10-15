import * as path from 'path';
import { Adapter, ParseResult, RawRequest, SourceLocation, num } from '../core/types';
import { readWithRetry, walk } from '../core/fsutil';
import { normalizeProvider, projectFromPath } from '../core/provider';

/**
 * Claude Code: ~/.claude/projects/<encoded-cwd>/<sessionId>.jsonl (+ subagents/*.jsonl).
 * Each assistant line carries message.id + requestId + usage. During streaming the same
 * message.id is written multiple times (one per content block) with cumulative usage, so the
 * logical request key is `${message.id}:${requestId}` and the LAST line wins (upsert in storage).
 */
export const claudeCodeAdapter: Adapter = {
  tool: 'claude-code',
  incremental: true,
  async listFiles(loc) { return walk(loc.root, f => f.endsWith('.jsonl'), 4); },
  async parseFile(file, loc, fromOffset): Promise<ParseResult> {
    const buf = await readWithRetry(file, fromOffset);
    // Only consume complete lines: a trailing partial line is left for the next sync.
    const lastNl = buf.lastIndexOf(0x0a);
    const consumed = lastNl >= 0 ? lastNl + 1 : 0;
    const text = buf.subarray(0, consumed).toString('utf8');
    const out = new Map<string, RawRequest>();
    const sessions = new Set<string>();
    let errors = 0;
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      let o: any;
      try { o = JSON.parse(line); } catch { errors++; continue; }
      if (o?.sessionId) sessions.add(o.sessionId);
      if (o?.type !== 'assistant' || !o.message?.usage) continue;
      const m = o.message, u = m.usage;
      if (m.model === '<synthetic>') continue; // locally synthesized (no API call)
      const key = `${m.id ?? o.uuid}:${o.requestId ?? ''}`;
      const ts = Date.parse(o.timestamp);
      if (!Number.isFinite(ts)) { errors++; continue; }
      const cc = u.cache_creation ?? {};
      out.set(key, {
        sourceTool: 'claude-code', sourceVersion: o.version ?? null,
        provider: normalizeProvider('anthropic'), model: m.model ?? null,
        workspacePath: o.cwd ?? null, projectId: projectFromPath(o.cwd),
        sessionId: o.sessionId ?? null, taskId: null,
        requestId: o.requestId ?? null, messageId: m.id ?? null,
        startedAt: ts, finishedAt: null, durationMs: null,
        inputTokens: num(u.input_tokens), outputTokens: num(u.output_tokens),
        cacheReadTokens: num(u.cache_read_input_tokens), cacheWriteTokens: num(u.cache_creation_input_tokens),
        cacheWrite5mTokens: num(cc.ephemeral_5m_input_tokens), cacheWrite1hTokens: num(cc.ephemeral_1h_input_tokens),
        reasoningTokens: null, reportedCostUSD: num(o.costUSD),
        status: o.isApiErrorMessage ? 'error' : 'ok', errorCategory: o.isApiErrorMessage ? 'api_error' : null,
        sourceFile: file, sourceRecordId: key,
        metadata: { stopReason: m.stop_reason ?? null, serviceTier: u.service_tier ?? null, isSidechain: !!o.isSidechain,
          gitBranch: o.gitBranch ?? null, subagent: file.includes(`${path.sep}subagents${path.sep}`),
          webSearchRequests: u.server_tool_use?.web_search_requests ?? null },
      });
    }
    return { requests: [...out.values()], newOffset: fromOffset + consumed, sessions: [...sessions], errors };
  },
};

export function claudeLimitations(): string[] {
  return ['Cost is API-equivalent estimate (subscription billing not exposed).', 'Request duration not recorded.'];
}
export type { SourceLocation };
