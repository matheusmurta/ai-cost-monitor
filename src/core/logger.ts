import * as vscode from 'vscode';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/** Interface injetável (permite testar módulos que dependem de log sem o vscode). */
export interface ILogger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string, err?: unknown): void;
}

export class Logger implements ILogger {
  private static instance: Logger | undefined;

  private readonly channel: vscode.OutputChannel;
  private level: LogLevel = LogLevel.INFO;

  // Contadores simples para o diagnóstico.
  private _warnCount = 0;
  private _errorCount = 0;

  private constructor() {
    this.channel = vscode.window.createOutputChannel('AI Cost Monitor');
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  get warnCount(): number {
    return this._warnCount;
  }

  get errorCount(): number {
    return this._errorCount;
  }

  show(): void {
    this.channel.show();
  }

  debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }

  info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  warn(message: string): void {
    this._warnCount += 1;
    this.log(LogLevel.WARN, message);
  }

  error(message: string, err?: unknown): void {
    this._errorCount += 1;
    let rendered = message;
    if (err instanceof Error) {
      rendered += `\n${err.message}`;
      if (err.stack) {
        rendered += `\n${err.stack}`;
      }
    } else if (err !== undefined) {
      rendered += `\n${String(err)}`;
    }
    this.log(LogLevel.ERROR, rendered);
  }

  private log(level: LogLevel, message: string): void {
    if (level < this.level) {
      return;
    }
    const label = LogLevel[level];
    this.channel.appendLine(`[${new Date().toISOString()}] [${label}] ${message}`);
  }

  dispose(): void {
    if (Logger.instance) {
      Logger.instance.channel.dispose();
      Logger.instance = undefined;
    }
  }
}
