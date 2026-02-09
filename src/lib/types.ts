import type { Control } from "./controls";
import type { Params, State, Events } from "../core/types";
import type { Layer } from "../visualization/plots/interfaces";

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

export interface ViewConfig {
  layers: Layer[];
  controls?: Record<string, unknown>;
}

export interface ViewDescriptor extends ViewConfig {
  timeline: {
    times: number[];
    states: Record<string, number[]>;
  };
  width?: number;
  height?: number;
}

export interface ShowDescriptor {
  type: 'show';
  views: {
    type: 'show';
    timeline: {
      times: number[];
      states: Record<string, number[]>;
    };
    layers: Layer[];
    controls?: Record<string, Control>;
    width?: number | string;
    height?: number | string;
  }[];
  width?: number | string;
  height?: number | string;
}

export interface ExploreDescriptor {
  type: 'explore';
  model: SerializedModel;
  params: SerializedParams; // Controls with their values
  initial: string;
  views: {
    view: string;
    viewDescriptor: {
      layers?: Layer[];
      controls?: Record<string, unknown>;
    };
  }[];
  options: {
    timeRange?: [number, number];
    timeStep?: number;
    width?: number | string;
    height?: number | string;
  };
}

export interface CompareDescriptor {
  type: 'compare';
  timeline: {
    times: number[];
    states: Record<string, number[]>;
  };
  layers: Layer[];
  labels: string[];
  width?: number | string;
  height?: number | string;
}

export type AnyDescriptor = ViewDescriptor | ExploreDescriptor | CompareDescriptor | ShowDescriptor;
