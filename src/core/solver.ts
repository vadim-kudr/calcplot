/**
 * Enhanced RK4 solver with advanced event detection and lifecycle management
 */

import { Event, Model, Params, SimulationOptions, State } from './ivp';

const EPSILON = 1e-9;
const MAX_BISECTION_ITER = 40;

/**
 * Main simulation loop with hybrid system support (events)
 */
export function solve(
  model: Model,
  initialState: State,
  params: Params,
  options: SimulationOptions
) {
  const { dt = 0.01, maxTime = 10 } = options;
  const times: number[] = [0];
  const states: Record<string, number[]> = Object.fromEntries(
    Object.keys(initialState).map(k => [k, [initialState[k]]])
  );

  let currentState = { ...initialState };
  let currentTime = 0;
  
  // Event management
  const activeEvents = new Set(Object.keys(model.events || {}));
  const lastEventTimes = new Map<string, number>();

  while (currentTime < maxTime) {
    // Don't exceed maxTime boundaries
    const stepDt = Math.min(dt, maxTime - currentTime);
    
    // 1. Trial RK4 step
    const nextState = rk4Step(model, currentState, params, stepDt);

    // 2. Find earliest event in this interval
    const eventResult = findFirstEvent(
      model, currentState, nextState, params, 
      currentTime, stepDt, activeEvents, lastEventTimes
    );

    if (eventResult.triggered) {
      const { name, alpha, eventState } = eventResult;
      const eventTime = currentTime + alpha * stepDt;

      // Save state BEFORE event (at touch point)
      pushState(states, times, eventTime, eventState);

      // Apply event logic (bounce, switch, etc.)
      const event = model.events![name];
      const newState = event.then(eventState, params);

      // Event lifecycle management
      if (newState === null || event.once) {
        activeEvents.delete(name);
      }

      currentState = newState ?? eventState;
      currentTime = eventTime;
      lastEventTimes.set(name, eventTime);

      // Save state AFTER event (with new velocity vector)
      // But only if event didn't return null
      if (newState !== null) {
        pushState(states, times, eventTime, currentState);
      }
      
      // Important: we don't do currentTime += stepDt,
      // to finish remaining time on next iteration.
    } else {
      // No events, accept full step
      currentTime += stepDt;
      currentState = nextState;
      pushState(states, times, currentTime, currentState);
    }
  }

  return { times, states };
}

/**
 * Find first triggered event using bisection
 */
function findFirstEvent(
  model: Model, s1: State, s2: State, params: Params,
  t: number, dt: number, active: Set<string>, lastTimes: Map<string, number>
): { triggered: false } | { triggered: true; name: string; alpha: number; eventState: State } {
  let firstEvent: { name: string; alpha: number; eventState: State } | null = null;

  for (const name of active) {
    const event = model.events![name];
    const v1 = event.when(s1);
    const v2 = event.when(s2);

    if (v1 * v2 < 0) {
      // Cooldown check
      if (t - (lastTimes.get(name) ?? -Infinity) < EPSILON) continue;

      const alpha = bisection(event, s1, s2);
      if (!firstEvent || alpha < firstEvent.alpha) {
        firstEvent = { name, alpha, eventState: interpolate(s1, s2, alpha) };
      }
    }
  }

  return firstEvent ? { triggered: true, ...firstEvent } : { triggered: false };
}

/**
 * Runge-Kutta 4th order integration step (functional style)
 */
export function rk4Step(model: Model, s: State, p: Params, dt: number): State {
  const getD = (st: State) => Object.fromEntries(
    Object.entries(model.derivatives).map(([k, fn]) => [k, fn(st, p)])
  );
  
  const add = (st: State, d: State, m: number) => Object.fromEntries(
    Object.keys(st).map(k => [k, st[k] + (d[k] || 0) * m])
  );

  const k1 = getD(s);
  const k2 = getD(add(s, k1, 0.5 * dt));
  const k3 = getD(add(s, k2, 0.5 * dt));
  const k4 = getD(add(s, k3, dt));

  return Object.fromEntries(Object.keys(s).map(k => [
    k, s[k] + (dt / 6) * ((k1[k]||0) + 2*(k2[k]||0) + 2*(k3[k]||0) + (k4[k]||0))
  ]));
}

/**
 * Bisection: find root of f(t) = 0 on interval [0, 1]
 */
function bisection(event: Event, s1: State, s2: State): number {
  let low = 0, high = 1;
  for (let i = 0; i < MAX_BISECTION_ITER; i++) {
    const mid = (low + high) / 2;
    if (event.when(s1) * event.when(interpolate(s1, s2, mid)) < 0) high = mid;
    else low = mid;
  }
  return high;
}

/**
 * Linear state interpolation (Functional style)
 */
const interpolate = (s1: State, s2: State, a: number): State =>
  Object.fromEntries(Object.keys(s1).map(k => [k, s1[k] + a * (s2[k] - s1[k])]));

/**
 * Add state to timeline
 */
function pushState(states: Record<string, number[]>, times: number[], t: number, s: State) {
  times.push(t);
  for (const k in s) states[k].push(s[k]);
}
