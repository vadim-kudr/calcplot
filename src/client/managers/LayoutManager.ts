/**
 * Layout Manager - handles view layout and container management
 */

import { ViewRenderer } from '../../visualization/plots/renderers/ViewRenderer';
import { createElement } from '../../client/utils/html-tag';
import { parseDimension } from '../utils/dimensions';

// Create container wrapper for multiple views
export function createWrapper(container: HTMLElement, width: string | number, height: string | number, gaps: number): HTMLElement {
  const wrapper = createElement('div', {
    style: `display: flex; width: ${width}; height: ${height}; gap: ${gaps}px;`
  });
  container.appendChild(wrapper);
  return wrapper;
}

// Initialize multiple views in container
export function initializeViews(views: any[], container: HTMLElement, width: string | number, height: string | number, log: (...args: any[]) => void): ViewRenderer[] {
  const parsedWidth = parseDimension(width, 800);
  const parsedHeight = parseDimension(height, 480);
  
  // Calculate individual view dimensions
  const viewWidth = Math.floor(parsedWidth / views.length);
  const viewHeight = parsedHeight;
  
  return views.map((viewData: any, index: number) => {
    const viewContainer = createElement('div', {
      style: `width: ${viewWidth}px; height: ${viewHeight}px; flex: 1; min-width: 0;`
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
export function updateViews(renderers: ViewRenderer[], views: any[], timeline: any, params: any, width: number, height: number): void {
  const layout = { columns: views.length, rows: 1, gaps: 10 };
  
  // Calculate individual view dimensions
  const viewWidth = Math.floor(width / views.length);
  const viewHeight = height;

  views.forEach((viewData: any, index: number) => {
    let descriptor;
    
    if (viewData.layers && Array.isArray(viewData.layers)) {
      descriptor = {
        type: 'view',
        layers: viewData.layers,
        options: viewData.options
      };
    } else {
      descriptor = {
        type: 'view',
        layers: [],
        options: {}
      };
    }

    // Update renderer with correct dimensions
    const renderer = renderers[index];
    if (renderer) {
      renderer.render({
        type: 'view',
        timeline,
        layers: descriptor.layers,
        viewDescriptor: descriptor,
        options: descriptor.options,
        width: viewWidth,
        height: viewHeight
      });
    }
  });
}
