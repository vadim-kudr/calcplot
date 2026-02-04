/**
 * Fluent API for simulation setup and execution
 */

import { Model, Params, SimulationOptions, State } from './ivp';
import { solve } from './solver';
import { Timeline } from './timeline';

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

    const { dt = 0.01, maxTime = 10 } = options;

    const { times, states } = solve(this.model, this.initialState, params, { dt, maxTime });
    return new Timeline(times, states);
  }
}

/**
 * Main simulation function
 */
export function simulate(model: Model): SimulationBuilder {
  return new SimulationBuilder(model);
}
