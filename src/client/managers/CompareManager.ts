/**
 * Compare Manager - handles compare mode initialization
 */

import { ViewRenderer } from '../../visualization/plots/renderers/ViewRenderer';
import { resolveDimension } from './ControlsManager';
import { ensureUnits } from '../utils/dimensions';
import type { CompareDescriptor } from '../../lib/types';

// Initialize compare mode with pre-computed timeline
export function initializeCompare(data: CompareDescriptor, container: HTMLElement, log: (...args: unknown[]) => void): void {
  try {
    // Cleanup previous renderer if exists
    if ((container as any)._calcplotRenderer) {
      (container as any)._calcplotRenderer.destroy();
    }

    // Create new renderer
    const width = typeof data.width === 'string' ? parseInt(data.width) : data.width;
    const height = typeof data.height === 'string' ? parseInt(data.height) : data.height;
    const renderer = new ViewRenderer(container, width || 800, height || 480, log);
    
    // Save renderer reference for cleanup
    (container as any)._calcplotRenderer = renderer;
    renderer.render(data as any);
  } catch (error: unknown) {
    log('Error in compare initialization:', error instanceof Error ? error.message : String(error));
  }
}
