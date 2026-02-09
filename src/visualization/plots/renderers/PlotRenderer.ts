/**
 * PlotRenderer - Renders plot layers using D3
 */

import * as d3 from 'd3';
import { LayerRenderer, Layer } from '../interfaces';
import { RenderContext } from '../interfaces/RenderContext';
import { DataFilter } from '../utils';
import { State, Params } from '../../../core/types';
import { Timeline } from '../../../core/types';
import { CachedLayerRenderer, CachedLayer } from './CachedLayerRenderer';
import { isSelectorResultParametric } from '../utils/PlotUtils';
import { SelectorResult } from '../../../lib/builders/BuilderInterfaces';
import { CALCPLOT_COLORS } from '../constants';

export interface PlotOptions {
  color?: string;
  lineWidth?: number;
  dash?: number[];
  label?: string;
  alpha?: number;
  opacity?: number;
}

export type PlotLayer = CachedLayer<'plot', PlotOptions>;

export class PlotRenderer extends CachedLayerRenderer<PlotLayer> implements LayerRenderer {
  render(layer: PlotLayer, context: RenderContext, timeline?: Timeline): void {
    if (!timeline) return;

    // Get cached selector function
    const selectFn = this.getSelectorFunction(layer);

    if (!selectFn) return;

    const plotData = this.extractPlotData(
      timeline,
      layer,
      context,
      selectFn
    );

    if (plotData) {
      const validData = DataFilter.filterValidData(plotData.xValues, plotData.yValues);

      if (validData.xValues.length > 0) {
        // Create plot group for proper structure
        const plotGroup = context.g.append('g').attr('class', 'plot-group');

        const color =
          layer.options?.color ||
          CALCPLOT_COLORS[(layer.index || 0) % CALCPLOT_COLORS.length];
        const lineWidth = layer.options?.lineWidth || 1.5;
        const opacity = layer.options?.opacity || 1;
        const dash = layer.options?.dash || [];

        const line = d3
          .line<number>()
          .x((d, i) => context.xScale(validData.xValues[i]))
          .y((d, i) => context.yScale(validData.yValues[i]));

        plotGroup
          .append('path')
          .datum(validData.xValues)
          .attr('class', `plot-line plot-${layer.index || 0}`)
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
  private extractPlotData(
    timeline: Timeline,
    layer: PlotLayer,
    context: RenderContext,
    selectFn: (state: State, params?: Params) => SelectorResult
  ): { xValues: number[]; yValues: number[] } | null {
    if (!selectFn) {
      console.warn('No selector function found in layer');
      return null;
    }

    // Check if function returns parametric data
    const isParametric = isSelectorResultParametric(selectFn({} as State));

    if (isParametric) {
      // Extract x,y pairs for parametric plot
      const points = timeline.times.map((_: any, i: number) => {
        const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
          acc[key] = timeline.states[key][i];
          return acc;
        }, {});

        return selectFn(state, context.params);
      });

      const validPoints = DataFilter.filterValidPoints(points);

      const xValues = validPoints.map((p: [number, number]) => p[0]);
      const yValues = validPoints.map((p: [number, number]) => p[1]);

      return { xValues, yValues };
    } else {
      // Extract y values for regular plot
      const yValues: number[] = timeline.times.map((_: any, i: number) => {
        const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
          acc[key] = timeline.states[key][i];
          return acc;
        }, {});

        const result = selectFn(state);
        return isSelectorResultParametric(result) ? (result as [number, number])[1] : (result as number); // For parametric, take y value
      });

      const xValues = timeline.times;

      // Filter valid data
      const filteredData = DataFilter.filterValidData(xValues, yValues);

      return filteredData;
    }
  }
}
