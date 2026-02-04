/**
 * FillRenderer - Renders filled regions based on predicates
 */

export interface FillOptions {
  color?: string;
  alpha?: number;
}

import { LayerRenderer, RenderContext } from '../interfaces';
import { Layer } from '../../../lib';

export class FillRenderer implements LayerRenderer {
  render(layer: Layer, context: RenderContext): void {
    const { svg, xScale, yScale } = context;
    const { selector, options } = layer;

    if (!selector) return;

    // Parse the predicate function
    const predicateFn = new Function('state', `return ${selector}`) as (state: any) => boolean;
    
    const { color = 'blue', alpha = 0.2 } = options;

    // Get the current state from timeline if available
    const timeline = (context as any).timeline;
    if (!timeline || !timeline.times || !timeline.states) return;

    // Create filled region
    const pathData: string[] = [];
    let lastX: number | null = null;
    
    timeline.times.forEach((time: any, i: any) => {
      const state: any = {
        time: time,
        ...Object.fromEntries(Object.keys(timeline.states).map(key => [key, timeline.states[key][i]]))
      };
      
      const x = xScale((state as any).x || 0);
      const y = yScale((state as any).y || 0);
      
      if (predicateFn(state)) {
        if (lastX === null) {
          // Start new path
          pathData.push(`M ${x} ${y}`);
        } else {
          // Continue path
          pathData.push(`L ${x} ${y}`);
        }
        lastX = x;
      } else if (lastX !== null) {
        // Close current path
        pathData.push(`L ${x} ${yScale(0)} L ${lastX} ${yScale(0)} Z`);
        lastX = null;
      }
    });

    // Close any open path
    if (lastX !== null) {
      pathData.push(`L ${lastX} ${yScale(0)} Z`);
    }

    // Create and append path
    const fillPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    fillPath.setAttribute('d', pathData.join(' '));
    fillPath.setAttribute('fill', color);
    fillPath.setAttribute('fill-opacity', String(alpha));
    fillPath.setAttribute('stroke', 'none');
    
    svg.node()!.appendChild(fillPath);
  }
}
