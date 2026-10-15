# Contributing

1. `npm install`
2. `npm run typecheck && npm test`
3. `npm run build` then press F5 (Extension Development Host) or `npm run package` to build a VSIX.

## Adding a source adapter
Implement `Adapter` (`src/core/types.ts`): `listFiles`, `parseFile`, `incremental`. Return `RawRequest`s with
**null** for anything the source does not record (unknown ≠ 0). Register detection in
`src/discovery/discovery.ts` and mapping in `src/sync/sync.ts`. Add fixture-based tests in `test/` — never commit real prompts.

## Rules
- No telemetry, no network calls.
- Never read secret files (e.g. `~/.cline/data/secrets.json`).
- Never sum task-level totals together with per-request records.
