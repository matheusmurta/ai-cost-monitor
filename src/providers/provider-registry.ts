import { AIProvider } from './ai-provider';

export class ProviderRegistry {
  private readonly providers: AIProvider[] = [];

  register(provider: AIProvider): void {
    this.providers.push(provider);
  }

  getAll(): AIProvider[] {
    return [...this.providers];
  }
}
