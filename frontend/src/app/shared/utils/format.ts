/** Small display helpers used by several pages. Pure functions: easy to test. */

export function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'N/A';
  }
  return digits === 0
    ? Math.round(Number(value)).toLocaleString()
    : Number(value).toFixed(digits);
}

export type Level = 'high' | 'medium' | 'low' | 'unknown';

export function qualityLevel(quality: string | null | undefined): Level {
  const q = (quality ?? '').trim().toLowerCase();
  return q === 'high' || q === 'medium' || q === 'low' ? q : 'unknown';
}

export function qualityRank(quality: string | null | undefined): number {
  return { high: 3, medium: 2, low: 1, unknown: 0 }[qualityLevel(quality)];
}

export type Trend = 'increase' | 'decrease' | 'stable';

export function trendDirection(priceTrend: string | null | undefined): Trend {
  const t = (priceTrend ?? '').toLowerCase();
  if (t.includes('increase')) return 'increase';
  if (t.includes('decrease')) return 'decrease';
  return 'stable';
}

/** The item that appears most often, or 'N/A' for an empty list. */
export function mostCommon(values: string[]): string {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = 'N/A';
  let max = 0;
  counts.forEach((count, value) => {
    if (count > max) {
      max = count;
      best = value;
    }
  });
  return best;
}

export function newestFirst<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
