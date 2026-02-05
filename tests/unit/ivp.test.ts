/**
 * Unit tests for core/defineIVP.ts
 * Documentation-style tests for type definitions and defineIVP function
 */

import { describe, test, expect } from 'vitest';
import { defineIVP } from '../../src/core/defineIVP';

describe('defineIVP Function - Usage Examples', () => {
  test('complete mathematical model with events', () => {
    // Given: damped harmonic oscillator with boundaries
    const model = defineIVP({
      state: { x: 1.0, v: 0.0 },
      params: { k: 2.0, damping: 0.1 },
      derivatives: {
        x: (state, params) => state.v,
        v: (state, params) => -params.k * state.x - params.damping * state.v
      },
      events: {
        boundary: {
          when: (state) => Math.abs(state.x) - 5,
          then: (state) => ({ ...state, v: -state.v * 0.8 })
        }
      }
    });

    // Then: should preserve all components
    expect(model.state.x).toBe(1.0);
    expect(model.params.k).toBe(2.0);
    expect(typeof model.derivatives.x).toBe('function');
    expect(typeof model.events?.boundary.when).toBe('function');
  });

  test('minimal model without events', () => {
    // Given: simple exponential growth
    const model = defineIVP({
      state: { population: 100.0 },
      params: { growthRate: 0.05 },
      derivatives: {
        population: (state, params) => params.growthRate * state.population
      }
    });

    // Then: should work without events
    expect(model.state.population).toBe(100.0);
    expect(model.params.growthRate).toBe(0.05);
    expect(model.events).toBeUndefined();
  });

  test('function reference preservation', () => {
    // Given: reusable functions
    const positionDerivative = (state: any) => state.velocity;
    const velocityDerivative = (state: any, params: any) => -params.k * state.position;

    const model = defineIVP({
      state: { position: 1.0, velocity: 0.0 },
      params: { k: 1.0 },
      derivatives: {
        position: positionDerivative,
        velocity: velocityDerivative
      }
    });

    // Then: should preserve function references
    expect(model.derivatives.position).toBe(positionDerivative);
    expect(model.derivatives.velocity).toBe(velocityDerivative);
  });

  test('derivative evaluation with state and params', () => {
    // Given: coupled system
    const model = defineIVP({
      state: { x: 2.0, y: 3.0 },
      params: { factor: 5.0 },
      derivatives: {
        x: (state, params) => state.y * params.factor,
        y: (state, params) => -state.x * params.factor
      }
    });

    // When: evaluating derivatives
    const dx = model.derivatives.x(model.state, model.params);
    const dy = model.derivatives.y(model.state, model.params);

    // Then: should use both state and params correctly
    expect(dx).toBe(15.0); // y * factor
    expect(dy).toBe(-10.0); // -x * factor
  });
});

describe('Type System - Interface Examples', () => {
  test('event-driven state changes', () => {
    // Given: collision event
    const event = {
      when: (state: any) => state.y - 0, // Ground level
      then: (state: any, params: any) => ({
        ...state,
        vy: -state.vy * params.restitution
      })
    };

    // When: event triggers
    const triggerValue = event.when({ y: -0.5, vy: -10.0 });
    const newState = event.then({ y: 0, vy: -10.0 }, { restitution: 0.8 });

    // Then: should work correctly
    expect(triggerValue).toBe(-0.5);
    expect(newState.vy).toBe(8.0); // Bounce up with energy loss
  });

  test('complex multi-variable model', () => {
    // Given: 2D orbital mechanics
    const model = {
      state: { x: 1.0, y: 0.0, vx: 0.0, vy: 1.0 },
      params: { G: 1.0, M: 1.0 },
      derivatives: {
        x: (state: any) => state.vx,
        y: (state: any) => state.vy,
        vx: (state: any, params: any) => {
          const r = Math.sqrt(state.x ** 2 + state.y ** 2);
          return (-params.G * params.M * state.x) / r ** 3;
        },
        vy: (state: any, params: any) => {
          const r = Math.sqrt(state.x ** 2 + state.y ** 2);
          return (-params.G * params.M * state.y) / r ** 3;
        }
      }
    };

    // Then: should satisfy type requirements
    expect(model.state).toBeDefined();
    expect(model.params).toBeDefined();
    expect(model.derivatives).toBeDefined();
  });
});

describe('Edge Cases and Robustness', () => {
  test('handles missing events gracefully', () => {
    // Given: model without events
    const model = defineIVP({
      state: { x: 1.0 },
      params: {},
      derivatives: {
        x: () => 1.0
      }
    });

    // When: accessing events
    const events = model.events;

    // Then: should be undefined
    expect(events).toBeUndefined();
  });

  test('handles mathematical edge cases', () => {
    // Given: model with potential division by zero
    const model = defineIVP({
      state: { x: 0.0 },
      params: { denominator: 0.0 },
      derivatives: {
        x: (state, params) => 1.0 / params.denominator
      }
    });

    // When: evaluating derivative
    const result = model.derivatives.x(model.state, model.params);

    // Then: should return Infinity (not crash)
    expect(result).toBe(Infinity);
  });
});
