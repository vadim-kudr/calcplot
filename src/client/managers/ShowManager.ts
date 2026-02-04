/**
 * Show Manager - handles show mode initialization
 */

import { ViewRenderer } from '../../visualization/plots/renderers/ViewRenderer';
import { resolveDimension } from './ControlsManager';
import { ensureUnits } from '../utils/dimensions';

// Initialize show mode with pre-computed timeline
export function initializeShow(data: any, container: HTMLElement, log: (...args: any[]) => void): void {
  try {
    const views = data.views || [];
    const isMultiView = views.length > 1;

    if (isMultiView) {
      // Multi-view layout
      const layout = data.layout || { columns: views.length, rows: 1, gaps: 10 };
      const containerWidth = data.width || 'auto';
      const containerHeight = data.height || '480px';

      const widthWithUnits = ensureUnits(containerWidth);
      const heightWithUnits = ensureUnits(containerHeight);
      
    const multiViewContainer = document.createElement('div');
    multiViewContainer.style.cssText = `display: flex; flex-wrap: wrap; gap: ${layout.gaps}px; height: ${heightWithUnits};`;
      container.appendChild(multiViewContainer);

      // Create renderers
      views.forEach((viewData: any) => {
        const viewContainer = document.createElement('div');
        viewContainer.style.cssText = `flex: 1 1 calc(50% - 5px); min-width: 300px; height: 100%;`;
        multiViewContainer.appendChild(viewContainer);

        const renderer = new ViewRenderer(
          viewContainer,
          resolveDimension(viewData.width, container, 800, true), 
          resolveDimension(viewData.height, container, 480), 
          log
        );

        renderer.render(viewData);
      });

    } else {
      // Single view
      const viewData = views[0];
      if (viewData) {
        const renderer = new ViewRenderer(container, 
          resolveDimension(viewData.width, container, 800, true), 
          resolveDimension(viewData.height, container, 480), 
          log);
        renderer.render(viewData);
      }
    }
  } catch (error: any) {
    log('Error in show initialization:', error.message);
  }
}
