/**
 * Unified Rendering System
 * Provides automatic environment detection and renderer selection
 */

import { EnvironmentRenderer, RenderOptions } from './EnvironmentRenderer';
import { WebRenderer } from './WebRenderer';
import { DenoRenderer } from './DenoRenderer';
import { detectEnvironment } from '../utils/environment';
import type { AnyDescriptor } from '../types';

/**
 * Main rendering function that automatically selects appropriate renderer
 */
export async function render(descriptor: AnyDescriptor, options?: RenderOptions): Promise<void> {
  const renderer = createRenderer();
  await renderer.render(descriptor, options);
}

/**
 * Create appropriate renderer for current environment
 */
export function createRenderer(): EnvironmentRenderer {
  const environment = detectEnvironment();
  
  switch (environment) {
    case 'browser':
      return new WebRenderer();
    
    case 'deno':
      return new DenoRenderer();
    
    case 'node':
      // For Node.js, we could implement a server-side renderer or throw error
      throw new Error('Node.js environment not supported for direct rendering. Use Deno or browser environment.');
    
    default:
      throw new Error(`Unsupported environment: ${environment}`);
  }
}

/**
 * Get available renderer for current environment
 */
export function getAvailableRenderer(): EnvironmentRenderer | null {
  try {
    return createRenderer();
  } catch {
    return null;
  }
}

/**
 * Check if rendering is available in current environment
 */
export function isRenderingAvailable(): boolean {
  return getAvailableRenderer() !== null;
}

// Export renderers for direct use if needed
export { WebRenderer, DenoRenderer };
export type { RenderOptions };
