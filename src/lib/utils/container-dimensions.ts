/**
 * Container dimension utilities
 * Simplified approach - work with real container sizes directly
 */

import type { ContainerSize } from '../types';

/**
 * Get real container dimensions
 */
export function getContainerSize(element: HTMLElement): ContainerSize {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height
  };
}

/**
 * Parse dimension value (string or number) to number
 */
export function parseDimension(value: string | number, fallback: number = 0): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

/**
 * Calculate container-based dimensions - simplified
 */
export function calculateContainerDimensions(
  container: HTMLElement,
  defaultWidth: number | string,
  defaultHeight: number
): { width: number; height: number } {
  const containerSize = getContainerSize(container);
  
  // Simple logic: if auto width, use container width, otherwise parse string
  const width = defaultWidth === 'auto' 
    ? containerSize.width 
    : (typeof defaultWidth === 'string' ? parseDimension(defaultWidth, 800) : defaultWidth);
  
  return {
    width: width,
    height: containerSize.height || defaultHeight
  };
}
