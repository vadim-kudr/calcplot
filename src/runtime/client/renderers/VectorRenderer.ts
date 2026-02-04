/**
 * VectorRenderer - Renders vector fields using D3
 */

import * as d3 from 'd3';
import { LayerRenderer } from '../interfaces';
import { RenderContext } from '../interfaces/RenderContext';
import { FunctionSerializer } from '../../serialization';

export interface VectorOptions {
  scale?: number;
  color?: string;
}

export class VectorRenderer implements LayerRenderer {
  render(layer: any, context: RenderContext, timeline?: any): void {
    if (!timeline) return;
    
    const { at, dir, options = {} } = layer;

    if (!at || !dir) {
      return;
    }

    let atFn: (s: any) => any;
    let dirFn: (s: any) => any;
    try {
      atFn = FunctionSerializer.parseAndCreateFunction(['s'], at) as (s: any) => any;
      dirFn = FunctionSerializer.parseAndCreateFunction(['s'], dir) as (s: any) => any;
    } catch (e) {
      console.warn('Failed to compile vector functions:', e);
      return;
    }

    const vectors: Array<{x: number, y: number, vx: number, vy: number}> = [];

    timeline.times.forEach((_: any, i: number) => {
      const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
        acc[key] = timeline.states[key][i];
        return acc;
      }, {});

      try {
        const position = atFn(state);
        const direction = dirFn(state);
        
        if (Array.isArray(position) && position.length === 2 && 
            Array.isArray(direction) && direction.length === 2) {
          vectors.push({
            x: position[0],
            y: position[1],
            vx: direction[0],
            vy: direction[1]
          });
        }
      } catch (e) {
        console.warn('Error in vector functions:', e);
      }
    });

    if (vectors.length > 0) {
      const scale = options.scale || 1;
      const color = options.color || '#666';
      
      // Arrow markers
      const defs = context.svg.append('defs');
      defs.append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 0,-5 L 10,0 L 0,5')
        .attr('fill', color);
      
      // Draw vectors
      context.g.selectAll('.vector')
        .data(vectors)
        .enter()
        .append('line')
        .attr('class', 'vector')
        .attr('x1', d => context.xScale(d.x))
        .attr('y1', d => context.yScale(d.y))
        .attr('x2', d => context.xScale(d.x + d.vx * scale))
        .attr('y2', d => context.yScale(d.y + d.vy * scale))
        .attr('stroke', color)
        .attr('stroke-width', 1.5)
        .attr('marker-end', 'url(#arrowhead)');
    }
  }
}
