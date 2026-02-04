/**
 * Client-side simulation engine for interactive explore mode
 * Uses core simulation logic but adapted for client-side
 */

import { FunctionSerializer } from '../serialization';

export interface SimulationData {
  model: any;
  params: any;
  derivatives: Record<string, string>;
  options: any;
}

export class SimulationEngine {
  private log: (...args: any[]) => void;

  constructor(log: (...args: any[]) => void) {
    this.log = log;
  }

  simulateTrajectory(data: SimulationData, initialState: any, params: any): any {
    // Validate initialState and merge model params with explore params
    if (!initialState || typeof initialState !== 'object') {
      throw new Error(
        `Invalid initialState: expected object, got ${typeof initialState}. Value: ${initialState}`
      );
    }

    // Merge model params with explore params for complete parameter set
    const modelParams = data.model?.params || {};
    const exploreParams = params || {};
    const allParams = { ...modelParams, ...exploreParams };

    const { dt = 0.01, maxTime = 10 } = data.options || {};
    const times = [];
    const states: Record<string, number[]> = {};

    // Initialize states object with all state variables
    Object.keys(initialState).forEach((key) => {
      states[key] = [];
    });

    let state = { ...initialState };
    let t = 0;

    // Parse derivative functions from model
    const derivatives = data.model?.derivatives || data.derivatives;
    if (!derivatives) {
      throw new Error('No derivatives found in data.model.derivatives or data.derivatives');
    }

    const derivativeFns: Record<string, (s: any, p: any) => any> = {};
    Object.entries(derivatives).forEach(([key, fn]) => {
      derivativeFns[key] = FunctionSerializer.parseAndCreateFunction(['s', 'p'], fn as string);
    });

    // Parse event functions from model
    const events = data.model?.events;
    let eventFns: Record<string, any> = {};
    if (events) {
      // Events are already deserialized, use them directly
      eventFns = events;
    }

    while (t <= maxTime) {
      // Check events before storing state
      let shouldStop = false;
      if (events && Object.keys(eventFns).length > 0) {
        for (const [name, event] of Object.entries(eventFns)) {
          const whenValue = event.when(state);
          if (whenValue < 0) {
            const newState = event.then(state, allParams);
            if (newState === null || event.once) {
              shouldStop = true;
              break;
            }
            if (newState !== null) {
              state = newState;
            }
          }
        }
      }

      if (shouldStop) break;

      times.push(t);

      // Store current state
      Object.keys(state).forEach((key) => {
        states[key].push(state[key]);
      });

      // Calculate derivatives
      const derivatives2: Record<string, number> = {};
      Object.entries(derivativeFns).forEach(([key, fn]) => {
        derivatives2[key] = fn(state, allParams);
      });

      // Update state
      Object.keys(state).forEach((key) => {
        if (derivatives2[key] !== undefined) {
          state[key] += derivatives2[key] * dt;
        }
      });

      t += dt;
    }

    return { times, states };
  }

  parseInitialFunction(initial: string): (p: any) => any {
    try {
      const fn = FunctionSerializer.parseAndCreateFunction(['p'], initial);
      return fn;
    } catch (error) {
      console.error('parseInitialFunction error:', error);
      throw error;
    }
  }
}
