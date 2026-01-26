/**
 * Chainable API for building visualizations
 */

import { State, Timeline } from '../core/ivp';

export interface GridOptions {
  color?: string;
  alpha?: number;
  spacing?: number;
}

export interface PlotOptions {
  color?: string;
  lineWidth?: number;
  dash?: number[];
  label?: string;
}

export interface VectorOptions {
  color?: string;
  label?: string;
  scale?: number;
  width?: number;
}

export interface SceneFunction {
  (ctx: DrawContext, state: State): void;
}

export interface SelectorFunction {
  (state: State): number | [number, number];
}

export interface VectorFunction {
  (state: State): [number, number];
}

export interface DrawContext {
  line: (
    from: [number, number],
    to: [number, number],
    options?: { width?: number; color?: string; dash?: number[] }
  ) => void;
  circle: (
    center: [number, number],
    radius: number,
    options?: { fill?: string; stroke?: string; width?: number }
  ) => void;
  arrow: (
    from: [number, number],
    to: [number, number],
    options?: { width?: number; color?: string; headSize?: number }
  ) => void;
  text: (
    pos: [number, number],
    text: string,
    options?: { color?: string; size?: number; font?: string }
  ) => void;
  plot: (xValues: number[], yValues: number[], options?: PlotOptions) => void;
}

export interface Layer {
  type: 'grid' | 'scene' | 'plot' | 'vector' | 'bounds' | 'axis';
  options?: any;
  draw?: string; // serialized function
  selector?: string; // serialized function
  at?: string; // serialized function
  dir?: string; // serialized function
  bounds?: { x?: [number, number] | 'auto'; y?: [number, number] | 'auto' };
  parametric?: boolean; // true for [x, y] plots
}

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
   * Add plot layer
   */
  plot(selector: SelectorFunction, options: PlotOptions = {}): ViewBuilder {
    // Detect if selector is parametric (returns [x, y]) by testing it
    const isParametric = this.detectParametricSelector(selector);

    this.layers.push({
      type: 'plot',
      selector: this.serializeFunction(selector),
      parametric: isParametric,
      options: {
        color: '#2563eb',
        lineWidth: 2,
        fill: false,
        dash: [],
        label: '',
        alpha: 1,
        ...options
      }
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

  /**
   * Add grid layer
   */
  grid(options: any = {}): ViewBuilder {
    this.layers.push({
      type: 'grid',
      options: options
    });
    return this;
  }

  /**
   * Add axis layer
   */
  axis(options: any = {}): ViewBuilder {
    this.layers.push({
      type: 'axis',
      options: options
    });
    return this;
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
  private serializeFunction(fn: (...args: any[]) => any): string {
    return fn.toString();
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
 * Main view function - now timeline-agnostic
 */
export function view(timeline?: Timeline): ViewBuilder {
  return new ViewBuilder(timeline);
}
