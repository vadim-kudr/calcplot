/**
 * Unit tests for ui/SimpleViewBuilder.ts
 * Tests for convenience wrapper around ViewBuilder
 */

import { describe, test, expect, vi } from 'vitest';
import { SimpleViewBuilder, scene, plot, grid, axis } from '../../src/ui/SimpleViewBuilder';
import { ViewBuilder } from '../../src/ui/ViewBuilder';
import { Timeline } from '../../src/core/ivp';

// Mock ViewBuilder
const mockViewBuilderMethods = {
  scene: vi.fn(),
  plot: vi.fn(),
  grid: vi.fn(),
  axis: vi.fn()
};

vi.mock('../../src/ui/ViewBuilder', () => ({
  ViewBuilder: class MockViewBuilder {
    constructor(timeline: any) {
      return mockViewBuilderMethods;
    }
  }
}));

describe('SimpleViewBuilder - Convenience API', () => {
  test('creates empty builder', () => {
    const builder = new SimpleViewBuilder();
    expect((builder as any).layers).toEqual([]);
  });

  test('all methods return builder for chaining', () => {
    const builder = new SimpleViewBuilder();

    const result = builder
      .scene(() => {})
      .plot(() => 1)
      .grid({})
      .axis({});

    expect(result).toBe(builder);
  });

  test('execute() calls ViewBuilder methods', () => {
    const builder = new SimpleViewBuilder();
    const drawFn = () => {};
    const selector = () => 1;

    builder.scene(drawFn).plot(selector);

    vi.clearAllMocks();
    builder.execute({} as Timeline);

    expect(mockViewBuilderMethods.scene).toHaveBeenCalledWith(drawFn);
    expect(mockViewBuilderMethods.plot).toHaveBeenCalledWith(selector, undefined);
  });
});

describe('Standalone Functions - Quick Start API', () => {
  test.each([
    { fn: scene, name: 'scene', args: [() => {}] },
    { fn: plot, name: 'plot', args: [() => 1, { color: 'red' }] },
    { fn: grid, name: 'grid', args: [{ spacing: 10 }] },
    { fn: axis, name: 'axis', args: [{ labels: true }] }
  ])(
    'creates builder with $name',
    ({ fn, args }: { fn: (...args: any[]) => any; name: string; args: any[] }) => {
      const builder = (fn as any)(...args);

      expect(builder).toBeInstanceOf(SimpleViewBuilder);

      if (fn.name !== 'canvas') {
        expect((builder as any).layers).toHaveLength(1);
      }
    }
  );
});

describe('Usage Examples', () => {
  test('quick visualization setup', () => {
    // When: using convenience functions
    const builder = plot((state: any) => state.x, { color: 'blue' })
      .grid({ spacing: 5 })
      .axis({ labels: true });

    // Then: should build complete visualization
    expect((builder as any).layers).toHaveLength(3);
    expect((builder as any).layers[0].method).toBe('plot');
    expect((builder as any).layers[1].method).toBe('grid');
    expect((builder as any).layers[2].method).toBe('axis');
  });

  test('scene with custom drawing', () => {
    // When: creating custom scene
    const builder = scene((ctx: any, state: any) => {
      ctx.circle([state.x, state.y], 5);
    });

    // Then: should store scene function
    expect((builder as any).layers).toHaveLength(1);
    expect((builder as any).layers[0].method).toBe('scene');
  });
});
