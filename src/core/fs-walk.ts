import { promises as fs } from 'node:fs';
import * as path from 'node:path';

/**
 * Caminhamento recursivo de diretórios. Ignora diretórios inacessíveis e
 * retorna apenas arquivos que satisfazem o predicado.
 */
export async function walkFiles(
  root: string,
  predicate: (filePath: string) => boolean,
): Promise<string[]> {
  const results: string[] = [];

  async function walk(dir: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return; // diretório inacessível/inexistente: ignora
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && predicate(full)) {
        results.push(full);
      }
    }
  }

  await walk(root);
  return results;
}
