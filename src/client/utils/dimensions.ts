/**
 * Dimension utilities - helper functions for handling dimensions
 */

export function ensureUnits(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

export function parseDimension(value: string | number | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') {
    return value;
  }
  // Remove 'px' suffix and parse
  const cleaned = value.replace('px', '');
  // Check if cleaned string is a valid number
  if (!/^-?\d*\.?\d+$/.test(cleaned.trim())) {
    return undefined;
  }
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? undefined : parsed;
}
