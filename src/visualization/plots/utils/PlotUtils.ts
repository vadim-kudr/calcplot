/**
 * Plot utilities - common helper functions for plot rendering
 */

import { SelectorResult } from '../../../lib/builders/BuilderInterfaces';

/**
 * Check if a function result represents parametric data (x,y pair)
 */
export function isSelectorResultParametric(result: SelectorResult): boolean {
  return Array.isArray(result) && result.length === 2;
}
