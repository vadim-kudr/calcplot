/**
 * Compare Manager - handles compare mode initialization
 */

import { ViewRenderer } from '../../visualization/plots/renderers/ViewRenderer';
import { resolveDimension } from './ControlsManager';
import { ensureUnits } from '../utils/dimensions';

// Initialize compare mode with pre-computed timeline
export function initializeCompare(data: any, container: HTMLElement, log: (...args: any[]) => void): void {
  try {
    // Cleanup previous renderer if exists
    if ((container as any)._calcplotRenderer) {
      (container as any)._calcplotRenderer.destroy();
    }
    
    const renderer = new ViewRenderer(container, 
      resolveDimension(data.width, container, 800, true), 
      resolveDimension(data.height, container, 480), 
      log);
    
    // Save renderer reference for cleanup
    (container as any)._calcplotRenderer = renderer;
    renderer.render(data);
  } catch (error: any) {
    log('Error in compare initialization:', error.message);
  }
}
