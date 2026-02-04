/**
 * PoincareRenderer - Renders Poincaré sections
 */

export interface PoincareOptions {
  section: (state: any) => boolean;    // Section condition
  direction?: 'positive' | 'negative' | 'both';  // Crossing direction
  marker?: string;                    // Marker style
  color?: string;                      // Color
  size?: number;                       // Marker size
}

import { LayerRenderer, RenderContext } from '../interfaces';
import { Layer } from '../../../ui/ViewBuilder';

export class PoincareRenderer implements LayerRenderer {
  render(layer: Layer, context: RenderContext): void {
    const { svg, xScale, yScale } = context;
    const { selector, options } = layer;

    if (!selector) return;

    // Parse the section function
    const sectionFn = new Function('state', `return ${selector}`) as (state: any) => boolean;
    
    const { 
      direction = 'positive', 
      marker = 'circle', 
      color = 'red', 
      size = 4 
    } = options;

    // Get the timeline from context
    const timeline = (context as any).timeline;
    if (!timeline) return;

    // Find Poincaré section points
    const points = this.findPoincarePoints(timeline, sectionFn, direction);

    // Render points
    points.forEach(point => {
      const x = xScale(point.x);
      const y = yScale(point.y);

      if (marker === 'circle') {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', String(x));
        circle.setAttribute('cy', String(y));
        circle.setAttribute('r', String(size));
        circle.setAttribute('fill', color);
        svg.node()!.appendChild(circle);
      } else if (marker === 'cross') {
        // Draw X marker
        const cross = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        cross.setAttribute('transform', `translate(${x}, ${y})`);
        
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', String(-size));
        line1.setAttribute('y1', String(-size));
        line1.setAttribute('x2', String(size));
        line1.setAttribute('y2', String(size));
        line1.setAttribute('stroke', color);
        line1.setAttribute('stroke-width', '2');
        
        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', String(-size));
        line2.setAttribute('y1', String(size));
        line2.setAttribute('x2', String(size));
        line2.setAttribute('y2', String(-size));
        line2.setAttribute('stroke', color);
        line2.setAttribute('stroke-width', '2');
        
        cross.appendChild(line1);
        cross.appendChild(line2);
        svg.node()!.appendChild(cross);
      }
    });
  }

  private findPoincarePoints(timeline: any, sectionFn: (state: any) => boolean, direction: string): any[] {
    const points: any[] = [];
    const times = timeline.times;
    const states = timeline.states;

    // Get state keys (assuming we have at least x and y for phase space)
    const stateKeys = Object.keys(states);
    
    for (let i = 1; i < times.length; i++) {
      const prevState = {
        time: times[i - 1],
        ...Object.fromEntries(stateKeys.map(key => [key, states[key][i - 1]]))
      };
      
      const currState = {
        time: times[i],
        ...Object.fromEntries(stateKeys.map(key => [key, states[key][i]]))
      };

      const prevValue = sectionFn(prevState) ? 1 : -1; // Convert boolean to number
      const currValue = sectionFn(currState) ? 1 : -1; // Convert boolean to number

      // Check for zero crossing
      if (prevValue * currValue < 0) {
        // Determine crossing direction
        const crossingDirection = currValue > prevValue ? 'positive' : 'negative';
        
        if (direction === 'both' || direction === crossingDirection) {
          // Linear interpolation to find exact crossing point
          const alpha = Math.abs(prevValue) / (Math.abs(currValue) + Math.abs(prevValue));
          
          const crossingState = {
            time: prevState.time + alpha * (currState.time - prevState.time),
            ...Object.fromEntries(stateKeys.map(key => [
              key, 
              (prevState as any)[key] + alpha * ((currState as any)[key] - (prevState as any)[key])
            ]))
          };

          // Extract x, y coordinates (assuming phase space variables)
          const point = {
            x: (crossingState as any).x || (crossingState as any).x1 || 0,
            y: (crossingState as any).y || (crossingState as any).x2 || (crossingState as any).v || 0,
            time: crossingState.time
          };

          points.push(point);
        }
      }
    }

    return points;
  }
}
