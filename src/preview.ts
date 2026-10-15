import * as fs from 'fs';
import * as path from 'path';
import { AIRequest, SourceLocation } from './core/types';

/**
 * Opt-in content preview. Reads the original record on demand; nothing is persisted or indexed.
 * Only files located inside a detected source root are readable (path traversal guard).
 */
export async function previewContent(r: AIRequest | null, locs: SourceLocation[]): Promise<string> {
  const NA = 'Not available from source';
  if (!r) return NA;
  const file = path.resolve(r.sourceFile).toLowerCase();
  if (!locs.some(l => file.startsWith(path.resolve(l.root).toLowerCase() + path.sep))) return NA;
  try {
    const text = await fs.promises.readFile(r.sourceFile, 'utf8');
    if (r.sourceTool === 'claude-code') {
      for (const line of text.split('\n')) {
        if (!r.messageId || !line.includes(r.messageId)) continue;
        const c = JSON.parse(line).message?.content;
        const t = Array.isArray(c)
          ? c.map((b: any) => b.text ?? (b.type === 'tool_use' ? `[tool_use: ${b.name}]` : `[${b.type}]`)).join('\n')
          : String(c ?? '');
        if (t.trim()) return t.slice(0, 4000);
      }
      return NA;
    }
    const j = JSON.parse(text);
    const arr = Array.isArray(j) ? j : j.messages;
    const m = arr?.find((x: any) => String(x.ts) === r.messageId || x.id === r.messageId);
    if (!m) return NA;
    const body = m.text ?? (Array.isArray(m.content) ? m.content.map((b: any) => b.text ?? `[${b.type}]`).join('\n') : '');
    return String(body || NA).slice(0, 4000);
  } catch { return NA; }
}
