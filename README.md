# AI Cost Monitor

Extensão para VS Code que monitora **localmente e em tempo real** o consumo de
tokens e o custo de ferramentas de IA usadas localmente. O primeiro release
suporta **Cline** e **Claude Code**, com arquitetura preparada para novos
providers (Roo Code, Kilo Code, Cursor, OpenAI, Gemini, Ollama, OpenRouter…).

- **Plug and Play** — sem configuração obrigatória.
- **100% local** — nenhum dado (prompts, código, tokens, nomes de arquivos) sai
  da sua máquina. Sem API keys, sem banco externo, sem telemetria, sem `fetch`.
- **Tempo real** — dashboard e status bar se atualizam sozinhos.

---

## Como executar

```bash
npm install
npm run compile
```

Depois, no VS Code:

1. Abra esta pasta como workspace.
2. Pressione `F5` (launch "Run Extension") — abre uma janela *Extension
   Development Host*.
3. Não é preciso abrir um projeto específico: os dados do Cline
   (`~/.cline/data/sessions`) e do Claude Code (`~/.claude/projects`) são
   detectados automaticamente no seu diretório HOME.
4. Rode o comando **AI Cost Monitor: Open Dashboard** (Ctrl+Shift+P).

> Alternativa: gere o `.vsix` e instale-o (`npm run package`, depois
> `Extensions → ... → Install from VSIX`).

---

## Comandos

| Comando | Ação |
|---|---|
| `AI Cost Monitor: Open Dashboard` | Abre o dashboard (custo, tokens, providers, modelos, histórico). |
| `AI Cost Monitor: Refresh` | Re-escaneia os providers (idempotente). |
| `AI Cost Monitor: Reset Statistics` | Zera histórico e contadores. |
| `AI Cost Monitor: Show Diagnostics` | Abre a tela de diagnóstico e o Output Channel. |

A **Status Bar** mostra `$(pulse) AI Cost: $X.XX | X tokens` e abre o dashboard
ao clicar.

---

## Configurações opcionais (`settings.json`)

```json
{
  "aiCostMonitor.enabled": true,
  "aiCostMonitor.defaultModel": "claude-3-5-sonnet",
  "aiCostMonitor.currency": "USD",
  "aiCostMonitor.enableDebugLogs": false
}
```

Nenhuma delas é obrigatória.

---

## Arquitetura

```
AI Cost Monitor
│
├── Core (não conhece formatos de log)
│   ├── MonitoringService   — orquestra watchers, debounce, upsert/dedup, agregação.
│   ├── AggregationService  — agrega UsageRecord em UsageSummary (pura).
│   ├── CostCalculator      — fórmula de custo (pura).
│   ├── IncrementalFileReader — leitura por offset (JSONL grandes).
│   ├── PersistenceService  — globalState (histórico entre reinícios).
│   ├── Logger              — Output Channel "AI Cost Monitor" (DEBUG..ERROR).
│   ├── DiagnosticsState    — estado observável para a tela de diagnóstico.
│   ├── dedup / format / value-utils / fs-walk / emitter
│
├── Providers (adapters isolados)
│   ├── ai-provider.ts      — interface AIProvider (+ IncrementalProvider).
│   ├── provider-registry.ts
│   ├── cline/              — cline-parser.ts, cline-provider.ts
│   └── claude-code/        — claude-code-parser.ts, pricing.ts, provider
│
├── Models
│   ├── usage-record.ts     — modelo unificado (UsageRecord, ModelPricing)
│   └── usage-summary.ts    — agregações (UsageSummary)
│
└── UI
    ├── dashboard-panel.ts      — Webview do dashboard
    ├── diagnostics-panel.ts    — Webview de diagnóstico
    └── webview-content.ts      — HTML/CSS/JS (embed + nonce/CSP)
```

### Fluxo de dados

```
Watcher (create/change/delete) → debounce (150ms) → provider.parseFile/parseChunk
  → parser (puro) → UsageRecord[] → upsert/dedup → AggregationService
  → Persistence (globalState) → Emitter → StatusBar + Dashboard
```

