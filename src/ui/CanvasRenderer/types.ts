export interface Bounds {
  x: [number, number];
  y: [number, number];
}

export interface PlotArea {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface CommonDisplayOptions {
  showGrid?: boolean;
  showTicks?: boolean;
  showLabels?: boolean;
  gridColor?: string;
  includeZeroInGrid?: boolean; // Add option to include zero line in grid
}

export interface PlotOptions extends CommonDisplayOptions {
  title?: string;
  xLabel?: string;
  yLabel?: string;
  lineColor?: string;
  lineWidth?: number;
  marker?: 'circle' | 'square' | 'none';
  autoScale?: boolean;
  aspectRatio?: 'equal' | 'auto';
  smooth?: boolean;
  showSpines?: boolean;
  legend?: {
    items: Array<{ label: string; color: string; lineStyle?: { width?: number; dash?: number[] } }>;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  };
}

export interface VectorOptions {
  scale?: number | 'auto';
  color?: string | string[];
  headSize?: number;
  width?: number | number[];
  arrowstyle?: '->' | '-|>' | 'simple' | 'fancy';
  pivot?: 'tip' | 'tail' | 'middle';
  alpha?: number; // transparency 0-1
}

export interface AxisOptions extends CommonDisplayOptions {
  showSpines?: boolean;
  xLabel?: string;
  yLabel?: string;
}

export interface TickSet {
  values: number[];
  labels: string[];
  step: number;
}

export interface LineOptions {
  color?: string;
  width?: number;
  dash?: number[];
}

export interface CircleOptions {
  fill?: string;
  stroke?: string;
  width?: number;
}

export interface ArrowOptions {
  color?: string;
  width?: number;
  headSize?: number;
}

export interface TextOptions {
  color?: string;
  size?: number;
  font?: string;
}

export interface DrawContext {
  plot: (xValues: number[], yValues: number[], options?: Partial<PlotOptions>) => void;
  line: (from: [number, number], to: [number, number], options?: Partial<LineOptions>) => void;
  circle: (center: [number, number], radius: number, options?: Partial<CircleOptions>) => void;
  arrow: (from: [number, number], to: [number, number], options?: Partial<ArrowOptions>) => void;
  text: (pos: [number, number], text: string, options?: Partial<TextOptions>) => void;
}
