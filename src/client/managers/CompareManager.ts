/**
 * Compare Manager - handles compare mode initialization
 */

import { ViewManager } from './ViewManager';
import type { CompareDescriptor, ViewDescriptor } from '../../lib/types';

export function initializeCompare(data: CompareDescriptor, container: HTMLElement): void {
  const viewManager = new ViewManager(container);
  
  // Create single ViewDescriptor for compare mode
  const viewDescriptor: ViewDescriptor = {
    timeline: {
      times: data.timeline.times,
      states: data.timeline.states
    },
    layers: data.layers,
    width: data.width,
    height: data.height
  };
  
  viewManager.renderViews([viewDescriptor], data.width, data.height);
  
  // Save for cleanup
  (container as any)._viewManager = viewManager;
}
