/**
 * Dimension utilities - helper functions for handling dimensions
 */

export function ensureUnits(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export function parseDimension(value: string | number, fallback: number): number {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = parseInt(value);
  return isNaN(parsed) ? fallback : parsed;
}
