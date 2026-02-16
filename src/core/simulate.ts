/**
 * Fluent API for simulation setup and execution
 */

import { solve } from './solver';
import type { Model, Params, SimulationOptions, State } from './types';
import { Timeline } from './timeline';

export interface SimulateConfig {
  /** Time range for simulation [start, end] */
  timeRange: [number, number];
  /** Time step for numerical integration (default: 0.01) */
  timeStep?: number;
  /** Parameter values to override model defaults */
  params?: Params;
}

export class SimulationBuilder {
  private model: Model;
  private initialState?: State;
  private modelParams?: Params;

  constructor(model: Model) {
    this.model = model;
  }

  /**
   * Set initial state for simulation
   * @param state - Initial values for state variables
   * @returns This builder for chaining
   */
  initial(state: State): SimulationBuilder {
    this.initialState = state;
    return this;
  }

  /**
   * Set parameters for simulation
   * @param params - Parameter values to override model defaults
   * @returns This builder for chaining
   */
  params(params: Params): SimulationBuilder {
    this.modelParams = params;
    return this;
  }

  /**
   * Run simulation with given options
   * @param options - Simulation options including timeRange and timeStep
   * @returns Timeline containing simulation results
   * @throws Error if initial state is not set
   */
  run(options: SimulationOptions = {}): Timeline {
    if (!this.initialState) {
      throw new Error('Initial state must be set before running simulation');
    }

    const params = options.params || this.modelParams || this.model.params || {};

    const { timeRange = [0, 10], timeStep = 0.01 } = options;

    const { times, states } = solve(this.model, this.initialState, params, options);
    return new Timeline(times, states);
  }
}

/**
 * Simulates a differential equation model using numerical integration.
 * 
 * @overload
 * @param model - Model to simulate
 * @param config - Simulation configuration
 * @returns Timeline with results
 * 
 * @overload
 * @param model - Model to simulate
 * @returns SimulationBuilder for fluent API
 * 
 * @example
 * const timeline = simulate(model)
 *   .initial({ x: 1, v: 0 })
 *   .params({ omega: 2, damping: 0.1 })
 *   .run({ timeRange: [0, 20] });
 */

// Overload 1: Simple simulate(model, config)
function simulate(model: Model, config: SimulateConfig): Timeline;

// Overload 2: Fluent simulate(model) -> builder
// eslint-disable-next-line no-redeclare
function simulate(model: Model): SimulationBuilder;

// Implementation
// eslint-disable-next-line no-redeclare
function simulate(model: Model, config?: SimulateConfig): Timeline | SimulationBuilder {
  if (config) {    
    const params = { ...model.params, ...config.params };
    const { times, states } = solve(model, model.state, params, config);
    
    return new Timeline(times, states);
  } else {
    // Fluent simulate: simulate(model) -> builder
    return new SimulationBuilder(model);
  }
}

// Export the function
export { simulate };
