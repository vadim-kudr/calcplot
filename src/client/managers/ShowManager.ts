/**
 * Show Manager - handles show mode initialization
 */

import { ViewManager } from './ViewManager';
import { Timeline } from '../../core/timeline';
import type { ShowDescriptor, ViewDescriptor } from '../../lib/types';

export function initializeShow(data: ShowDescriptor, container: HTMLElement): void {
  const viewManager = new ViewManager(container);

  const viewDescriptors: ViewDescriptor[] = data.views.map((view) => ({
    timeline: new Timeline(view.timeline.times, view.timeline.states),
    layers: view.layers,
    width: view.width || data.width,
    height: view.height || data.height
  }));

  viewManager.renderViews(viewDescriptors, data.width, data.height);

  // Save for cleanup
  (container as any)._viewManager = viewManager;
}
