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
      .run({ dt: 0.1, maxTime: 5.0 });

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
      .run({ dt: 0.01, maxTime: 1.0 });

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
      .run({ dt: 0.1, maxTime: 1.0 });

    // Then: should use builder params, not model defaults
    expect(timeline.at(1.0).x).toBeCloseTo(3.0, 1);
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
      simulate(model).run({ dt: 0.1, maxTime: 1.0 });
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
      .run({ dt: 0.01, maxTime: 3.0 });

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
      .run({ dt: 0.01, maxTime: 3.0 });

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
    const timeline1 = builder.run({ dt: 0.1, maxTime: 1.0 });
    const timeline2 = builder.run({ dt: 0.1, maxTime: 2.0 });

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
    const emptyTimeline = simulate(emptyModel).initial({}).run({ dt: 0.1, maxTime: 1.0 });

    const zeroTimeline = simulate(zeroTimeModel).initial({ x: 1.0 }).run({ dt: 0.1, maxTime: 0 });

    // Then: should handle gracefully
    expect(emptyTimeline.at(0)).toEqual({});
    expect(zeroTimeline.at(0).x).toBe(1.0);
  });
});
