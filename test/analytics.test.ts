import { describe, it, expect } from 'vitest';
import { raw } from './fixtures';
import { finalize } from '../src/pricing/pricing';
import { applyFilters } from '../src/analytics/filters';
import { totals, timeSeries, dimension } from '../src/analytics/aggregate';
import { forecast } from '../src/analytics/forecast';
import { computeInsights } from '../src/analytics/insights';
import { dashboard } from '../src/analytics/engine';
import { toJSON } from '../src/export/export';
import { AIRequest } from '../src/core/types';

const day = 86400000, NOW = new Date('2026-03-20T12:00:00Z').getTime();
const rows = (): AIRequest[] => Array.from({ length: 40 }, (_, i) => finalize(raw({ sourceRecordId: 'r' + i, startedAt: NOW - (i % 20) * day - 1000,
  projectId: i % 2 ? 'a' : 'b', sourceTool: i % 3 ? 'claude-code' : 'cline', sessionId: 's' + (i % 8), reportedCostUSD: i % 3 ? null : 0.01 })))
  .sort((a, b) => a.startedAt - b.startedAt);

describe('Analytics', () => {
  it('filters by period and dimensions', () => {
    const all = rows();
    const { cur } = applyFilters(all, { period: '7d', tool: ['cline'] }, NOW);
    expect(cur.length).toBeGreaterThan(0);
    expect(cur.every(r => r.sourceTool === 'cline' && r.startedAt >= NOW - 7 * day)).toBe(true);
    expect(applyFilters(all, { period: 'all' }, NOW).cur).toHaveLength(40);
    expect(applyFilters(all, { period: 'all', project: ['a'] }, NOW).cur).toHaveLength(20);
  });
  it('aggregates totals, series and dimensions consistently', () => {
    const all = rows(), t = totals(all);
    expect(t.requests).toBe(40); expect(t.total).toBe(80000);
    expect(t.costReported).toBeCloseTo(14 * 0.01);
    const ts = timeSeries(all, NOW - 30 * day, NOW);
    expect(ts.points.reduce((a, p) => a + p.requests, 0)).toBe(40);
    expect(dimension(all, r => r.projectId).map(d => d.requests)).toEqual([20, 20]);
  });
  it('forecast requires >=7 days and returns a band', () => {
    const f = forecast(rows(), NOW)!;
    expect(f.low).toBeLessThanOrEqual(f.expected); expect(f.high).toBeGreaterThanOrEqual(f.expected);
    expect(forecast(rows().slice(0, 4), NOW)).toBeNull();
  });
  it('insights respect minimum samples', () => {
    const all = rows();
    expect(computeInsights(all, [], false, NOW).map(i => i.id)).toContain('top-req');
    expect(computeInsights(all.slice(0, 3), [], false, NOW).find(i => i.id === 'growth')).toBeUndefined();
    expect(computeInsights([], [], false, NOW)).toEqual([]);
  });
  it('dashboard payload on empty data', () => {
    const d = dashboard([], { period: '30d' }, NOW);
    expect(d.empty).toBe(true); expect(d.totals.requests).toBe(0);
  });
  it('JSON export', () => {
    const j = JSON.parse(toJSON(rows()));
    expect(j.count).toBe(40); expect(j.requests[0]).toHaveProperty('totalTokens');
  });
});
