import { AIRequest } from '../core/types';
import { linreg } from './stats';

export const MIN_FORECAST_DAYS = 7;

/**
 * Monthly cost forecast (auditable): month-to-date actual cost + linear trend fitted on daily
 * effective cost over the last <=30 days, projected for the remaining days of the month.
 * Uncertainty band: ±1.96 · residual SE · sqrt(remaining days). Null when < 7 active days.
 */
export function forecast(rows: AIRequest[], now = Date.now()) {
  const DAY = 86400000;
  const start = now - 30 * DAY;
  const daily = new Map<number, number>();
  for (const r of rows) {
    if (r.startedAt < start || r.startedAt > now || r.effectiveCostUSD === null) continue;
    const d = Math.floor((r.startedAt - start) / DAY);
    daily.set(d, (daily.get(d) ?? 0) + r.effectiveCostUSD);
  }
  if (daily.size < MIN_FORECAST_DAYS) return null;
  const firstDay = Math.min(...daily.keys());
  const xs: number[] = [], ys: number[] = [];
  for (let d = firstDay; d < 30; d++) { xs.push(d); ys.push(daily.get(d) ?? 0); }
  const { a, b, se } = linreg(xs, ys);
  const nowD = new Date(now);
  const monthStart = new Date(nowD.getFullYear(), nowD.getMonth(), 1).getTime();
  const daysInMonth = new Date(nowD.getFullYear(), nowD.getMonth() + 1, 0).getDate();
  const remaining = daysInMonth - nowD.getDate();
  const mtd = rows.filter(r => r.startedAt >= monthStart && r.startedAt <= now).reduce((s, r) => s + (r.effectiveCostUSD ?? 0), 0);
  let projected = 0;
  for (let k = 1; k <= remaining; k++) projected += Math.max(0, a + b * (29 + k));
  const band = 1.96 * se * Math.sqrt(Math.max(remaining, 1));
  return { expected: mtd + projected, low: mtd + Math.max(0, projected - band), high: mtd + projected + band, mtd, days: xs.length, slopePerDay: b };
}
