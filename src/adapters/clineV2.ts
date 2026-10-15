import * as path from 'path';
import { Adapter, ParseResult, RawRequest, num } from '../core/types';
import { readJson, walk } from '../core/fsutil';
import { normalizeProvider, projectFromPath } from '../core/provider';

/**
 * Cline v2 (~/.cline/data/sessions/<id>/<id>.messages.json): each assistant message carries
 * `metrics` (inputTokens/outputTokens/cacheReadTokens/cacheWriteTokens/cost) for the call that
 * produced it. Session-level `metadata.usage` in <id>.json is an aggregate and is NOT summed.
 */
export const clineV2Adapter: Adapter = {
  tool: 'cline', incremental: false,
  async listFiles(loc) { return walk(path.join(loc.root, 'sessions'), f => f.endsWith('.messages.json'), 2); },
  async parseFile(file): Promise<ParseResult> {
    const doc = await readJson(file);
    const msgs = doc?.messages;
    if (!Array.isArray(msgs)) return { requests: [], newOffset: 0, sessions: [], errors: 1 };
    const sid: string = doc.sessionId ?? path.basename(file).replace('.messages.json', '');
    const sess = (await readJson(file.replace(/\.messages\.json$/, '.json'))) ?? {};
    const ws = sess.workspace_root ?? sess.cwd ?? null;
    const reqs: RawRequest[] = [];
    let errors = 0;
    for (const m of msgs) {
      if (m?.role !== 'assistant' || !m.metrics) continue;
      const x = m.metrics;
      const ts = typeof m.ts === 'number' ? m.ts : Date.parse(doc.updated_at);
      if (!Number.isFinite(ts)) { errors++; continue; }
      const model = m.modelInfo?.id ?? sess.model ?? null;
      reqs.push({
        sourceTool: 'cline', sourceVersion: doc.origin?.version ?? null,
        provider: normalizeProvider(m.modelInfo?.provider ?? sess.provider, model), model,
        workspacePath: ws, projectId: projectFromPath(ws), sessionId: sid, taskId: sid,
        requestId: null, messageId: m.id ?? null,
        startedAt: ts, finishedAt: null, durationMs: null,
        inputTokens: num(x.inputTokens), outputTokens: num(x.outputTokens),
        cacheReadTokens: num(x.cacheReadTokens), cacheWriteTokens: num(x.cacheWriteTokens),
        cacheWrite5mTokens: null, cacheWrite1hTokens: null, reasoningTokens: num(x.reasoningTokens),
        reportedCostUSD: num(x.cost ?? x.totalCost),
        status: 'ok', errorCategory: null,
        sourceFile: file, sourceRecordId: `${sid}:${m.id ?? ts}`,
        metadata: { agent: doc.agent ?? null, origin: sess.source ?? null, sessionStatus: sess.status ?? null },
      });
    }
    return { requests: reqs, newOffset: 0, sessions: [sid], errors };
  },
};
