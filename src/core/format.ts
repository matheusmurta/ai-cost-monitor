/**
 * Helpers de formatação puros (sem dependência do vscode).
 */

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) {
    return '$0.00';
  }
  if (value === 0) {
    return '$0.00';
  }
  const abs = Math.abs(value);
  let fixed: string;
  let decimals: number;
  if (abs >= 1) {
    decimals = 2;
  } else if (abs >= 0.01) {
    decimals = 4;
  } else {
    decimals = 6;
  }
  fixed = value.toFixed(decimals);
  fixed = fixed.replace(/0+$/, '').replace(/\.$/, '');
  return '$' + fixed;
}

/** 2_483_921 -> "2.48M"; 633_921 -> "634K" (arredondado). */
export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) {
    return '0';
  }
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) {
    return trimZeros((n / 1_000_000_000).toFixed(2)) + 'B';
  }
  if (abs >= 1_000_000) {
    return trimZeros((n / 1_000_000).toFixed(2)) + 'M';
  }
  if (abs >= 1_000) {
    return trimZeros((n / 1_000).toFixed(1)) + 'K';
  }
  return String(Math.round(n));
}

/** Formata número inteiro com separadores de milhar (1.850.000). */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) {
    return '0';
  }
  return Math.round(n).toLocaleString('en-US');
}

function trimZeros(value: string): string {
  return value.replace(/\.?0+$/, '');
}
