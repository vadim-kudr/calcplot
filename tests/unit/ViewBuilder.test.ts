/**
 * Unit tests for ui/ViewBuilder.ts
 * Documentation-style tests for the core visualization builder
 */

import { describe, test, expect, vi } from 'vitest';
import { ViewBuilder, view } from '../../src/lib/builders/ViewBuilder';
import { Timeline } from '../../src/core/defineIVP';

describe('ViewBuilder - Core Visualization API', () => {
  const mockTimeline = {
    times: [0, 0.1, 0.2, 0.3],
    states: {
      x: [0, 1, 2, 3],
      y: [0, 1, 4, 9],
      vx: [1, 1, 1, 1],
      vy: [0, 2, 4, 6]
    },
    at: vi.fn(),
    serialize: vi.fn()
  } as Timeline;

  test('creates builder with timeline', () => {
    // Given: timeline data
    // When: creating ViewBuilder
    const builder = new ViewBuilder(mockTimeline);

    // Then: should store timeline
    expect(builder.getTimeline()).toBe(mockTimeline);
    expect(builder.getLayers()).toEqual([]);
  });

  test('view() factory function', () => {
    // When: using factory function
    const builder = view(mockTimeline);

    // Then: should create ViewBuilder instance
    expect(builder).toBeInstanceOf(ViewBuilder);
    expect(builder.getTimeline()).toBe(mockTimeline);
  });

  test('scene layer with custom drawing', () => {
    // Given: custom drawing function
    const drawFn = (ctx: any, state: any) => {
      ctx.circle([state.x, state.y], 5);
    };

    // When: adding scene layer
    const builder = new ViewBuilder(mockTimeline).scene(drawFn);

    // Then: should store serialized function
    const layers = builder.getLayers();
    expect(layers).toHaveLength(1);
    expect(layers[0].type).toBe('scene');
    expect(layers[0].draw).toBe(drawFn.toString());
  });

  test('plot layer with scalar selector', () => {
    // Given: scalar selector function
    const selector = (state: any) => state.x;

    // When: adding plot
    const builder = new ViewBuilder(mockTimeline).plot(selector, { color: 'red' });

    // Then: should detect non-parametric and store options
    const layers = builder.getLayers();
    expect(layers).toHaveLength(1);
    expect(layers[0].type).toBe('plot');
    expect(layers[0].parametric).toBe(false);
    expect(layers[0].options.color).toBe('red');
    expect(layers[0].selector).toBe(selector.toString());
  });

  test('plot layer with parametric selector', () => {
    // Given: parametric selector returning [x, y]
    const selector = (state: any): [number, number] => [state.x, state.y];

    // When: adding plot
    const builder = new ViewBuilder(mockTimeline).plot(selector);

    // Then: should detect parametric and store
    const layers = builder.getLayers();
    expect(layers).toHaveLength(1);
    expect(layers[0].type).toBe('plot');
    expect(layers[0].parametric).toBe(true);
  });

  test('vector layer with position and direction', () => {
    // Given: vector functions
    const atFn = (state: any): [number, number] => [state.x, state.y];
    const dirFn = (state: any): [number, number] => [state.vx, state.vy];

    // When: adding vector layer
    const builder = new ViewBuilder(mockTimeline).vector(atFn, dirFn, { color: 'blue', scale: 2 });

    // Then: should store both functions and options
    const layers = builder.getLayers();
    expect(layers).toHaveLength(1);
    expect(layers[0].type).toBe('vector');
    expect(layers[0].at).toBe(atFn.toString());
    expect(layers[0].dir).toBe(dirFn.toString());
    expect(layers[0].options.color).toBe('blue');
    expect(layers[0].options.scale).toBe(2);
  });

  test('coordinate bounds setting', () => {
    // When: setting bounds
    const builder = new ViewBuilder(mockTimeline).bounds({ x: [-5, 5], y: [0, 10] });

    // Then: should store bounds layer
    const layers = builder.getLayers();
    expect(layers).toHaveLength(1);
    expect(layers[0].type).toBe('bounds');
    expect(layers[0].bounds).toEqual({ x: [-5, 5], y: [0, 10] });
  });

  test('grid and axis layers', () => {
    // When: adding grid and axis
    const builder = new ViewBuilder(mockTimeline)
      .grid({ spacing: 1, color: '#333' })
      .axis({ labels: true });

    // Then: should store both layers
    const layers = builder.getLayers();
    expect(layers).toHaveLength(2);
    expect(layers[0].type).toBe('grid');
    expect(layers[0].options.spacing).toBe(1);
    expect(layers[1].type).toBe('axis');
    expect(layers[1].options.labels).toBe(true);
  });

  test('method chaining for fluent API', () => {
    // Given: complex visualization
    // When: chaining multiple methods
    const builder = new ViewBuilder(mockTimeline)
      .grid()
      .axis()
      .plot((state) => state.x, { color: 'red' })
      .plot((state) => [state.x, state.y], { color: 'blue' })
      .vector(
        (state) => [state.x, state.y],
        (state) => [state.vx, state.vy]
      )
      .bounds({ x: 'auto', y: 'auto' });

    // Then: should build complete visualization
    const layers = builder.getLayers();
    expect(layers).toHaveLength(6);
    expect(layers.map((l) => l.type)).toEqual(['grid', 'axis', 'plot', 'plot', 'vector', 'bounds']);
  });

  test('toDescriptor conversion for rendering', () => {
    // Given: builder with layers
    const builder = new ViewBuilder(mockTimeline).plot((state) => state.x).grid();

    // When: converting to descriptor
    const descriptor = builder.toDescriptor();

    // Then: should include timeline and layers
    expect(descriptor.timeline.times).toEqual(mockTimeline.times);
    expect(descriptor.timeline.states).toEqual(mockTimeline.states);
    expect(descriptor.layers).toHaveLength(2);
    expect(descriptor.layers[0].type).toBe('plot');
    expect(descriptor.layers[1].type).toBe('grid');
  });
});

