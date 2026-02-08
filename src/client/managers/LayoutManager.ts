/**
 * Layout Manager - handles view layout and container management
 */

import { ViewRenderer } from '../../visualization/plots/renderers/ViewRenderer';
import { createElement } from '../../client/utils/html-tag';
import { parseDimension } from '../utils/dimensions';
import { ViewDescriptor, ViewConfig } from '../../lib/types';
import { Timeline, Params } from '../../core/types';

// Create container wrapper for multiple views
export function createWrapper(container: HTMLElement, width: string | number, height: string | number, gaps: number): HTMLElement {
  const wrapper = createElement('div', {
    style: `display: flex; width: ${width}; min-height: ${height}; gap: ${gaps}px;`
  });
  container.appendChild(wrapper);
  return wrapper;
}

// Initialize multiple views in container
export function initializeViews(views: ViewConfig[], container: HTMLElement, width: string | number, height: string | number, log: (...args: unknown[]) => void): ViewRenderer[] {
  const parsedWidth = parseDimension(width, 800);
  const parsedHeight = parseDimension(height, 480);
  
  // Calculate individual view dimensions
  const viewWidth = Math.floor(parsedWidth / views.length);
  const viewHeight = parsedHeight;
  
  return views.map((viewData, index: number) => {
    const viewContainer = createElement('div', {
      style: `width: ${viewWidth}px; min-height: ${viewHeight}px; flex: 1; min-width: 0;`
    });
    container.appendChild(viewContainer);

    return new ViewRenderer(
      viewContainer,
      viewWidth,
      viewHeight,
      log
    );
  });
}

// Update all views with new data
export function updateViews(renderers: ViewRenderer[], views: ViewConfig[], timeline: Timeline, params: Params, width: number, height: number): void {
  const layout = { columns: views.length, rows: 1, gaps: 10 };
  
  // Calculate individual view dimensions
  const viewWidth = Math.floor(width / views.length);
  const viewHeight = height;

  views.forEach((viewData, index: number) => {
    if (viewData?.layers && Array.isArray(viewData.layers)) {
      // Update renderer with correct dimensions
      const renderer = renderers[index];
      if (renderer) {
        renderer.render({
          type: 'view',
          timeline,
          layers: viewData.layers,
          viewDescriptor: {
            layers: viewData.layers,
            controls: viewData.controls
          },
          width: viewWidth,
          height: viewHeight
        });
      }
    }
  });
}
