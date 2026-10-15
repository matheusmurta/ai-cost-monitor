import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { tmpDir, write, taskFolder } from './fixtures';
import { taskFolderAdapter } from '../src/adapters/taskFolder';
import { clineV2Adapter } from '../src/adapters/clineV2';
import { SourceLocation } from '../src/core/types';

const loc = (root: string, tool: any, kind: string): SourceLocation => ({ tool, kind, root, limitations: [] });

describe('Cline legacy / Roo / Kilo task folders', () => {
  it('one request per completed api_req_started; ignores local tool calls and unfinished requests', async () => {
    const d = tmpDir();
    taskFolder(d, 't1', [
      { ts: 1000, info: { tokensIn: 100, tokensOut: 20, cacheReads: 50, cacheWrites: 10, cost: 0.01 } },
      { ts: 5000, info: { apiProtocol: 'openai' } },
      { ts: 9000, info: { tokensIn: 5, tokensOut: 1, cost: 0, cancelReason: 'user_cancelled' } },
    ]);
    write(path.join(d, 'state', 'taskHistory.json'), JSON.stringify([{ id: 't1', cwdOnTaskInitialization: '/home/u/web-app', tokensIn: 105 }]));
    write(path.join(d, 'tasks', 't1', 'task_metadata.json'), JSON.stringify({ model_usage: [{ model_id: 'anthropic/claude-sonnet-4', model_provider_id: 'openrouter' }] }));
    const r = await taskFolderAdapter('cline').parseFile(path.join(d, 'tasks', 't1', 'ui_messages.json'), loc(d, 'cline', 'cline-tasks'), 0);
    expect(r.requests).toHaveLength(2);
    expect(r.requests[0]).toMatchObject({ inputTokens: 100, cacheReadTokens: 50, reportedCostUSD: 0.01, durationMs: 1000, projectId: 'web-app', provider: 'OpenRouter', model: 'anthropic/claude-sonnet-4' });
    expect(r.requests[1].status).toBe('cancelled');
  });
  it('Roo: workspace from history_item.json; unknown fields stay null', async () => {
    const d = tmpDir();
    taskFolder(d, 'r1', [{ ts: 2000, info: { tokensIn: 7, tokensOut: 3 } }], { id: 'r1', workspace: 'D:\\code\\roo-proj' });
    const r = await taskFolderAdapter('roo-code').parseFile(path.join(d, 'tasks', 'r1', 'ui_messages.json'), loc(d, 'roo-code', 'roo-code-tasks'), 0);
    expect(r.requests[0]).toMatchObject({ sourceTool: 'roo-code', projectId: 'roo-proj', cacheReadTokens: null, reportedCostUSD: null, model: null });
  });
  it('Kilo: same layout, tagged as kilo-code', async () => {
    const d = tmpDir();
    taskFolder(d, 'k1', [{ ts: 2000, info: { tokensIn: 7, tokensOut: 3, cost: 0.002, modelId: 'gpt-4.1' } }]);
    const r = await taskFolderAdapter('kilo-code').parseFile(path.join(d, 'tasks', 'k1', 'ui_messages.json'), loc(d, 'kilo-code', 'kilo-code-tasks'), 0);
    expect(r.requests[0]).toMatchObject({ sourceTool: 'kilo-code', model: 'gpt-4.1', provider: 'OpenAI' });
  });
  it('handles partially written JSON gracefully', async () => {
    const d = tmpDir(); write(path.join(d, 'tasks', 'x', 'ui_messages.json'), '[{"ts":1,');
    const r = await taskFolderAdapter('cline').parseFile(path.join(d, 'tasks', 'x', 'ui_messages.json'), loc(d, 'cline', 'cline-tasks'), 0);
    expect(r.requests).toHaveLength(0); expect(r.errors).toBe(1);
  });
});

describe('Cline v2 sessions', () => {
  it('reads per-message metrics, not session aggregates', async () => {
    const d = tmpDir(), sd = path.join(d, 'sessions', 's9');
    write(path.join(sd, 's9.json'), JSON.stringify({ session_id: 's9', provider: 'vscode-lm', model: 'm', workspace_root: 'C:\\x\\proj', metadata: { usage: { inputTokens: 999 } } }));
    write(path.join(sd, 's9.messages.json'), JSON.stringify({ sessionId: 's9', origin: { version: '4.1' }, messages: [
      { id: 'u', role: 'user', ts: 1 },
      { id: 'a1', role: 'assistant', ts: 2, modelInfo: { id: 'm', provider: 'vscode-lm' }, metrics: { inputTokens: 10, outputTokens: 2, cacheReadTokens: 0, cacheWriteTokens: 0, cost: 0 } },
      { id: 'a2', role: 'assistant', ts: 3, metrics: { inputTokens: 20, outputTokens: 4 } }] }));
    const r = await clineV2Adapter.parseFile(path.join(sd, 's9.messages.json'), loc(d, 'cline', 'cline-v2'), 0);
    expect(r.requests.map(x => x.inputTokens)).toEqual([10, 20]);
    expect(r.requests[0]).toMatchObject({ provider: 'VS Code LM API', projectId: 'proj', reportedCostUSD: 0, sourceVersion: '4.1' });
  });
});
