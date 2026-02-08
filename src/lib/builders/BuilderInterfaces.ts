/**
 * Shared interfaces for CalcPlot builders
 */

import { State, Params } from '../../core/types';

export interface GridOptions {
  showGrid?: boolean;
  gridColor?: string;
  gridOpacity?: number;
  gridWidth?: number;
  color?: string;
  alpha?: number;
  spacing?: number;
}

export interface PlotOptions {
  color?: string;
  lineWidth?: number;
  dash?: number[];
  label?: string;
  alpha?: number;
}

export interface AxisOptions {
  showTicks?: boolean;
  showLabels?: boolean;
  showSpine?: boolean;
  tickSize?: number;
  tickPadding?: number;
  labelPadding?: number;
  fontSize?: number;
  fontColor?: string;
  tickColor?: string;
  labelColor?: string;
  axisColor?: string;
  axisWidth?: number;
  xLabel?: string;
  yLabel?: string;
  aspectRatio?: number;
}

export interface FillOptions {
  color?: string;
  alpha?: number;
}

export interface RefLineOptions {
  orientation?: 'horizontal' | 'vertical';
  value?: number;
  color?: string;
  linestyle?: 'solid' | 'dashed' | 'dotted';
  linewidth?: number;
  label?: string;
  labelPosition?: 'left' | 'right' | 'top' | 'bottom' | 'auto';
  labelOffset?: number;
}

export interface LegendOptions {
  loc?: 'upper right' | 'upper left' | 'lower right' | 'lower left' | 'center';
  frame?: boolean;
  alpha?: number;
}

export interface VectorFieldOptions {
  gridSize?: number;
  color?: string;
  alpha?: number;
  normalize?: boolean;
  scale?: number;
}

export interface PoincareOptions {
  section: (state: State) => boolean;    // Section condition
  direction?: 'positive' | 'negative' | 'both';  // Crossing direction
  marker?: string;                    // Marker style ('circle' | 'cross')
  color?: string;                      // Color
  size?: number;                       // Marker size
}

export interface NullclineOptions {
  color?: string;
  linestyle?: 'solid' | 'dashed' | 'dotted';
  linewidth?: number;
  label?: string;
}

export interface TitleOptions {
  text?: string;
  color?: string;
  size?: number;
  font?: string;
  position?: 'top' | 'bottom' | 'center';
}

export interface VectorOptions {
  color?: string;
  label?: string;
  scale?: number;
  width?: number;
}

export type LayerOptions = 
  | GridOptions 
  | PlotOptions 
  | AxisOptions 
  | FillOptions 
  | RefLineOptions 
  | LegendOptions 
  | VectorFieldOptions 
  | NullclineOptions 
  | PoincareOptions 
  | VectorOptions 
  | TitleOptions 
  | Record<string, unknown>;

export interface SceneFunction {
  (ctx: DrawContext, state: State): void;
}

export interface SelectorFunction {
  (state: State): number | [number, number];
  (state: State, params: Params): number | [number, number];
}

export interface VectorFunction {
  (state: State): [number, number];
  (state: State, params: Params): [number, number];
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
  type: 'grid' | 'scene' | 'plot' | 'vector' | 'bounds' | 'axis' | 'fill' | 'refline' | 'title' | 'legend' | 'vectorField' | 'nullcline' | 'poincare';
  options?: LayerOptions;
  draw?: string; // serialized function
  selector?: string; // serialized function
  at?: string; // serialized function
  dir?: string; // serialized function
  bounds?: { x?: [number, number] | 'auto'; y?: [number, number] | 'auto' };
  parametric?: boolean; // true for [x, y] plots
}
