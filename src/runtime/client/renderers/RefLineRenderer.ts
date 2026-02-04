/**
 * RefLineRenderer - Renders horizontal and vertical reference lines
 */

export interface RefLineOptions {
  color?: string;
  linestyle?: 'solid' | 'dashed' | 'dotted';
  linewidth?: number;
  label?: string;
}

import { LayerRenderer, RenderContext } from '../interfaces';
import { Layer } from '../../../ui/ViewBuilder';

export class RefLineRenderer implements LayerRenderer {
  render(layer: Layer, context: RenderContext): void {
    const { svg, xScale, yScale } = context;
    const { options } = layer;

    const { orientation, value, color = 'gray', linestyle = 'solid', linewidth = 1, label } = options;

    // Create line element
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    
    if (orientation === 'horizontal') {
      const y = yScale(value);
      line.setAttribute('x1', String(xScale.range()[0]));
      line.setAttribute('x2', String(xScale.range()[1]));
      line.setAttribute('y1', String(y));
      line.setAttribute('y2', String(y));
    } else if (orientation === 'vertical') {
      const x = xScale(value);
      line.setAttribute('x1', String(x));
      line.setAttribute('x2', String(x));
      line.setAttribute('y1', String(yScale.range()[0]));
      line.setAttribute('y2', String(yScale.range()[1]));
    }

    // Apply styling
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', String(linewidth));
    
    // Apply line style
    if (linestyle === 'dashed') {
      line.setAttribute('stroke-dasharray', '5, 5');
    } else if (linestyle === 'dotted') {
      line.setAttribute('stroke-dasharray', '2, 2');
    }

    svg.node()?.appendChild(line);

    // Add label if provided
    if (label) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      
      if (orientation === 'horizontal') {
        text.setAttribute('x', String(xScale.range()[1] - 50));
        text.setAttribute('y', String(yScale(value) - 5));
      } else {
        text.setAttribute('x', String(xScale(value) + 5));
        text.setAttribute('y', String(yScale.range()[1] - 20));
      }
      
      text.setAttribute('fill', color);
      text.setAttribute('font-size', '12');
      text.setAttribute('font-family', 'Arial, sans-serif');
      text.textContent = label;
      
      svg.node()?.appendChild(text);
    }
  }
}
