/**
 * Unit tests for core/simulate.ts
 * Documentation-style tests for SimulationBuilder fluent API
 */

import { describe, test, expect } from 'vitest';
import { simulate } from '../../src/core/simulate';
import { defineIVP } from '../../src/core/ivp';

describe('SimulationBuilder - Fluent API Documentation', () => {
  test('basic simulation workflow', () => {
    // Given: simple exponential growth model
    const model = defineIVP({
      state: { population: 100.0 },
      params: { growthRate: 0.1 },
      derivatives: {
        population: (state, params) => params.growthRate * state.population
      }
    });

    // When: setting up and running simulation
    const timeline = simulate(model)
      .initial({ population: 100.0 })
      .params({ growthRate: 0.2 })
      .run({ timeRange: [0, 5.0], timeStep: 0.1 });

    // Then: should produce expected growth
    expect(timeline.at(0).population).toBe(100.0);
    expect(timeline.at(5.0).population).toBeCloseTo(272.0, 0);
  });

  test('method chaining works fluently', () => {
    // Given: harmonic oscillator model
    const model = defineIVP({
      state: { x: 1.0, v: 0.0 },
      params: { omega: 1.0 },
      derivatives: {
        x: (state) => state.v,
        v: (state, params) => -params.omega * state.x
      }
    });

    // When: chaining all methods
    const timeline = simulate(model)
      .initial({ x: 1.0, v: 0.0 })
      .params({ omega: 2.0 })
      .run({ timeRange: [0, 1.0], timeStep: 0.01 });

    // Then: should complete oscillation
    expect(timeline.at(0).x).toBe(1.0);
    expect(timeline.at(0).v).toBe(0.0);
    expect(typeof timeline.at(1.0).x).toBe('number');
  });

  test('parameter handling priority', () => {
    // Given: model with default parameters
    const model = defineIVP({
      state: { x: 0.0 },
      params: { k: 1.0 },
      derivatives: {
        x: (state, params) => params.k
      }
    });

    // When: using builder params (should override model defaults)
    const timeline = simulate(model)
      .initial({ x: 0.0 })
      .params({ k: 3.0 })
      .run({ timeRange: [0, 1.0], timeStep: 0.1 });

    // Then: should use builder params, not model defaults
    expect(timeline.at(1.0).x).toBeCloseTo(3.0, 1);
  });

  test('non-zero start time works correctly', () => {
    // Given: model with initial state at time 5
    const model = defineIVP({
      state: { x: 5 },
      params: { velocity: 2 },
      derivatives: {
        x: (state, params) => params.velocity
      }
    });

    // When: running simulation from time 5 to 10
    const timeline = simulate(model)
      .initial({ x: 5 })
      .params({ velocity: 2 })
      .run({ timeRange: [5, 10], timeStep: 0.5 });

    // Then: should handle non-zero start time correctly
    expect(timeline.at(5).x).toBe(5);
    expect(timeline.at(10).x).toBeCloseTo(15, 1); // x = 5 + 2*(10-5) = 15
    expect(timeline.times[0]).toBe(5);
    expect(timeline.times[timeline.times.length - 1]).toBeCloseTo(10, 0);
  });

  test('error handling for missing initial state', () => {
    // Given: any model
    const model = defineIVP({
      state: { x: 0.0 },
      params: {},
      derivatives: { x: () => 1.0 }
    });

    // When/Then: should throw if initial state not set
    expect(() => {
      simulate(model).run({ timeRange: [0, 1.0], timeStep: 0.1 });
    }).toThrow('Initial state must be set before running simulation');
  });

  test('complex multi-variable physics', () => {
    // Given: 2D projectile motion with gravity
    const model = defineIVP({
      state: { x: 0.0, y: 0.0, vx: 20.0, vy: 30.0 },
      params: { g: 9.81 },
      derivatives: {
        x: (state) => state.vx,
        y: (state) => state.vy,
        vx: () => 0,
        vy: (state, params) => -params.g
      }
    });

    // When: simulating projectile motion
    const timeline = simulate(model)
      .initial({ x: 0.0, y: 0.0, vx: 20.0, vy: 30.0 })
      .params({ g: 9.81 })
      .run({ timeRange: [0, 3.0], timeStep: 0.01 });

    // Then: should follow calculation correctly
    const state = timeline.at(1.0);
    expect(state.x).toBeCloseTo(20.0, 1);
    expect(state.y).toBeCloseTo(25.095, 1);
    expect(state.vx).toBe(20.0);
  });

  test('event-driven simulations', () => {
    // Given: bouncing ball with ground collision
    const model = defineIVP({
      state: { y: 10.0, vy: 0.0 },
      params: { g: 9.81 },
      derivatives: {
        y: (state) => state.vy,
        vy: (state, params) => -params.g
      },
      events: {
        ground: {
          when: (state) => state.y,
          then: (state) => ({ ...state, vy: -state.vy * 0.8 })
        }
      }
    });

    // When: simulating with events
    const timeline = simulate(model)
      .initial({ y: 10.0, vy: 0.0 })
      .params({ g: 9.81 })
      .run({ timeRange: [0, 3.0], timeStep: 0.01 });

    // Then: should handle events
    expect(typeof timeline.at(3.0).vy).toBe('number');
  });
});

describe('Advanced Usage Patterns', () => {
  test('multiple simulations with same configuration', () => {
    // Given: configured builder
    const model = defineIVP({
      state: { x: 0.0 },
      params: { k: 2.0 },
      derivatives: {
        x: (state, params) => params.k
      }
    });

    const builder = simulate(model).initial({ x: 0.0 }).params({ k: 2.0 });

    // When: running multiple simulations
    const timeline1 = builder.run({ timeRange: [0, 1.0], timeStep: 0.1 });
    const timeline2 = builder.run({ timeRange: [0, 2.0], timeStep: 0.1 });

    // Then: should reuse configuration
    expect(timeline1.at(1.0).x).toBeCloseTo(2.0, 1);
    expect(timeline2.at(2.0).x).toBeCloseTo(4.0, 1);
  });

  test('edge cases: empty state and zero time', () => {
    // Given: edge case models
    const emptyModel = defineIVP({
      state: {},
      params: {},
      derivatives: {}
    });

    const zeroTimeModel = defineIVP({
      state: { x: 1.0 },
      params: {},
      derivatives: { x: () => 1.0 }
    });

    // When: running edge cases
    const emptyTimeline = simulate(emptyModel).initial({}).run({ timeRange: [0, 1.0], timeStep: 0.1 });

    const zeroTimeline = simulate(zeroTimeModel).initial({ x: 1.0 }).run({ timeRange: [0, 0], timeStep: 0.1 });

    // Then: should handle gracefully
    expect(emptyTimeline.at(0)).toEqual({});
    expect(zeroTimeline.at(0).x).toBe(1.0);
  });
});
