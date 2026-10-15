export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
export const median = (xs: number[]) => quantile([...xs].sort((a, b) => a - b), 0.5);
/** Median absolute deviation, scaled to be consistent with SD for normal data. */
export function mad(xs: number[]): number {
  const m = median(xs);
  return 1.4826 * median(xs.map(x => Math.abs(x - m)));
}
/** Robust z-score using median/MAD. */
export function robustZ(x: number, xs: number[]): number {
  const s = mad(xs);
  return s > 0 ? (x - median(xs)) / s : 0;
}
/** Ordinary least squares y = a + b x, with residual standard error. */
export function linreg(xs: number[], ys: number[]) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) { sxx += (xs[i] - mx) ** 2; sxy += (xs[i] - mx) * (ys[i] - my); }
  const b = sxx ? sxy / sxx : 0, a = my - b * mx;
  let sse = 0;
  for (let i = 0; i < n; i++) sse += (ys[i] - (a + b * xs[i])) ** 2;
  return { a, b, se: n > 2 ? Math.sqrt(sse / (n - 2)) : 0 };
}
