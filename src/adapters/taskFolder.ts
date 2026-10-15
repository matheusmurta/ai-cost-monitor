import * as path from 'path';
import * as fs from 'fs';
import { Adapter, ParseResult, RawRequest, SourceLocation, SourceTool, num } from '../core/types';
import { readJson, walk } from '../core/fsutil';
import { normalizeProvider, projectFromPath } from '../core/provider';

/**
 * Cline legacy / Roo Code / Kilo Code "task folder" layout:
 *   <globalStorage>/tasks/<taskId>/ui_messages.json
 * Each LLM call = `say: "api_req_started"` whose `text` is JSON with tokensIn/tokensOut/
 * cacheWrites/cacheReads/cost (filled when the call completes). Local tool calls are separate
 * messages and are NOT counted. Task totals are never summed (avoids double counting).
 */
export function taskFolderAdapter(tool: SourceTool): Adapter {
  return {
    tool, incremental: false,
    async listFiles(loc) {
      return walk(path.join(loc.root, 'tasks'), f => path.basename(f) === 'ui_messages.json', 2);
    },
    async parseFile(file, loc): Promise<ParseResult> {
      const msgs = await readJson(file);
      if (!Array.isArray(msgs)) return { requests: [], newOffset: 0, sessions: [], errors: 1 };
      const dir = path.dirname(file);
      const taskId = path.basename(dir);
      const meta = await taskMeta(loc, dir, taskId);
      const reqs: RawRequest[] = [];
      let errors = 0;
      for (let i = 0; i < msgs.length; i++) {
        const m = msgs[i];
        if (m?.say !== 'api_req_started' || typeof m.text !== 'string' || typeof m.ts !== 'number') continue;
        let info: any;
        try { info = JSON.parse(m.text); } catch { errors++; continue; }
        const tin = num(info.tokensIn), tout = num(info.tokensOut);
        if (tin === null && tout === null && num(info.cost) === null) continue; // no usage recorded
        let next: any;
        for (let j = i + 1; j < msgs.length; j++) if (typeof msgs[j]?.ts === 'number') { next = msgs[j]; break; }
        const cancel = info.cancelReason ?? null;
        const model = info.modelId ?? info.model ?? meta.model ?? null;
        const ws = meta.workspace;
        reqs.push({
          sourceTool: tool, sourceVersion: null,
          provider: normalizeProvider(info.apiProvider ?? info.providerId ?? meta.provider, model), model,
          workspacePath: ws, projectId: projectFromPath(ws),
          sessionId: taskId, taskId, requestId: null, messageId: String(m.ts),
          startedAt: m.ts, finishedAt: next?.ts ?? null, durationMs: next ? next.ts - m.ts : null,
          inputTokens: tin, outputTokens: tout,
          cacheReadTokens: num(info.cacheReads), cacheWriteTokens: num(info.cacheWrites),
          cacheWrite5mTokens: null, cacheWrite1hTokens: null, reasoningTokens: null,
          reportedCostUSD: num(info.cost),
          status: cancel ? 'cancelled' : info.streamingFailedMessage ? 'error' : 'ok',
          errorCategory: cancel ?? (info.streamingFailedMessage ? 'streaming_failed' : null),
          sourceFile: file, sourceRecordId: `${taskId}:${m.ts}`,
          metadata: { apiProtocol: info.apiProtocol ?? null, modelSource: info.modelId ? 'request' : meta.model ? 'task_metadata' : 'unknown', durationIsProxy: true },
        });
      }
      return { requests: reqs, newOffset: 0, sessions: [taskId], errors };
    },
  };
}

interface TaskMeta { workspace: string | null; model: string | null; provider: string | null }
const historyCache = new Map<string, { mtime: number; map: Map<string, any> }>();

async function taskMeta(loc: SourceLocation, dir: string, taskId: string): Promise<TaskMeta> {
  let item: any = await readJson(path.join(dir, 'history_item.json')); // Roo / Kilo
  if (!item) {
    const hf = path.join(loc.root, 'state', 'taskHistory.json'); // Cline legacy
    try {
      const st = await fs.promises.stat(hf);
      let c = historyCache.get(hf);
      if (!c || c.mtime !== st.mtimeMs) {
        const arr = await readJson(hf);
        c = { mtime: st.mtimeMs, map: new Map((Array.isArray(arr) ? arr : []).map((x: any) => [String(x.id), x])) };
        historyCache.set(hf, c);
      }
      item = c.map.get(taskId);
    } catch { /* absent */ }
  }
  const tm = await readJson(path.join(dir, 'task_metadata.json'));
  const mu = Array.isArray(tm?.model_usage) && tm.model_usage.length ? tm.model_usage[tm.model_usage.length - 1] : null;
  return {
    workspace: item?.cwdOnTaskInitialization ?? item?.workspace ?? null,
    model: mu?.model_id ?? item?.modelId ?? null,
    provider: mu?.model_provider_id ?? item?.apiProvider ?? null,
  };
}
