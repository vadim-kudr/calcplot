import type { Control } from "./controls";
import type { Params } from "../core/types";

export interface SerializedParams {
  [key: string]: Control;
}

export interface SerializedModel {
  state: Record<string, number>;
  params: Record<string, number>;
  derivatives: Record<string, string>;
  events?: Record<string, string>;
}

export interface SerializedTimeline {
  times: number[];
  states: Record<string, number[]>;
}

// Descriptor types
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
  model: {
    params?: Params; // Default model parameters
    derivatives?: Record<string, string>; // Serialized derivatives
    events?: any; // Events
    [key: string]: any;
  };
  params: SerializedParams; // Controls with their values
  initial: string;
  views: {
    view: string;
    viewDescriptor: {
      layers?: any[];
      [key: string]: any;
    };
  }[];
  options: {
    timeRange?: [number, number];
    timeStep?: number;
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
  };
  layers: any[];
  labels: string[];
  width?: number | string;
  height?: number | string;
}

export type AnyDescriptor = ViewDescriptor | ExploreDescriptor | CompareDescriptor | ShowDescriptor;
