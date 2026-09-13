/**
 * Estado observável usado pela tela de diagnóstico. É compartilhado entre os
 * providers (que reportam arquivos encontrados / registros malformados) e o
 * MonitoringService (que reporta detecção e processamento).
 */
export class DiagnosticsState {
  clineDetected = false;
  claudeDetected = false;

  clineFilesFound = 0;
  claudeFilesFound = 0;

  recordsProcessed = 0;

  lastClineEvent?: string;
  lastClaudeEvent?: string;

  malformedRecords = 0;

  reportDetection(provider: string, detected: boolean): void {
    if (provider === 'cline') {
      this.clineDetected = detected;
    } else {
      this.claudeDetected = detected;
    }
  }

  reportFilesFound(provider: string, count: number): void {
    if (provider === 'cline') {
      this.clineFilesFound = count;
    } else {
      this.claudeFilesFound = count;
    }
  }

  reportLastEvent(provider: string, timestamp?: string): void {
    if (!timestamp) {
      return;
    }
    if (provider === 'cline') {
      this.lastClineEvent = timestamp;
    } else {
      this.lastClaudeEvent = timestamp;
    }
  }

  reset(): void {
    this.clineDetected = false;
    this.claudeDetected = false;
    this.clineFilesFound = 0;
    this.claudeFilesFound = 0;
    this.recordsProcessed = 0;
    this.lastClineEvent = undefined;
    this.lastClaudeEvent = undefined;
    this.malformedRecords = 0;
  }
}
