/**
 * NullclineRenderer - Renders nullclines (where derivatives are zero)
 */

import { LayerRenderer, RenderContext } from '../interfaces';
import { CachedLayerRenderer, CachedLayer } from './CachedLayerRenderer';

export interface NullclineOptions {
  color?: string;
  linestyle?: 'solid' | 'dashed' | 'dotted';
  linewidth?: number;
  label?: string;
  position?: string;
}

export type NullclineLayer = CachedLayer<'nullcline', NullclineOptions>;

export class NullclineRenderer extends CachedLayerRenderer<NullclineLayer> implements LayerRenderer {
  render(layer: NullclineLayer, context: RenderContext): void {
    const { svg, xScale, yScale } = context;
    const { selector, options } = layer;

    if (!selector) return;

    // Parse the variable name and create nullcline function
    const variable = selector;
    const nullclineOptions = options as NullclineOptions;
    const { color = 'red', linestyle = 'dashed', linewidth = 1, label } = nullclineOptions;

    // Create nullcline by sampling points where derivative is approximately zero
    const xRange = xScale.domain();
    const yRange = yScale.domain();
    const resolution = 50;
    const xStep = (xRange[1] - xRange[0]) / resolution;
    const yStep = (yRange[1] - yRange[0]) / resolution;

    const points: [number, number][] = [];
    // For now, we'll create a placeholder nullcline calculation
    for (let i = 0; i <= resolution; i++) {
      const x = xRange[0] + (xRange[1] - xRange[0]) * i / resolution;
      
      // Simplified nullcline calculation - this would need the actual model derivative functions
      // For demonstration, we'll create some example nullclines
      let y: number;
      
      if (variable === 'x') {
        // dx/dt = 0 nullcline (example: v = 0 for simple oscillator)
        y = 0;
      } else if (variable === 'v') {
        // dv/dt = 0 nullcline (example: x = 0 for simple oscillator)
        y = Math.sin(x) * 2;
      } else {
        // Generic placeholder
        y = Math.sin(x) * 2;
      }

      // Only add points within the y range
      if (y >= yRange[0] && y <= yRange[1]) {
        points.push([x, y]);
      }
    }

    // Create path from points
    if (points.length > 0) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      // Sort points by x coordinate for better path
      points.sort((a, b) => a[0] - b[0]);
      
      let pathData = `M ${xScale(points[0][0])} ${yScale(points[0][1])}`;
      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${xScale(points[i][0])} ${yScale(points[i][1])}`;
      }
      
      path.setAttribute('d', pathData);
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', String(linewidth));
      path.setAttribute('fill', 'none');
      
      // Apply line style
      if (linestyle === 'dashed') {
        path.setAttribute('stroke-dasharray', '5, 5');
      } else if (linestyle === 'dotted') {
        path.setAttribute('stroke-dasharray', '2, 2');
      }
      
      svg.node()!.appendChild(path);

      // Add label if provided
      if (label && points.length > 0) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', String(xScale(points[Math.floor(points.length / 2)][0])));
        text.setAttribute('y', String(yScale(points[Math.floor(points.length / 2)][1]) - 5));
        text.setAttribute('fill', color);
        text.setAttribute('font-size', '12');
        text.setAttribute('font-family', 'Arial, sans-serif');
        text.textContent = label;
        
        svg.node()!.appendChild(text);
      }
    }
  }
}
