import * as fs from 'fs';
import * as path from 'path';

/** Read with retry for transiently locked files (Windows EBUSY/EPERM). */
export async function readWithRetry(file: string, start = 0, tries = 3): Promise<Buffer> {
  for (let i = 0; ; i++) {
    try {
      const fh = await fs.promises.open(file, 'r');
      try {
        const st = await fh.stat();
        const len = Math.max(0, st.size - start);
        const buf = Buffer.alloc(len);
        if (len) await fh.read(buf, 0, len, start);
        return buf;
      } finally { await fh.close(); }
    } catch (e: any) {
      if (i >= tries - 1 || !['EBUSY', 'EPERM', 'EACCES', 'EAGAIN'].includes(e?.code)) throw e;
      await new Promise(r => setTimeout(r, 150 * (i + 1)));
    }
  }
}

export async function readJson(file: string): Promise<any | undefined> {
  try {
    const t = (await readWithRetry(file)).toString('utf8').replace(/^\uFEFF/, '');
    return JSON.parse(t);
  } catch { return undefined; } // partially written / invalid -> retried next sync
}

export async function exists(p: string): Promise<boolean> {
  try { await fs.promises.access(p); return true; } catch { return false; }
}

/** Recursive walk with depth limit; never follows symlinks. */
export async function walk(root: string, pred: (f: string) => boolean, maxDepth = 6): Promise<string[]> {
  const out: string[] = [];
  async function rec(dir: string, d: number) {
    let ents: fs.Dirent[];
    try { ents = await fs.promises.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      const p = path.join(dir, e.name);
      if (e.isDirectory() && d < maxDepth) await rec(p, d + 1);
      else if (e.isFile() && pred(p)) out.push(p);
    }
  }
  await rec(root, 0);
  return out;
}

/** Ensures `child` resolves inside `root` (path traversal guard). */
export function isInside(root: string, child: string): boolean {
  const rel = path.relative(path.resolve(root), path.resolve(child));
  return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}
