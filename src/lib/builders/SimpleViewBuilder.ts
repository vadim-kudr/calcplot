/**
 * Simple chainable API for building visualizations
 * Based on LAYOUT.md recommendations
 */

import { PlotOptions, SceneFunction, SelectorFunction, ViewBuilder } from './ViewBuilder';
import { Timeline } from '../../core/ivp';

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

  plot(selector: SelectorFunction, options?: PlotOptions): SimpleViewBuilder {
    this.layers.push({
      type: 'plot',
      method: 'plot',
      args: [selector, options]
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

  axis(options?: any): SimpleViewBuilder {
    this.layers.push({
      type: 'axis',
      method: 'axis',
      args: [options],
      options: {
        showTicks: true,
        showLabels: true,
        tickSize: 6,
        tickPadding: 3,
        labelPadding: 20,
        fontSize: 12,
        fontColor: '#333',
        ...options
      }
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

export function plot(selector: SelectorFunction, options?: PlotOptions): SimpleViewBuilder {
  return new SimpleViewBuilder().plot(selector, options);
}

export function grid(options?: any): SimpleViewBuilder {
  return new SimpleViewBuilder().grid(options);
}

export function axis(options?: any): SimpleViewBuilder {
  return new SimpleViewBuilder().axis(options);
}

// For explicit canvas settings
export function canvas(options?: any): SimpleViewBuilder {
  return new SimpleViewBuilder();
}
