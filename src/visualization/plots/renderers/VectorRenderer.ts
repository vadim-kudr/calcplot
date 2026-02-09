/**
 * VectorRenderer - Renders vector fields using D3
 */

import * as d3 from 'd3';
import { LayerRenderer, RenderContext } from '../interfaces';
import { Timeline, State, Params } from '../../../core/types';
import { CachedLayerRenderer, CachedLayer } from './CachedLayerRenderer';

export interface VectorOptions {
  color?: string;
  label?: string;
  scale?: number;
  width?: number;
}

export type VectorLayer = CachedLayer<'vector', VectorOptions> & {
  at?: string; // serialized function
  dir?: string; // serialized function
};

export class VectorRenderer extends CachedLayerRenderer<VectorLayer> implements LayerRenderer {
  render(layer: VectorLayer, context: RenderContext, timeline?: Timeline): void {
    if (!timeline) return;
    
    // Get cached vector functions using CachedLayerRenderer
    const atFn = this.getVectorFunction(layer, 'at');
    const dirFn = this.getVectorFunction(layer, 'dir');
    
    if (!atFn || !dirFn) {
      return;
    }
    
    const { at, dir, options = {} } = layer;
    const scale = (options as VectorOptions)?.scale ?? 1;
    const color = (options as VectorOptions)?.color ?? 'gray';
    
    const vectors: Array<{x: number, y: number, vx: number, vy: number}> = [];

    timeline.times.forEach((_: any, i: number) => {
      const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
        acc[key] = timeline.states[key][i];
        return acc;
      }, {});

      try {
        const position = atFn(state, context.params || {});
        const direction = dirFn(state, context.params || {});
        
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
      const vectorOptions = layer.options as VectorOptions;
      const scale = vectorOptions?.scale || 1;
      const color = vectorOptions?.color || '#666';
      
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
