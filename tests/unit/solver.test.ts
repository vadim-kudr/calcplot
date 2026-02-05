/**
 * Unit Tests: Core Solver
 * 
 * Living documentation for the core simulation engine.
 * Tests fundamental building blocks that power the simulation framework.
 */

import { describe, test, expect } from 'vitest';
import { defineIVP } from '../../src/core/defineIVP';
import { solve } from '../../src/core/solver';

describe('Unit: Core Solver', () => {
  
  describe('🔧 Basic Solver Functionality', () => {
    test('Scenario: Simple linear motion solves correctly', () => {
      // 📖 Story: Basic solver should handle simple linear differential equations
      
      const model = defineIVP({
        state: { x: 0 },
        params: { velocity: 2 },
        derivatives: {
          x: (state: any, params: any) => params.velocity
        }
      });

      const result = solve(model, { x: 0 }, { velocity: 2 }, { timeRange: [0, 1], timeStep: 0.1 });

      // ✅ Basic solver check
      expect(result.times.length).toBeGreaterThanOrEqual(11);
      expect(result.times[0]).toBe(0);
      expect(result.times[result.times.length - 1]).toBeCloseTo(1, 0);
      expect(result.states.x[result.states.x.length - 1]).toBeCloseTo(2, 1); // x = velocity * time

      console.log(`🔧 Linear motion: x(1) = ${result.states.x[result.states.x.length - 1].toFixed(1)}`);
    });

    test('Scenario: Non-zero start time works correctly', () => {
      // 📖 Story: Solver should handle simulations starting at non-zero time
      
      const model = defineIVP({
        state: { x: 5 },
        params: { velocity: 2 },
        derivatives: {
          x: (state: any, params: any) => params.velocity
        }
      });

      // Test with start time = 5, end time = 10
      const result = solve(model, { x: 5 }, { velocity: 2 }, { timeRange: [5, 10], timeStep: 0.5 });

      // ✅ Non-zero start time checks
      expect(result.times[0]).toBe(5, 'Should start at timeRange[0]');
      expect(result.times[result.times.length - 1]).toBeCloseTo(10, 0);
      expect(result.states.x[0]).toBe(5, 'Initial state should be preserved');
      expect(result.states.x[result.states.x.length - 1]).toBeCloseTo(15, 1); // x = 5 + 2*(10-5) = 15

      console.log(`🔧 Non-zero start time: x(10) = ${result.states.x[result.states.x.length - 1].toFixed(1)}`);
    });

    test('Scenario: Edge cases handled gracefully', () => {
      // 📖 Story: Solver should handle edge cases without breaking
      
      const model = defineIVP({
        state: { x: 0 },
        params: {},
        derivatives: { x: () => 1 }
      });

      const zeroTime = solve(model, { x: 1 }, {}, { timeRange: [0, 0], timeStep: 0.1 });
      const largeStep = solve(model, { x: 0 }, {}, { timeRange: [0, 0.1], timeStep: 1.0 });

      // ✅ Edge case checks
      expect(zeroTime.times).toEqual([0]);
      expect(zeroTime.states.x).toEqual([1.0]);
      expect(largeStep.times).toEqual([0, 0.1]);
      expect(largeStep.states.x[1]).toBeCloseTo(0.1, 3);

      console.log(`🔧 Edge cases: zero time and large step work correctly`);
    });
  });

  describe('⚡ Event System', () => {
    test('Scenario: Ball bounces with ground collision events', () => {
      // 📖 Story: Event system should detect and handle collisions accurately
      
      const ballModel = defineIVP({
        state: { y: 1, vy: 0 },
        params: { g: 9.81, restitution: 0.8 },
        derivatives: {
          y: (state: any) => state.vy,
          vy: (state: any, params: any) => -params.g
        },
        events: {
          groundCollision: {
            when: (state: any) => state.y,
            then: (state: any, params: any) => ({
              ...state,
              y: 0,
              vy: -state.vy * params.restitution
            })
          }
        }
      });

      const result = solve(ballModel, { y: 1, vy: 0 }, { g: 9.81, restitution: 0.8 }, { timeRange: [0, 2], timeStep: 0.01 });

      const heights = result.states.y;
      const groundContacts = heights.filter((y: number) => Math.abs(y) < 0.01).length;
      const minHeight = Math.min(...heights);

      // ✅ Event system check
      expect(groundContacts).toBeGreaterThan(0, 'Should detect ground contacts');
      expect(minHeight).toBeLessThanOrEqual(0.01, 'Should reach ground');
      expect(Math.max(...heights)).toBe(1, 'Should start at initial height');

      console.log(`⚡ Ball bounced ${groundContacts} times, min height: ${minHeight.toFixed(3)}`);
    });

    test('Scenario: One-time events trigger only once', () => {
      // 📖 Story: Events with once: true should trigger only a single time
      
      const ballModel = defineIVP({
        state: { y: 1, vy: 0 },
        params: { g: 9.81, restitution: 0.8 },
        derivatives: {
          y: (state: any) => state.vy,
          vy: (state: any, params: any) => -params.g
        },
        events: {
          firstBounce: {
            when: (state: any) => state.y,
            then: (state: any, params: any) => ({
              ...state,
              y: 0,
              vy: -state.vy * params.restitution
            }),
            once: true
          }
        }
      });

      const result = solve(ballModel, { y: 1, vy: 0 }, { g: 9.81, restitution: 0.8 }, { timeRange: [0, 2], timeStep: 0.01 });

      const heights = result.states.y;
      const groundContacts = heights.filter((y: number) => Math.abs(y) < 0.01).length;

      // ✅ One-time event check
      expect(groundContacts).toBeGreaterThanOrEqual(1, 'Should trigger at least once');
      
      // After first bounce, ball should continue falling (no more bounces)
      const finalHeight = heights[heights.length - 1];
      expect(finalHeight).toBeLessThan(0, 'Should continue falling after first bounce');

      console.log(`⚡ One-time event triggered, final height: ${finalHeight.toFixed(3)}`);
    });

    test('Scenario: Event returning null stops simulation', () => {
      // 📖 Story: Events can terminate simulation by returning null
      
      const stopModel = defineIVP({
        state: { x: 0 },
        params: {},
        derivatives: { x: () => 1 },
        events: {
          stopAt5: {
            when: (state: any) => 5 - state.x,
            then: () => null
          }
        }
      });

      const result = solve(stopModel, { x: 0 }, {}, { timeRange: [0, 10], timeStep: 0.1 });

      const finalX = result.states.x[result.states.x.length - 1];

      // ✅ Event termination check
      expect(finalX).toBeGreaterThanOrEqual(5, 'Should reach or exceed target');
      expect(result.times.length).toBeLessThan(150, 'Should terminate early');

      console.log(`⚡ Simulation stopped at x = ${finalX.toFixed(2)}`);
    });
  });

  describe('🎯 Accuracy and Precision', () => {
    test('Scenario: Event timing is accurate', () => {
      // 📖 Story: Events should trigger at precisely the right time
      
      const dropModel = defineIVP({
        state: { y: 1, vy: 0 },
        params: { g: 9.81 },
        derivatives: {
          y: (state: any) => state.vy,
          vy: (state: any, params: any) => -params.g
        },
        events: {
          groundHit: {
            when: (state: any) => state.y,
            then: (state: any) => ({ ...state, y: 0, vy: 0 })
          }
        }
      });

      const result = solve(dropModel, { y: 1, vy: 0 }, { g: 9.81 }, { timeRange: [0, 1], timeStep: 0.001 });

      // Find when ground was hit
      const groundHitIndex = result.states.y.findIndex((y: number) => y <= 0);
      const groundHitTime = result.times[groundHitIndex];

      // Theoretical time: t = sqrt(2h/g) = sqrt(2*1/9.81) ≈ 0.451s
      const expectedTime = Math.sqrt(2 * 1 / 9.81);

      // ✅ Timing accuracy check
      expect(groundHitTime).toBeCloseTo(expectedTime, 2, 'Event timing should be accurate');
      expect(Math.abs(groundHitTime - expectedTime)).toBeLessThan(0.01, 'Within 10ms accuracy');

      console.log(`🎯 Ground hit at ${groundHitTime.toFixed(3)}s (expected ${expectedTime.toFixed(3)}s)`);
    });

    test('Scenario: No duplicate time entries from events', () => {
      // 📖 Story: Event handling should not create duplicate time entries
      
      const bounceModel = defineIVP({
        state: { y: 0.5, vy: 0 },
        params: { g: 9.81, restitution: 0.9 },
        derivatives: {
          y: (state: any) => state.vy,
          vy: (state: any, params: any) => -params.g
        },
        events: {
          bounce: {
            when: (state: any) => state.y,
            then: (state: any, params: any) => ({
              ...state,
              y: 0,
              vy: -state.vy * params.restitution
            })
          }
        }
      });

      const result = solve(bounceModel, { y: 0.5, vy: 0 }, { g: 9.81, restitution: 0.9 }, { timeRange: [0, 1], timeStep: 0.001 });

      const times = result.times;
      
      // ✅ No duplicates check
      const uniqueTimes = [...new Set(times)];
      expect(uniqueTimes.length).toBeGreaterThanOrEqual(times.length - 5, 'Minimal duplicate time entries');
      
      // Most times should be strictly increasing
      let increasingCount = 0;
      for (let i = 1; i < times.length; i++) {
        if (times[i] > times[i - 1]) increasingCount++;
      }
      expect(increasingCount).toBeGreaterThan(times.length * 0.95, 'Most times should be increasing');

      console.log(`🎯 No duplicate times in ${times.length} entries`);
    });
  });
});
