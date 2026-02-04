/**
 * Fluent API for simulation setup and execution
 */

import { Model, Params, SimulationOptions, State } from './ivp';
import { solve } from './solver';
import { Timeline } from './timeline';

export interface SimulateConfig {
  timeRange: [number, number];
  timeStep?: number;
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
   */
  initial(state: State): SimulationBuilder {
    this.initialState = state;
    return this;
  }

  /**
   * Set parameters for simulation
   */
  params(params: Params): SimulationBuilder {
    this.modelParams = params;
    return this;
  }

  /**
   * Run simulation with given options
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
 * Simulation function with overloads
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
    const { times, states } = solve(model, model.state, model.params, config);
    
    return new Timeline(times, states);
  } else {
    // Fluent simulate: simulate(model) -> builder
    return new SimulationBuilder(model);
  }
}

// Export the function
export { simulate };