### Adicionar um novo provider

Basta implementar `AIProvider` (e, opcionalmente, `IncrementalProvider`) e
registrá-lo no `ProviderRegistry` no `extension.ts`. **Nenhuma alteração no
core é necessária.**

---

## Deduplicação / idempotência

Cada registro recebe um ID determinístico, mas a estratégia varia conforme o
tipo de dado:

- **Claude Code (eventos append-only)** — cada linha é um evento único; o ID é
  o hash do conteúdo (`provider | sourceFile | timestamp | tokens | custo | modelo`).
  Reprocessar o mesmo evento produz o mesmo ID e nada é duplicado.
- **Cline (resumo de sessão que cresce)** — cada sessão gera 1 registro com ID
  estável (`provider | sourceFile | session_id`). O `AggregationService` faz
  **upsert**: quando o mesmo ID chega com conteúdo diferente (custo/tokens
  maiores), ele **substitui** o registro anterior em vez de duplicar.

Ambas ficam idempotentes entre reinícios, pois os IDs persistem com os
registros. Limitação conhecida: um arquivo parcialmente escrito pode mudar de
valor até a escrita final — mitigado pelo debounce de 150ms e pelo descarte de
registros incompletos (tokens indefinidos).

---

## Cálculo de custo

```
inputCost  = inputTokens  / 1_000_000 * inputPerMillionTokens
outputCost = outputTokens / 1_000_000 * outputPerMillionTokens
totalCost  = inputCost + outputCost (+ cache, quando disponível, separadamente)
```

- Cline: o custo vem do campo `totalCost` do resumo de sessão (já calculado
  pelo próprio Cline, sem pricing local).
- Claude Code: o custo é calculado a partir da tabela central
  `src/providers/claude-code/pricing.ts`. Quando o modelo não é identificado,
  usa-se o `defaultModel` e o registro é marcado como `inferredModel: true`.

> **Importante:** os valores em `pricing.ts` são provisórios e devem ser
> revisados contra os preços oficiais da Anthropic antes de uso em produção.

---

## Persistência

MVP usa `ExtensionContext.globalState` (local, serializado em JSON, com o
lifecycle do VS Code). O histórico é limitado a `MAX_PERSISTED_RECORDS`
(20.000), mantendo os registros mais recentes.

---

## Testes

```bash
npm test
```

Cobre: parser Cline (formato legado `api_req_res` e resumo de sessão v3), parser
Claude Code, calculadora de custo, deduplicação/upsert e agregação (36 testes).

---

## Gerar o `.vsix`

```bash
npm install -g @vscode/vsce # opcional; já está como devDependency
npm run package
```

O pacote `ai-cost-monitor-0.1.0.vsix` é gerado na raiz. Para instalar:
`code --install-extension ai-cost-monitor-0.1.0.vsix`.

---

## Hipóteses e limitações (documentadas)

- Os dados são lidos do **diretório HOME** (não do workspace): Cline em
  `~/.cline/data/sessions/**/<id>.json` e Claude Code em
  `~/.claude/projects/**/*.jsonl`.
- Os formatos internos do Cline e do Claude Code podem mudar; os parsers ficam
  isolados e tratam campos opcionais defensivamente.
- Para o Cline usamos o **resumo por sessão** (`<id>.json`); os arquivos
  `<id>.messages.json` (conversa completa) e `<id>.compaction.json` são
  ignorados por serem grandes e redundantes.
- Para o Cline, `metadata.usage.inputTokens` já inclui os tokens de cache; o
  total exibido é a soma reportada pelo próprio Cline (não recalculamos custo).
- `sourceFile` armazena o **basename** do arquivo (MVP).
- A leitura incremental usa `fs` do Node (premissa *local first*); workspaces
  remotos/virtuais estão fora do escopo do MVP.
- Ao remover um arquivo monitorado, o histórico já contabilizado é **mantido**.
