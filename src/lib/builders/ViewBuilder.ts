/**
 * Chainable API for building visualizations
 */

import { State, Params, Timeline } from '../../core/types';
import { parsePlotArgs, parseAxisArgs } from './BuilderUtils';
import type { 
  PlotOptions,
  AxisOptions,
  GridOptions,
  FillOptions,
  RefLineOptions,
  LegendOptions,
  TitleOptions,
  VectorFieldOptions,
  PoincareOptions,
  NullclineOptions,
  VectorOptions,
  SceneOptions
} from '../../visualization/plots/interfaces';
import { SceneFunction, VectorFunction, DrawContext, SelectorFunction, SceneLayer } from './BuilderInterfaces';
import { FunctionSerializer } from '../../simulation/serialization';
import { Layer } from '../../visualization/plots/interfaces';

export class ViewBuilder {
  private layers: Layer[] = []; 
  private timeline?: Timeline;

  constructor(timeline?: Timeline) {
    this.timeline = timeline;
  }

  /**
   * Add custom scene drawing layer
   */
  scene(drawFn: SceneFunction): ViewBuilder {
    const layer: SceneLayer = {
      type: 'scene',
      draw: FunctionSerializer.serializeFunction(drawFn)
    };
    
    this.layers.push(layer);
    return this;
  }

  /**
   * Add vector layer
   */
  vector(at: VectorFunction, dir: VectorFunction, options: VectorOptions = {}): ViewBuilder {
    const layer = {
      type: 'vector' as const,
      at: FunctionSerializer.serializeFunction(at),
      dir: FunctionSerializer.serializeFunction(dir),
      options
    };
    
    this.layers.push(layer);
    return this;
  }

  grid(options: GridOptions = {}): ViewBuilder {
    const layer = {
      type: 'grid' as const,
      options: options
    };
    this.layers.push(layer);
    return this;
  }

  /**
   * Add axis layer with flexible signature support
   */
  axis(arg1?: string | number | AxisOptions, arg2?: string, arg3?: number): ViewBuilder {
    const { options } = parseAxisArgs(arg1, arg2, arg3);
    const layer = {
      type: 'axis' as const,
      options: options
    };
    this.layers.push(layer);
    return this;
  }

  /**
   * Add plot layer with flexible signature support
   */
  plot(selector: SelectorFunction, arg2?: string | PlotOptions, arg3?: string): ViewBuilder {
    const { selector: parsedSelector, options } = parsePlotArgs(selector, arg2, arg3);
    const plotIndex = this.layers.filter(l => l.type === 'plot').length;

    const layer = {
      type: 'plot' as const,
      index: plotIndex,
      selector: FunctionSerializer.serializeFunction(parsedSelector),
      options
    };
    
    this.layers.push(layer);
    return this;
  }

  /**
   * Fill region where condition is true
   */
  fill(predicate: (state: State) => boolean, options: FillOptions = {}): ViewBuilder {
    const layer = {
      type: 'fill' as const,
      selector: FunctionSerializer.serializeFunction(predicate),
      options
    };
    
    this.layers.push(layer);
    return this;
  }

  /**
   * Add horizontal reference line
   */
  axhline(y: number, options: RefLineOptions = {}): ViewBuilder {
    const layer = {
      type: 'refline' as const,
      options: {
        orientation: 'horizontal' as const,
        value: y,
        ...options
      }
    };
    this.layers.push(layer);
    return this;
  }

  /**
   * Add vertical reference line
   */
  axvline(x: number, options: RefLineOptions = {}): ViewBuilder {
    const layer = {
      type: 'refline' as const,
      options: {
        orientation: 'vertical' as const,
        value: x,
        ...options
      }
    };
    this.layers.push(layer);
    return this;
  }

  /**
   * Set plot title
   */
  title(text: string): ViewBuilder {
    const layer = {
      type: 'title' as const,
      options: { text }
    };
    this.layers.push(layer);
    return this;
  }

  /**
   * Add legend
   */
  legend(options: LegendOptions = {}): ViewBuilder {
    const layer = {
      type: 'legend' as const,
      options
    };
    this.layers.push(layer);
    return this;
  }

  /**
   * Add vector field
   */
  vectorField(vectorFn: (state: State, params: Params) => { dx: number; dy: number }, options: VectorFieldOptions = {}): ViewBuilder {
    const layer = {
      type: 'vectorField' as const,
      selector: FunctionSerializer.serializeFunction(vectorFn),
      options
    };
    
    this.layers.push(layer);
    return this;
  }

  /**
   * Add nullcline
   */
  nullcline(variable: string, options: NullclineOptions = {}): ViewBuilder {
    const layer = {
      type: 'nullcline' as const,
      selector: variable,
      options
    };
    this.layers.push(layer);
    return this;
  }

  /**
   * Add Poincaré section
   */
  poincare(section: (state: State) => boolean, options: PoincareOptions = {}): ViewBuilder {
    const layer = {
      type: 'poincare' as const,
      selector: FunctionSerializer.serializeFunction(section),
      options
    };
    
    this.layers.push(layer);
    return this;
  }

  /**
   * Add default grid and axes
   */
  defaults(): ViewBuilder {
    return this.grid().axis();
  }

  /**
   * Get all layers
   */
  getLayers(): Layer[] {
    return [...this.layers];
  }

  /**
   * Get timeline
   */
  getTimeline(): Timeline | undefined {
    return this.timeline;
  }

  /**
   * Set timeline (for when timeline is provided later)
   */
  setTimeline(timeline: Timeline): void {
    this.timeline = timeline;
  }

  
  /**
   * Convert to ViewDescriptor for HTML rendering
   */
  toDescriptor(): {
    timeline: { times: number[]; states: Record<string, number[]> };
    layers: Layer[];
  } {
    return {
      timeline: {
        times: this.timeline?.times || [],
        states: this.timeline?.states || {}
      },
      layers: this.layers
    };
  }

  /**
   * Execute with timeline and return descriptor
   */
  executeWithTimeline(timeline: Timeline): {
    timeline: { times: number[]; states: Record<string, number[]> };
    layers: Layer[];
  } {
    const tempTimeline = this.timeline;
    this.timeline = timeline;
    const descriptor = this.toDescriptor();
    this.timeline = tempTimeline;
    return descriptor;
  }
}

/**
 * Creates a new ViewBuilder for constructing visualizations.
 * 
 * The ViewBuilder provides a fluent, chainable API for building
 * mathematical visualizations. It supports multiple plot types,
 * styling options, and layout configurations.
 * 
 * @param timeline - Optional timeline for immediate visualization (from simulate)
 * @returns New ViewBuilder instance
 * 
 * @example
 * ```javascript
 * // Create builder without timeline (for explore)
 * const builder = view();
 * 
 * // Create builder with timeline (for show)
 * const timeline = simulate(model, { timeRange: [0, 10] });
 * const builder = view(timeline);
 * ```
 */
export function view(timeline?: Timeline): ViewBuilder {
  return new ViewBuilder(timeline);
}
