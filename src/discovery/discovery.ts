import * as os from 'os';
import * as path from 'path';
import { SourceLocation, SourceTool } from '../core/types';
import { exists } from '../core/fsutil';

const EXT_IDS: Record<string, SourceTool> = {
  'saoudrizwan.claude-dev': 'cline',
  'rooveterinaryinc.roo-cline': 'roo-code',
  'kilocode.kilo-code': 'kilo-code',
};
const VARIANTS = ['Code', 'Code - Insiders', 'VSCodium', 'Cursor', 'Windsurf'];

export function userDataRoots(env = process.env, platform = process.platform, home = os.homedir()): string[] {
  if (platform === 'win32') return VARIANTS.map(v => path.join(env.APPDATA ?? path.join(home, 'AppData', 'Roaming'), v, 'User'));
  if (platform === 'darwin') return VARIANTS.map(v => path.join(home, 'Library', 'Application Support', v, 'User'));
  return VARIANTS.map(v => path.join(env.XDG_CONFIG_HOME ?? path.join(home, '.config'), v, 'User'));
}

export interface DiscoverOptions { env?: NodeJS.ProcessEnv; platform?: NodeJS.Platform; home?: string; manual?: string[]; globalStorageParent?: string }

/** Auto-detect all supported local sources. Missing tools are simply absent from the result. */
export async function discover(opts: DiscoverOptions = {}): Promise<SourceLocation[]> {
  const env = opts.env ?? process.env, home = opts.home ?? os.homedir();
  const out: SourceLocation[] = [];
  const seen = new Set<string>();
  const add = async (l: SourceLocation) => {
    const k = path.resolve(l.root).toLowerCase() + l.kind;
    if (seen.has(k) || !(await exists(l.root))) return;
    seen.add(k); out.push(l);
  };
  const claudeLim = ['Cost is an API-equivalent estimate; subscription billing is not exposed by logs.', 'Request duration not recorded.'];
  // Claude Code: CLAUDE_CONFIG_DIR (comma separated allowed), ~/.claude, ~/.config/claude
  const claudeDirs = [...(env.CLAUDE_CONFIG_DIR ?? '').split(',').filter(Boolean), path.join(home, '.claude'), path.join(home, '.config', 'claude')];
  for (const d of claudeDirs) await add({ tool: 'claude-code', kind: 'claude-projects', root: path.join(d.trim(), 'projects'), limitations: claudeLim });

  const taskLim = ['Duration approximated from next UI message timestamp.', 'Model may be inferred from task metadata.'];
  const roots = opts.globalStorageParent ? [opts.globalStorageParent] : userDataRoots(env, opts.platform, home).map(r => path.join(r, 'globalStorage'));
  for (const gs of roots) for (const [id, tool] of Object.entries(EXT_IDS)) {
    await add({ tool, kind: `${tool}-tasks`, root: path.join(gs, id), limitations: taskLim });
  }
  await add({ tool: 'cline', kind: 'cline-v2', root: path.join(env.CLINE_DIR ?? path.join(home, '.cline'), 'data'), limitations: ['Duration not recorded per request.'] });

  for (const m of opts.manual ?? []) {
    const r = path.resolve(m);
    const lower = r.toLowerCase();
    if (lower.endsWith('projects')) await add({ tool: 'claude-code', kind: 'claude-projects', root: r, limitations: claudeLim });
    else if (await exists(path.join(r, 'sessions'))) await add({ tool: 'cline', kind: 'cline-v2', root: r, limitations: [] });
    else {
      const tool: SourceTool = lower.includes('roo') ? 'roo-code' : lower.includes('kilo') ? 'kilo-code' : 'cline';
      await add({ tool, kind: `${tool}-tasks`, root: r, limitations: taskLim });
    }
  }
  return out;
}
