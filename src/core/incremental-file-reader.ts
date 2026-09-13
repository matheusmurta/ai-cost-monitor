import { promises as fs } from 'node:fs';

export interface ChunkResult {
  /** Linhas completas lidas a partir de fromOffset. */
  lines: string[];
  /** Offset de bytes a partir do qual a próxima leitura deve começar. */
  nextOffset: number;
}

/**
 * Leitura incremental por offset de bytes.
 *
 * Em vez de reler o arquivo inteiro a cada alteração, mantemos a posição já
 * processada e lemos apenas o trecho novo. Linhas incompletas (sem `\n` ao
 * final) são mantidas no buffer implícito: `nextOffset` aponta para o início da
 * linha parcial para que ela seja relida/completada na próxima leitura.
 *
 * Se o arquivo encolher (rotação/truncamento), reiniciamos do zero.
 */
export class IncrementalFileReader {
  async readNewLines(filePath: string, fromOffset: number): Promise<ChunkResult> {
    const stat = await fs.stat(filePath);
    const size = stat.size;

    let start = fromOffset;
    if (size < start) {
      // Arquivo foi truncado/rotacionado: recomeça do início.
      start = 0;
    }

    if (size <= start) {
      return { lines: [], nextOffset: start };
    }

    const length = size - start;
    const handle = await fs.open(filePath, 'r');
    try {
      const buffer = Buffer.alloc(length);
      const { bytesRead } = await handle.read(buffer, 0, length, start);
      const chunk = buffer.toString('utf8', 0, bytesRead);

      const lastNewline = chunk.lastIndexOf('\n');
      if (lastNewline === -1) {
        // Ainda não há linha completa; não avança o offset.
        return { lines: [], nextOffset: start };
      }

      const complete = chunk.slice(0, lastNewline + 1);
      const lines = complete.split('\n').filter((l) => l.trim().length > 0);
      const nextOffset = start + Buffer.byteLength(complete, 'utf8');
      return { lines, nextOffset };
    } finally {
      await handle.close();
    }
  }

  async fullFilePathSize(filePath: string): Promise<number> {
    const stat = await fs.stat(filePath);
    return stat.size;
  }
}
