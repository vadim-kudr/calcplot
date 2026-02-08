/**
 * Chainable API for building visualizations
 */

import { State, Params, Timeline } from '../../core/types';
import { PlotOptions, AxisOptions, GridOptions, FillOptions, RefLineOptions, LegendOptions, VectorFieldOptions, PoincareOptions, NullclineOptions, VectorOptions, SceneFunction, VectorFunction, DrawContext, Layer, SelectorFunction, parsePlotArgs, parseAxisArgs } from './BuilderUtils';

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
    this.layers.push({
      type: 'scene',
      draw: this.serializeFunction(drawFn)
    });
    return this;
  }

  /**
   * Add vector layer
   */
  vector(at: VectorFunction, dir: VectorFunction, options: VectorOptions = {}): ViewBuilder {
    this.layers.push({
      type: 'vector',
      at: this.serializeFunction(at),
      dir: this.serializeFunction(dir),
      options: {
        color: '#0ff',
        scale: 1,
        width: 2,
        ...options
      }
    });
    return this;
  }

  /**
   * Set bounds for coordinate system
   */
  bounds(bounds: { x?: [number, number] | 'auto'; y?: [number, number] | 'auto' }): ViewBuilder {
    this.layers.push({
      type: 'bounds',
      bounds: bounds
    });
    return this;
  }

  grid(options: GridOptions = {}): ViewBuilder {
    this.layers.push({
      type: 'grid',
      options: options
    });
    return this;
  }

  /**
   * Add axis layer with flexible signature support
   */
  axis(arg1?: string | number | AxisOptions, arg2?: string, arg3?: number): ViewBuilder {
    const { options } = parseAxisArgs(arg1, arg2, arg3);
    this.layers.push({
      type: 'axis',
      options: options
    });
    return this;
  }

  /**
   * Add plot layer with flexible signature support
   */
  plot(selector: SelectorFunction, arg2?: string | PlotOptions, arg3?: string): ViewBuilder {
    const { selector: parsedSelector, options } = parsePlotArgs(selector, arg2, arg3);
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

    const isParametric = this.detectParametricSelector(parsedSelector);
    const plotIndex = this.layers.filter(l => l.type === 'plot').length;

    this.layers.push({
      type: 'plot',
      selector: this.serializeFunction(parsedSelector),
      parametric: isParametric,
      options: {
        color: options.color || calcplotColors[plotIndex % calcplotColors.length],
        lineWidth: 1.5,
        opacity: 1,
        dash: [],
        label: '',
        ...options
      }
    });
    return this;
  }

  /**
   * Add phase portrait layer (alias for parametric plot)
   */
  phase(selector: (state: State) => [number, number], options: PlotOptions = {}): ViewBuilder {
    return this.plot(selector, {
      color: '#d62728', // red for phase portraits
      lineWidth: 2,
      ...options
    });
  }

  /**
   * Fill region where condition is true
   */
  fill(predicate: (state: State) => boolean, options: FillOptions = {}): ViewBuilder {
    this.layers.push({
      type: 'fill',
      selector: this.serializeFunction(predicate),
      options: {
        color: options.color || 'blue',
        alpha: options.alpha || 0.2
      }
    });
    return this;
  }

  /**
   * Add horizontal reference line
   */
  axhline(y: number, options: RefLineOptions = {}): ViewBuilder {
    this.layers.push({
      type: 'refline',
      options: {
        orientation: 'horizontal',
        value: y,
        color: options.color || 'gray',
        linestyle: options.linestyle || 'solid',
        linewidth: options.linewidth || 1,
        label: options.label || '',
        labelPosition: options.labelPosition || 'auto',
        labelOffset: options.labelOffset || 8
      }
    });
    return this;
  }

  /**
   * Add vertical reference line
   */
  axvline(x: number, options: RefLineOptions = {}): ViewBuilder {
    this.layers.push({
      type: 'refline',
      options: {
        orientation: 'vertical',
        value: x,
        color: options.color || 'gray',
        linestyle: options.linestyle || 'solid',
        linewidth: options.linewidth || 1,
        label: options.label || '',
        labelPosition: options.labelPosition || 'auto',
        labelOffset: options.labelOffset || 8
      }
    });
    return this;
  }

  /**
   * Set plot title
   */
  title(text: string): ViewBuilder {
    this.layers.push({
      type: 'title',
      options: { text }
    });
    return this;
  }

  /**
   * Add legend
   */
  legend(options: LegendOptions = {}): ViewBuilder {
    this.layers.push({
      type: 'legend',
      options: {
        loc: options.loc || 'upper right',
        frame: options.frame !== false,
        alpha: options.alpha || 1
      }
    });
    return this;
  }

  /**
   * Add vector field
   */
  vectorField(vectorFn: (state: State, params: Params) => { dx: number; dy: number }, options: VectorFieldOptions = {}): ViewBuilder {
    this.layers.push({
      type: 'vectorField',
      selector: this.serializeFunction(vectorFn),
      options: {
        gridSize: options.gridSize || 20,
        color: options.color || 'gray',
        alpha: options.alpha || 0.6,
        normalize: options.normalize !== false,
        scale: options.scale || 1
      }
    });
    return this;
  }

  /**
   * Add nullcline
   */
  nullcline(variable: string, options: NullclineOptions = {}): ViewBuilder {
    this.layers.push({
      type: 'nullcline',
      options: {
        variable,
        color: options.color || 'blue',
        linestyle: options.linestyle || 'dashed',
        linewidth: options.linewidth || 1,
        label: options.label || ''
      }
    });
    return this;
  }

  /**
   * Add Poincaré section
   */
  poincare(section: (state: State) => boolean, options: PoincareOptions = { section: () => false }): ViewBuilder {
    this.layers.push({
      type: 'poincare',
      selector: this.serializeFunction(section),
      options: {
        section: section, // Keep original function for reference
        direction: options.direction || 'positive',
        marker: options.marker || 'circle',
        color: options.color || 'red',
        size: options.size || 4
      }
    });
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
   * Serialize function or selector for HTML embedding
   */
  private serializeFunction(fn: SceneFunction | VectorFunction | SelectorFunction | ((state: State) => boolean) | ((state: State, params: Params) => { dx: number; dy: number })): string {
    return fn ? fn.toString() : 'undefined';
  }

  /**
   * Detect if selector function is parametric (returns [x, y])
   */
  private detectParametricSelector(selector: SelectorFunction): boolean {
    try {
      // Test with sample state to see if function returns array (parametric) or number (scalar)
      const testState = { x: 1, y: 2, z: 3 };
      const result = selector(testState);
      return Array.isArray(result) && result.length === 2;
    } catch {
      // If we can't determine, assume non-parametric
      return false;
    }
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
