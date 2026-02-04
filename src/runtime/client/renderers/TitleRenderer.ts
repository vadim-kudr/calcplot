/**
 * TitleRenderer - Renders plot titles
 */

export interface TitleOptions {
  text: string;
}

import { LayerRenderer, RenderContext } from '../interfaces';
import { Layer } from '../../../ui/ViewBuilder';

export class TitleRenderer implements LayerRenderer {
  render(layer: Layer, context: RenderContext): void {
    const { svg, xScale, yScale } = context;
    const { options } = layer;

    const { text } = options;
    if (!text) return;

    // Create title element
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    
    // Position title at top center
    const centerX = (xScale.range()[0] + xScale.range()[1]) / 2;
    const topY = 30; // Margin from top
    
    title.setAttribute('x', String(centerX));
    title.setAttribute('y', String(topY));
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-size', '18px');
    title.setAttribute('font-family', 'Arial, sans-serif');
    title.setAttribute('font-weight', 'bold');
    title.setAttribute('fill', '#333');
    title.textContent = text;

    svg.node()?.appendChild(title);
  }
}