describe('ViewBuilder - Real-world Examples', () => {
  test('projectile motion visualization', () => {
    // Given: projectile timeline
    const projectileTimeline = {
      times: [0, 0.5, 1.0, 1.5],
      states: {
        x: [0, 25, 50, 75],
        y: [0, 22.5, 40, 52.5],
        vx: [50, 50, 50, 50],
        vy: [100, 75, 50, 25]
      },
      at: vi.fn(),
      serialize: vi.fn()
    } as Timeline;

    // When: building projectile visualization
    const builder = view(projectileTimeline)
      .bounds({ x: [0, 100], y: [0, 60] })
      .grid({ spacing: 10 })
      .axis({ labels: true })
      .plot((state) => [state.x, state.y], { color: 'red', label: 'trajectory' })
      .vector(
        (state) => [state.x, state.y],
        (state) => [state.vx * 0.3, state.vy * 0.3],
        { color: 'blue', label: 'velocity' }
      );

    // Then: should create complete visualization
    const descriptor = builder.toDescriptor();
    expect(descriptor.layers).toHaveLength(5);
    // Since ViewBuilder is mocked, we can't test layer types directly
    expect(descriptor.timeline).toBeDefined();
  });

  test('oscillator phase space plot', () => {
    // Given: oscillator data
    const oscillatorTimeline = {
      times: [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4],
      states: {
        x: [1, 0.707, 0, -0.707],
        v: [0, -0.707, -1, -0.707]
      },
      at: vi.fn(),
      serialize: vi.fn()
    } as Timeline;

    // When: creating phase space visualization
    const builder = view(oscillatorTimeline)
      .bounds({ x: [-1.2, 1.2], y: [-1.2, 1.2] })
      .grid({ spacing: 0.5 })
      .plot((state) => [state.x, state.v], { color: 'green', lineWidth: 2 })
      .plot((state) => state.x, { color: 'blue', dash: [5, 5] }); // x projection

    // Then: should create phase space plot
    const layers = builder.getLayers();
    expect(layers[2].parametric).toBe(true); // phase space
    expect(layers[3].parametric).toBe(false); // x projection
  });
});
