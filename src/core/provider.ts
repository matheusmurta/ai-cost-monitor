/** Map tool-specific provider ids / model ids to a canonical provider name. Tool != provider. */
const MAP: Record<string, string> = {
  anthropic: 'Anthropic', 'claude-code': 'Anthropic', openai: 'OpenAI', 'openai-native': 'OpenAI',
  openrouter: 'OpenRouter', bedrock: 'AWS Bedrock', vertex: 'Google Vertex', gemini: 'Google Gemini',
  deepseek: 'DeepSeek', ollama: 'Ollama', lmstudio: 'LM Studio', 'vscode-lm': 'VS Code LM API',
  mistral: 'Mistral', xai: 'xAI', groq: 'Groq', cline: 'Cline', requesty: 'Requesty', litellm: 'LiteLLM',
  'kilocode': 'Kilo Code Gateway', 'roo': 'Roo Cloud', 'qwen-code': 'Qwen', moonshot: 'Moonshot', zai: 'Z.ai',
};

export function normalizeProvider(raw: string | null | undefined, model?: string | null): string | null {
  if (raw) {
    const k = raw.toLowerCase();
    return MAP[k] ?? raw;
  }
  if (!model) return null;
  const m = model.toLowerCase();
  if (m.startsWith('claude')) return 'Anthropic';
  if (/^(gpt|o\d|chatgpt)/.test(m)) return 'OpenAI';
  if (m.startsWith('gemini')) return 'Google Gemini';
  if (m.startsWith('deepseek')) return 'DeepSeek';
  if (m.includes('/')) return 'OpenRouter';
  return null;
}

export function projectFromPath(p: string | null | undefined): string | null {
  if (!p) return null;
  const parts = p.replace(/[\\/]+$/, '').split(/[\\/]/);
  return parts[parts.length - 1] || null;
}
