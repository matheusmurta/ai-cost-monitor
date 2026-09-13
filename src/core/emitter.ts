export interface Disposable {
  dispose(): void;
}

/** Emissor de eventos levíssimo e tipado (sem dependência do vscode). */
export class Emitter<T> {
  private listeners = new Set<(data: T) => void>();

  event(callback: (data: T) => void): Disposable {
    this.listeners.add(callback);
    return {
      dispose: () => {
        this.listeners.delete(callback);
      },
    };
  }

  fire(data: T): void {
    for (const callback of Array.from(this.listeners)) {
      try {
        callback(data);
      } catch {
        // Listener com falha nunca derruba o monitoramento.
      }
    }
  }

  dispose(): void {
    this.listeners.clear();
  }
}
