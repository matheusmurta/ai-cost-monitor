import { UsageRecord } from '../models/usage-record';

/**
 * Alvo de monitoramento em caminho ABSOLUTO (os dados do Cline/Claude Code
 * ficam no diretório HOME do usuário, não no workspace).
 */
export interface WatchTarget {
  /** Diretório base absoluto. */
  basePath: string;
  /** Glob relativo ao basePath (com '/'). */
  pattern: string;
}

/**
 * Contrato comum para todos os providers.
 *
 * Adicionar um novo provider (Roo Code, Kilo Code, Cursor, OpenAI, etc.)
 * significa apenas criar uma nova implementação desta interface e registrá-la
 * no ProviderRegistry — NENHUMA alteração no núcleo é necessária.
 */
export interface AIProvider {
  /** Identificador estável (usado em UsageRecord.provider). */
  readonly id: string;

  /** Nome legível para UI. */
  readonly name: string;

  /** Detecta se o provider está presente (no HOME e/ou workspace). */
  detect(): Promise<boolean>;

  /** Varre os dados do provider e retorna todos os registros de uso. */
  scan(): Promise<UsageRecord[]>;

  /** Processa um único arquivo e retorna os registros de uso extraídos. */
  parseFile(filePath: string): Promise<UsageRecord[]>;

  /** Onde criar os FileSystemWatcher (caminhos absolutos). */
  watchTargets(): WatchTarget[];
}

/**
 * Interface opcional para providers que suportam leitura incremental
 * (ex.: Claude Code, com `.jsonl` que pode crescer muito).
 *
 * Não faz parte do contrato mínimo `AIProvider`; permite que o
 * MonitoringService processe apenas as novas linhas em vez de reler o arquivo
 * inteiro a cada alteração.
 */
export interface IncrementalProvider {
  /** Processa um lote de linhas novas sem tocar no disco. */
  parseChunk(sourceFile: string, lines: string[]): UsageRecord[];

  /** Lista os arquivos monitorados (para inicializar offsets após o scan). */
  listFiles(): Promise<string[]>;
}
