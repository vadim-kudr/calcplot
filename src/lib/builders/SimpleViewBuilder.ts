/**
 * Simple chainable API for building visualizations
 * Based on LAYOUT.md recommendations
 */

import { PlotOptions, SceneFunction, SelectorFunction, parsePlotArgs, parseAxisArgs } from './BuilderUtils';
import { ViewBuilder } from './ViewBuilder';
import type { Timeline } from '../../core/types';

export class SimpleViewBuilder {
  private layers: Array<{
    type: string;
    method: string;
    args: any[];
    options?: any;
  }> = [];

  scene(drawFn: SceneFunction): SimpleViewBuilder {
    this.layers.push({
      type: 'scene',
      method: 'scene',
      args: [drawFn]
    });
    return this;
  }

  plot(selector: SelectorFunction, arg2?: string | PlotOptions, arg3?: string): SimpleViewBuilder {
    const { selector: parsedSelector, options } = parsePlotArgs(selector, arg2, arg3);
    this.layers.push({
      type: 'plot',
      method: 'plot',
      args: [parsedSelector, options],
      options
    });
    return this;
  }

  grid(options?: any): SimpleViewBuilder {
    this.layers.push({
      type: 'grid',
      method: 'grid',
      args: [options],
      options: {
        showGrid: true,
        gridColor: '#e0e0e0',
        gridOpacity: 0.3,
        gridWidth: 0.5,
        ...options
      }
    });
    return this;
  }

  axis(arg1?: string | number | any, arg2?: string, arg3?: number): SimpleViewBuilder {
    const { options } = parseAxisArgs(arg1, arg2, arg3);
    this.layers.push({
      type: 'axis',
      method: 'axis',
      args: [options],
      options
    });
    return this;
  }

  // Execute all layers on timeline and return single ViewBuilder
  execute(timeline: Timeline): ViewBuilder {
    const builder = new ViewBuilder(timeline);

    for (const layer of this.layers) {
      switch (layer.method) {
        case 'scene':
          builder.scene(layer.args[0]);
          break;
        case 'plot':
          builder.plot(layer.args[0], layer.args[1]);
          break;
        case 'grid':
          builder.grid(layer.args[0]);
          break;
        case 'axis':
          builder.axis(layer.args[0]);
          break;
      }
    }

    return builder;
  }
}

// Smart functions that create chainable builder
export function scene(drawFn: SceneFunction): SimpleViewBuilder {
  return new SimpleViewBuilder().scene(drawFn);
}

export function plot(selector: SelectorFunction, label?: string): SimpleViewBuilder;
export function plot(selector: SelectorFunction, color: string, label?: string): SimpleViewBuilder;
export function plot(selector: SelectorFunction, options?: PlotOptions): SimpleViewBuilder;
export function plot(selector: SelectorFunction, arg2?: string | PlotOptions, arg3?: string): SimpleViewBuilder {
  return new SimpleViewBuilder().plot(selector, arg2, arg3);
}

export function grid(options?: any): SimpleViewBuilder {
  return new SimpleViewBuilder().grid(options);
}

export function axis(xLabel?: string, yLabel?: string, aspectRatio?: number): SimpleViewBuilder;
export function axis(aspectRatio?: number): SimpleViewBuilder;
export function axis(options?: any): SimpleViewBuilder;
export function axis(arg1?: string | number | any, arg2?: string, arg3?: number): SimpleViewBuilder {
  return new SimpleViewBuilder().axis(arg1, arg2, arg3);
}

// For explicit canvas settings
export function canvas(options?: any): SimpleViewBuilder {
  return new SimpleViewBuilder();
}
