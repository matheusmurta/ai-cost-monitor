import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { RawRequest } from '../src/core/types';

/** Synthetic fixtures mirroring real local schemas (no real prompts). */
export function tmpDir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'ato-')); }
export function write(p: string, body: string) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); }

export function claudeLine(o: { id: string; req: string; ts: string; inp?: number; out?: number; cr?: number; cw?: number; model?: string; session?: string }) {
  return JSON.stringify({
    type: 'assistant', sessionId: o.session ?? 's1', requestId: o.req, timestamp: o.ts, cwd: 'C:\\work\\api-service', version: '2.0.0',
    message: { id: o.id, model: o.model ?? 'claude-sonnet-4-5', stop_reason: 'end_turn', content: [{ type: 'text', text: 'x' }],
      usage: { input_tokens: o.inp ?? 10, output_tokens: o.out ?? 5, cache_read_input_tokens: o.cr ?? 0, cache_creation_input_tokens: o.cw ?? 0,
        cache_creation: { ephemeral_5m_input_tokens: o.cw ?? 0, ephemeral_1h_input_tokens: 0 } } },
  }) + '\n';
}

export function taskFolder(root: string, taskId: string, reqs: { ts: number; info: any }[], history?: any) {
  const msgs: any[] = [{ ts: reqs[0]?.ts - 5 || 1, type: 'say', say: 'task', text: 'secret prompt' }];
  for (const r of reqs) {
    msgs.push({ ts: r.ts, type: 'say', say: 'api_req_started', text: JSON.stringify(r.info) });
    msgs.push({ ts: r.ts + 1000, type: 'say', say: 'text', text: 'answer' });
    msgs.push({ ts: r.ts + 1500, type: 'ask', ask: 'command', text: 'ls' }); // local tool call, not an LLM request
  }
  write(path.join(root, 'tasks', taskId, 'ui_messages.json'), JSON.stringify(msgs));
  if (history) write(path.join(root, 'tasks', taskId, 'history_item.json'), JSON.stringify(history));
}

export function raw(o: Partial<RawRequest> = {}): RawRequest {
  return { sourceTool: 'claude-code', sourceVersion: null, provider: 'Anthropic', model: 'claude-sonnet-4-5', workspacePath: null, projectId: 'p', sessionId: 's', taskId: null,
    requestId: null, messageId: null, startedAt: Date.now(), finishedAt: null, durationMs: null, inputTokens: 1000, outputTokens: 1000, cacheReadTokens: null, cacheWriteTokens: null,
    cacheWrite5mTokens: null, cacheWrite1hTokens: null, reasoningTokens: null, reportedCostUSD: null, status: 'ok', errorCategory: null, sourceFile: 'f',
    sourceRecordId: String(Math.random()), metadata: {}, ...o };
}
