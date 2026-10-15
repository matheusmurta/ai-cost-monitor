// Read-only smoke test against real local sources. Index is in-memory only.
import { discover } from '../src/discovery/discovery';
import { Store } from '../src/storage/db';
import { syncSources } from '../src/sync/sync';
import { dashboard } from '../src/analytics/engine';
import * as path from 'path';

(async () => {
  const locs = await discover();
  const store = await Store.open(null, path.join(__dirname, '..', 'dist'));
  const t0 = Date.now();
  const st = await syncSources(store, locs, {});
  for (const s of st) console.log(`${s.kind.padEnd(16)} ${s.health.padEnd(11)} files=${s.files} sessions=${s.sessions} requests=${s.requests} errors=${s.errors}`);
  const d = dashboard(store.all(), { period: 'all' });
  console.log(`total requests=${d.totals.requests} tokens=${d.totals.total} cost=$${d.totals.cost.toFixed(4)} unknownCost=${d.totals.costUnknownCount} syncMs=${Date.now() - t0}`);
  console.log('models:', d.byModel.map(m => `${m.key}(${m.requests})`).join(', '));
  console.log('insights:', d.insights.map(i => i.id).join(', '));
})();
