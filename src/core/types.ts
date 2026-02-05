/**
 * Core types and interfaces for Initial Value Problems (IVP)
 */

export interface State {
  [key: string]: number;
}

export interface Params {
  [key: string]: number;
}

export interface Derivatives {
  [key: string]: (state: State, params: Params) => number;
}

export interface Event {
  when: (state: State) => number;
  then: (state: State, params: Params) => State | null; // null = remove event
  once?: boolean; // triggers only once
}

export interface Events {
  [key: string]: Event;
}

export interface Model {
  state: State;
  params: Params;
  derivatives: Derivatives;
  events?: Events;
}

export interface SimulationOptions {
  timeRange?: [number, number];
  timeStep?: number;
  tolerance?: number;
  params?: Params;
}

export interface Timeline {
  times: number[];
  states: Record<string, number[]>;
  at: (time: number) => State;
  serialize: () => string;
}