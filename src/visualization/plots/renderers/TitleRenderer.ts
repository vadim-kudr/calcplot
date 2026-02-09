/**
 * TitleRenderer - Renders plot titles
 */

import { LayerRenderer, RenderContext } from '../interfaces';
import { CachedLayerRenderer, CachedLayer } from './CachedLayerRenderer';

export interface TitleOptions {
  text?: string;
  color?: string;
  size?: number;
  font?: string;
  position?: 'top' | 'bottom' | 'center';
}

export type TitleLayer = CachedLayer<'title', TitleOptions>;

export class TitleRenderer extends CachedLayerRenderer<TitleLayer> implements LayerRenderer {
  private static renderedTitles = new Set<string>();

  render(layer: TitleLayer, context: RenderContext): void {
    const { svg, xScale, yScale } = context;
    const { options } = layer;

    const titleOptions = options as TitleOptions;
    const { text } = titleOptions;
    if (!text) return;

    // Prevent duplicate titles
    const titleKey = `${text}_${context.width}_${context.height}`;
    if (TitleRenderer.renderedTitles.has(titleKey)) {
      return;
    }
    TitleRenderer.renderedTitles.add(titleKey);

    // Remove any existing titles to prevent accumulation
    svg.selectAll('.plot-title').remove();

    // Create title element
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('class', 'plot-title');
    
    // Position title at top center, accounting for margins
    const centerX = (xScale.range()[0] + xScale.range()[1]) / 2;
    const topY = (context.margins?.top || 40) / 2; // Center in top margin
    
    title.setAttribute('x', String(centerX));
    title.setAttribute('y', String(topY));
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-size', '16px');
    title.setAttribute('font-family', 'Arial, sans-serif');
    title.setAttribute('font-weight', 'bold');
    title.setAttribute('fill', '#333');
    title.textContent = text;

    svg.node()?.appendChild(title);
  }

  // Clear rendered titles cache when needed
  static clearCache(): void {
    TitleRenderer.renderedTitles.clear();
  }
}
