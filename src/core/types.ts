/**
 * Shared types between server and client
 * CalcPlot visualization descriptors
 */

export interface ViewDescriptor {
  timeline: {
    times: number[];
    states: Record<string, number[]>;
  };
  layers: any[];
  controls?: any;
  width?: number;
  height?: number;
}

export interface ExploreDescriptor {
  type: 'explore';
  model: any;
  params: any;
  initial: string;
  views: {
    view: string;
    viewDescriptor: any;
  }[];
  options: {
    dt: number;
    maxTime: number;
    width: number | string;
    height: number | string;
  };
}

export interface ShowDescriptor {
  type: 'show';
  views: {
    type: 'show';
    timeline: {
      times: number[];
      states: Record<string, number[]>;
    };
    layers: any;
    controls?: any;
    width?: number | string;
    height?: number | string;
  }[];
  layout?: {
    columns?: number;
    rows?: number;
    gaps?: number;
  };
  width?: number | string;
  height?: number | string;
}

export interface CompareDescriptor {
  type: 'compare';
  timeline: {
    times: number[];
    states: Record<string, number[]>;
    labels: string[];
  };
  layers: any[];
  labels: string[];
  width?: number | string;
  height?: number | string;
}

export type AnyDescriptor =
  | ViewDescriptor
  | ExploreDescriptor
  | CompareDescriptor
  | ShowDescriptor;
