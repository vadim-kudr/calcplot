/**
 * Show Manager - handles show mode initialization
 */

import { ViewRenderer } from '../../visualization/plots/renderers/ViewRenderer';
import { parseDimension, ensureUnits } from '../utils/dimensions';
import { initializeViews, createWrapper } from './LayoutManager';
import { ShowDescriptor } from '../../lib/types';
import { Timeline } from '../../core/timeline';

// Initialize show mode with pre-computed timeline
export function initializeShow(data: ShowDescriptor, container: HTMLElement, log: (...args: any[]) => void): void {
  try {
    const views = data.views || [];
    const isMultiView = views.length > 1;

    if (isMultiView) {
      // Multi-view layout - use LayoutManager for consistent behavior
      const containerWidth = data.width || 'auto';
      const containerHeight = data.height || '480px';

      const widthWithUnits = ensureUnits(containerWidth);
      const heightWithUnits = ensureUnits(containerHeight);
      
      // Use LayoutManager to create wrapper and renderers
      const multiViewContainer = createWrapper(container, widthWithUnits, heightWithUnits, 10);
      
      // Convert show views to ViewDescriptor format
      const viewDescriptors = views.map((v) => ({
        timeline: v.timeline,
        layers: v.layers,
        controls: v.controls || {}
      }));
      
      const renderers = initializeViews(viewDescriptors, multiViewContainer, widthWithUnits, heightWithUnits, log);
      
      // Render all views
      renderers.forEach((renderer, index) => {
        const viewData = views[index];
        renderer.render({
          type: 'view',
          timeline: new Timeline(viewData.timeline.times, viewData.timeline.states),
          layers: viewData.layers,
          width: parseDimension(viewData.width || 'auto', 800),
          height: parseDimension(viewData.height || 'auto', 480)
        });
      });

    } else {
      // Single view
      const viewData = views[0];
      if (viewData) {
        const width = parseDimension(viewData.width || 'auto', 800);
        const height = parseDimension(viewData.height || 'auto', 480);
        
        const renderer = new ViewRenderer(container, width, height, log);
        renderer.render({
          type: 'view',
          timeline: new Timeline(viewData.timeline.times, viewData.timeline.states),
          layers: viewData.layers,
          width,
          height
        });
      }
    }
  } catch (error: any) {
    log('Error in show initialization:', error.message);
  }
}
