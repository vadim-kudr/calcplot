/**
 * PlotRenderer - Renders plot layers using D3
 */

import * as d3 from 'd3';
import { LayerRenderer } from '../interfaces';
import { RenderContext } from '../interfaces/RenderContext';
import { FunctionSerializer } from '../../serialization';
import { DataFilter } from '../utils';

export interface PlotOptions {
  color?: string;
  label?: string;
  lineWidth?: number;
  opacity?: number;
  dash?: number[];
}

export class PlotRenderer implements LayerRenderer {
  render(layer: any, context: RenderContext, timeline?: any): void {
    if (!timeline) return;
    
    const plotData = this.extractPlotData(timeline, layer);
    
    if (plotData) {
      const validData = DataFilter.filterValidData(plotData.xValues, plotData.yValues);
      
      if (validData.xValues.length > 0) {
      // Create plot group for proper structure
      const plotGroup = context.g.append('g')
        .attr('class', 'plot-group');
      
      // Calcplot color palette (tab10)
        const calcplotColors = [
          '#1f77b4', // blue
          '#ff7f0e', // orange
          '#2ca02c', // green
          '#d62728', // red
          '#9467bd', // purple
          '#8c564b', // brown
          '#e377c2', // pink
          '#7f7f7f', // gray
          '#bcbd22', // olive
          '#17becf'  // cyan
        ];
        
        const color = layer.options?.color || calcplotColors[layer.index % calcplotColors.length];
        const lineWidth = layer.options?.lineWidth || 1.5;
        const opacity = layer.options?.opacity || 1;
        const dash = layer.options?.dash || [];
        
        const line = d3.line<number>()
          .x((d, i) => context.xScale(validData.xValues[i]))
          .y((d, i) => context.yScale(validData.yValues[i]));
        
        plotGroup.append('path')
          .datum(validData.xValues)
          .attr('class', `plot-line plot-${layer.index}`)
          .attr('d', line)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', lineWidth)
          .attr('stroke-opacity', opacity)
          .attr('stroke-dasharray', dash.join(' '))
          .attr('shape-rendering', 'geometricPrecision');
      }
    }
  }

  /**
   * Extract plot data from timeline and layer
   */
  private extractPlotData(timeline: any, layer: any): { xValues: number[], yValues: number[] } | null {
    const { selector } = layer;

    // Determine if this is a parametric plot by checking the selector
    let isParametric = false;
    try {
      const testState = { x: 0, y: 0 };
      const result = FunctionSerializer.parseAndCreateFunction(['s'], selector)(testState);
      isParametric = Array.isArray(result) && result.length === 2;
    } catch (e) {
      isParametric = false;
      console.warn('Parametric check failed:', e);
    }

  // Create function from selector
    let selectFn: (s: any) => any;
    try {
      selectFn = FunctionSerializer.parseAndCreateFunction(['s'], selector) as (s: any) => any;
    } catch (e) {
      console.warn('Failed to compile selector:', e);
      return null;
    }

    if (isParametric) {
      // Extract x,y pairs for parametric plot
      const points = timeline.times.map((_: any, i: number) => {
        const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
          acc[key] = timeline.states[key][i];
          return acc;
        }, {});
        const result = selectFn(state);
        return result;
      });

      const validPoints = DataFilter.filterValidPoints(points);

      const xValues = validPoints.map((p: [number, number]) => p[0]);
      const yValues = validPoints.map((p: [number, number]) => p[1]);

      return { xValues, yValues };
    } else {
      // Extract y values for regular plot
      const yValues = timeline.times.map((_: any, i: number) => {
        const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
          acc[key] = timeline.states[key][i];
          return acc;
        }, {});
        const result = selectFn(state);
        return result;
      });

      const xValues = timeline.times;

      // Filter valid data
      const filteredData = DataFilter.filterValidData(xValues, yValues);

      return filteredData;
    }
  }
}
