/**
 * VectorFieldRenderer - Renders vector field visualizations
 */

export interface VectorFieldOptions {
  gridSize?: number;
  color?: string;
  alpha?: number;
  normalize?: boolean;
  scale?: number;
}

import { LayerRenderer, RenderContext } from '../interfaces';
import { Layer } from '../../../lib';

export class VectorFieldRenderer implements LayerRenderer {
  render(layer: Layer, context: RenderContext): void {
    const { svg, xScale, yScale } = context;
    const { selector, options } = layer;

    if (!selector) return;

    // Parse the vector field function
    const vectorFn = new Function('state', 'params', `return ${selector}`) as (state: any, params: any) => { dx: number; dy: number };

    const { gridSize = 20, color = 'gray', alpha = 0.6, normalize = true, scale = 1 } = options;

    // Create grid of vector arrows
    const xRange = xScale.domain();
    const yRange = yScale.domain();
    const xStep = (xRange[1] - xRange[0]) / gridSize;
    const yStep = (yRange[1] - yRange[0]) / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = xRange[0] + (i + 0.5) * xStep;
        const y = yRange[0] + (j + 0.5) * yStep;

        // Create mock state for vector field evaluation
        const gridState = { x, y, v: y, time: 0 };

        // Evaluate vector field
        const vector = vectorFn(gridState, {});
        const { dx, dy } = vector;

        // Normalize if requested
        let scaledDx = dx;
        let scaledDy = dy;
        if (normalize) {
          const magnitude = Math.sqrt(dx * dx + dy * dy);
          if (magnitude > 0) {
            scaledDx = (dx / magnitude) * scale;
            scaledDy = (dy / magnitude) * scale;
          }
        } else {
          scaledDx = dx * scale;
          scaledDy = dy * scale;
        }

        // Convert to screen coordinates
        const startX = xScale(x);
        const startY = yScale(y);
        const endX = xScale(x + scaledDx);
        const endY = yScale(y + scaledDy);

        // Draw arrow
        this.drawArrow(svg, startX, startY, endX, endY, color, alpha);
      }
    }
  }

  private drawArrow(svg: any, x1: number, y1: number, x2: number, y2: number, color: string, alpha: number): void {
    // Create arrow line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(x1));
    line.setAttribute('y1', String(y1));
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', String(y2));
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '1');
    line.setAttribute('stroke-opacity', String(alpha));
    svg.node().appendChild(line);

    // Calculate arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLength = 6;
    const headAngle = Math.PI / 6;

    // Arrowhead points
    const headX1 = x2 - headLength * Math.cos(angle - headAngle);
    const headY1 = y2 - headLength * Math.sin(angle - headAngle);
    const headX2 = x2 - headLength * Math.cos(angle + headAngle);
    const headY2 = y2 - headLength * Math.sin(angle + headAngle);

    // Draw arrowhead
    const head = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    head.setAttribute('d', `M ${x2} ${y2} L ${headX1} ${headY1} M ${x2} ${y2} L ${headX2} ${headY2}`);
    head.setAttribute('stroke', color);
    head.setAttribute('stroke-width', '1');
    head.setAttribute('stroke-opacity', String(alpha));
    svg.node().appendChild(head);
  }
}
