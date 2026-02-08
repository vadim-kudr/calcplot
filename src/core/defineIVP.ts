import type { Model, State, Params, Derivatives, Events, Event } from './types';

/**
 * Defines an Initial Value Problem (IVP) model for differential equations.
 * 
 * @param config - Model configuration with state, params, derivatives, and optional events
 * @returns Complete model object ready for simulation
 * 
 * @example
 * const oscillator = defineIVP({
 *   state: { x: 1, v: 0 },
 *   params: { omega: 1, damping: 0.1 },
 *   derivatives: {
 *     x: (s) => s.v,
 *     v: (s, p) => -p.omega**2 * s.x - p.damping * s.v
 *   }
 * });
 */
export function defineIVP(config: Model): Model {
  return config;
}
