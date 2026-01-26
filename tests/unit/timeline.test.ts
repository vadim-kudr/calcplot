/**
 * Unit tests for core/timeline.ts
 * Documentation-style tests for timeline data management and interpolation
 */

import { describe, test, expect } from 'vitest';
import { Timeline } from '../../src/core/timeline';

describe('Timeline - Core Data Structure', () => {
  test('creates timeline with times and states', () => {
    // Given: simulation data
    const times = [0, 0.1, 0.2, 0.3];
    const states = {
      x: [0, 1, 2, 3],
      y: [0, 1, 4, 9],
      vx: [1, 1, 1, 1]
    };

    // When: creating timeline
    const timeline = new Timeline(times, states);

    // Then: should store data
    expect(timeline.times).toEqual(times);
    expect(timeline.states).toEqual(states);
  });

  test('interpolates state at exact time points', () => {
    // Given: timeline with data
    const timeline = new Timeline([0, 0.5, 1.0], {
      x: [0, 5, 10],
      y: [0, 2.5, 5]
    });

    // When: getting state at exact time points
    const state0 = timeline.at(0);
    const state1 = timeline.at(0.5);
    const state2 = timeline.at(1.0);

    // Then: should return exact values
    expect(state0.x).toBe(0);
    expect(state0.y).toBe(0);
    expect(state1.x).toBe(5);
    expect(state1.y).toBe(2.5);
    expect(state2.x).toBe(10);
    expect(state2.y).toBe(5);
  });

  test('interpolates between time points', () => {
    // Given: timeline
    const timeline = new Timeline([0, 1.0], {
      x: [0, 10],
      y: [0, 5]
    });

    // When: getting state at intermediate time
    const state = timeline.at(0.5);

    // Then: should interpolate linearly
    expect(state.x).toBe(5); // 0 + (10-0) * 0.5
    expect(state.y).toBe(2.5); // 0 + (5-0) * 0.5
  });

  test('handles extrapolation beyond time range', () => {
    // Given: timeline
    const timeline = new Timeline([0, 1.0], {
      x: [0, 10]
    });

    // When: getting state outside range
    const before = timeline.at(-0.5);
    const after = timeline.at(1.5);

    // Then: should extrapolate
    expect(before.x).toBe(0); // Timeline doesn't extrapolate backward
    expect(after.x).toBe(10); // Timeline doesn't extrapolate forward
  });

  test('handles single point timeline', () => {
    // Given: timeline with one point
    const timeline = new Timeline([0], {
      x: [5],
      y: [10]
    });

    // When: getting state
    const state = timeline.at(0);

    // Then: should return the single point
    expect(state.x).toBe(5);
    expect(state.y).toBe(10);
  });

  test('handles missing state variables gracefully', () => {
    // Given: timeline with incomplete states
    const timeline = new Timeline([0, 1.0], {
      x: [0, 10]
      // y is missing
    });

    // When: getting state
    const state = timeline.at(0.5);

    // Then: should handle missing variable
    expect(state.x).toBe(5);
    expect(state.y).toBeUndefined();
  });
});

describe('Timeline - Serialization', () => {
  test('serializes to JSON string', () => {
    // Given: timeline with data
    const timeline = new Timeline([0, 0.5, 1.0], {
      x: [0, 5, 10],
      y: [0, 2.5, 5]
    });

    // When: serializing
    const serialized = timeline.serialize();

    // Then: should create valid JSON string
    expect(typeof serialized).toBe('string');

    // Should be parseable back to object
    const parsed = JSON.parse(serialized);
    expect(parsed.times).toEqual([0, 0.5, 1.0]);
    expect(parsed.states.x).toEqual([0, 5, 10]);
    expect(parsed.states.y).toEqual([0, 2.5, 5]);
  });

  test('serializes complex simulation data', () => {
    // Given: projectile motion timeline
    const timeline = new Timeline([0, 0.5, 1.0, 1.5], {
      x: [0, 25, 50, 75],
      y: [0, 22.5, 40, 52.5],
      vx: [50, 50, 50, 50],
      vy: [100, 75, 50, 25]
    });

    // When: serializing
    const serialized = timeline.serialize();

    // Then: should preserve all data
    const parsed = JSON.parse(serialized);
    expect(parsed.times).toHaveLength(4);
    expect(Object.keys(parsed.states)).toEqual(['x', 'y', 'vx', 'vy']);
    expect(parsed.states.x).toEqual([0, 25, 50, 75]);
  });
});

describe('Timeline - Real-world Examples', () => {
  test('harmonic oscillator', () => {
    // Given: oscillator simulation results
    const times = Array.from({ length: 21 }, (_, i) => i * 0.1);
    const states = {
      x: times.map((t) => Math.cos(t)),
      v: times.map((t) => -Math.sin(t)),
      energy: times.map(() => 1.0)
    };

    const timeline = new Timeline(times, states);

    // When: checking key points
    const start = timeline.at(0);
    const quarter = timeline.at(Math.PI / 2);

    // Then: should match oscillator behavior
    expect(start.x).toBeCloseTo(1, 3); // cos(0) = 1
    expect(start.v).toBeCloseTo(0, 3); // -sin(0) = 0
    expect(quarter.x).toBeCloseTo(0, 3); // cos(π/2) = 0
    expect(quarter.v).toBeCloseTo(-1, 2); // -sin(π/2) = -1
  });

  test('exponential decay', () => {
    // Given: decay simulation
    const times = [0, 1, 2, 3, 4, 5];
    const k = 0.5;
    const states = {
      value: times.map((t) => Math.exp(-k * t)),
      rate: times.map((t) => -k * Math.exp(-k * t))
    };

    const timeline = new Timeline(times, states);

    // When: checking decay
    const initial = timeline.at(0);
    const after2s = timeline.at(2);

    // Then: should follow exponential decay
    expect(initial.value).toBeCloseTo(1, 5); // e^0 = 1
    expect(after2s.value).toBeCloseTo(Math.exp(-1), 5); // e^-1
  });

  test('phase space trajectory', () => {
    // Given: 2D circular motion
    const times = [0, Math.PI / 2, Math.PI];
    const states = {
      x: times.map((t) => Math.cos(t)),
      y: times.map((t) => Math.sin(t)),
      speed: times.map(() => 1.0)
    };

    const timeline = new Timeline(times, states);

    // When: tracing circle
    const points = [timeline.at(0), timeline.at(Math.PI / 2), timeline.at(Math.PI)];

    // Then: should trace unit circle
    expect(points[0].x).toBeCloseTo(1, 4); // (1, 0)
    expect(points[0].y).toBeCloseTo(0, 4);
    expect(points[1].x).toBeCloseTo(0, 4); // (0, 1)
    expect(points[1].y).toBeCloseTo(1, 4);
    expect(points[2].x).toBeCloseTo(-1, 4); // (-1, 0)
    expect(points[2].y).toBeCloseTo(0, 4);
  });
});
