/**
 * SceneRenderer - Renders custom scene drawings using D3-aware drawing context
 */

import * as d3 from 'd3';
import { LayerRenderer } from '../interfaces';
import { RenderContext } from '../interfaces/RenderContext';
import { CachedLayerRenderer, CachedLayer } from './CachedLayerRenderer';
import { State, Params } from '../../../core/types';
import { SceneLayer } from '../../../lib/builders/BuilderInterfaces';

export interface SceneOptions {
  backgroundColor?: string;
}

export type SceneLayerWithCache = CachedLayer<'scene', SceneOptions> & { draw?: string };

export class SceneRenderer extends CachedLayerRenderer<SceneLayerWithCache> implements LayerRenderer {
  render(layer: SceneLayerWithCache, context: RenderContext, timeline?: any): void {
    if (!timeline) return;
    
    // Get cached draw function
    const drawFn = this.getDrawFunction(layer, layer.draw);
    
    if (!drawFn) {
      console.warn('No draw function found in layer');
      return;
    }

    // Create D3 drawing context
    const d3Context = this.createD3DrawContext(context);

    timeline.times.forEach((_: any, i: number) => {
      const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
        acc[key] = timeline.states[key][i];
        return acc;
      }, {});

      try {
        drawFn(d3Context, state);
      } catch (e) {
        console.warn('Error in scene function:', e);
      }
    });
  }

  /**
   * Create D3-aware drawing context for scene rendering
   */
  private createD3DrawContext(context: RenderContext): any {
    return {
      plot: (xValues: number[], yValues: number[], options?: any) => {
        const color = options?.color || '#000';
        const line = d3.line<number>()
          .x((d, i) => context.xScale(xValues[i]))
          .y((d, i) => context.yScale(yValues[i]));
        
        context.g.append('path')
          .datum(xValues)
          .attr('d', line)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', options?.width || 2);
      },
      line: (from: [number, number], to: [number, number], options?: any) => {
        context.g.append('line')
          .attr('x1', context.xScale(from[0]))
          .attr('y1', context.yScale(from[1]))
          .attr('x2', context.xScale(to[0]))
          .attr('y2', context.yScale(to[1]))
          .attr('stroke', options?.color || '#000')
          .attr('stroke-width', options?.width || 1);
      },
      circle: (center: [number, number], radius: number, options?: any) => {
        context.g.append('circle')
          .attr('cx', context.xScale(center[0]))
          .attr('cy', context.yScale(center[1]))
          .attr('r', radius)
          .attr('fill', options?.fill || 'none')
          .attr('stroke', options?.stroke || '#000')
          .attr('stroke-width', options?.width || 1);
      },
      arrow: (from: [number, number], to: [number, number], options?: any) => {
        const color = options?.color || '#000';
        const width = options?.width || 1;
        
        // Create arrow marker
        if (!context.svg.select('#arrowhead-scene').node()) {
          const defs = context.svg.append('defs');
          defs.append('marker')
            .attr('id', 'arrowhead-scene')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 8)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0,-5 L 10,0 L 0,5')
            .attr('fill', color);
        }
        
        context.g.append('line')
          .attr('x1', context.xScale(from[0]))
          .attr('y1', context.yScale(from[1]))
          .attr('x2', context.xScale(to[0]))
          .attr('y2', context.yScale(to[1]))
          .attr('stroke', color)
          .attr('stroke-width', width)
          .attr('marker-end', 'url(#arrowhead-scene)');
      },
      text: (pos: [number, number], text: string, options?: any) => {
        context.g.append('text')
          .attr('x', context.xScale(pos[0]))
          .attr('y', context.yScale(pos[1]))
          .attr('fill', options?.color || '#000')
          .attr('font-size', options?.size || 12)
          .attr('font-family', options?.font || 'sans-serif')
          .text(text);
      }
    };
  }
}
