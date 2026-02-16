/**
 * Unit Tests: SimpleViewBuilder
 * Tests convenience API for ViewBuilder
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { SimpleViewBuilder, scene, plot, grid, axis } from '../../src/lib/builders/SimpleViewBuilder';
import { ViewBuilder } from '../../src/lib/builders/ViewBuilder';
import { Timeline } from '../../src/core/types';
import * as d3 from 'd3';

describe('SimpleViewBuilder - Convenience API', () => {
  let container: HTMLElement;
  let timeline: Timeline;

  beforeEach(() => {
    // Use real DOM instead of mocking
    container = document.createElement('div');
    document.body.appendChild(container);
    
    const timelineData = {
      times: [0, 0.1, 0.2, 0.3],
      states: {
        x: [0, 1, 2, 3],
        y: [0, 1, 4, 9],
        vx: [1, 1, 1, 1],
        vy: [0, 2, 4, 6]
      }
    };
    
    timeline = {
      ...timelineData,
      at: (t: number) => ({
        x: timelineData.states.x[timelineData.times.indexOf(t)] || 0,
        y: timelineData.states.y[timelineData.times.indexOf(t)] || 0,
        vx: timelineData.states.vx[timelineData.times.indexOf(t)] || 0,
        vy: timelineData.states.vy[timelineData.times.indexOf(t)] || 0
      }),
      serialize: () => JSON.stringify(timelineData)
    };
  });

  afterEach(() => {
    // Clean up DOM
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  test('creates empty builder', () => {
    const builder = new SimpleViewBuilder();
    expect((builder as any).layers).toEqual([]);
  });

  test('all methods return builder for chaining', () => {
    const builder = new SimpleViewBuilder();

    const result = builder
      .scene(() => {
        // Scene setup function
      })
      .plot(() => 1)
      .grid()
      .axis();

    expect(result).toBe(builder);
  });

  test('creates layers with correct types', () => {
    const builder = new SimpleViewBuilder();

    builder
      .scene(() => ({
        width: 800,
        height: 600,
        background: 'white'
      }))
      .plot(() => 1, 'red', 'Test Plot')
      .grid({ showGrid: true })
      .axis('x');

    const layers = (builder as any).layers;
    expect(layers).toHaveLength(4);
    expect(layers[0].type).toBe('scene');
    expect(layers[1].type).toBe('plot');
    expect(layers[2].type).toBe('grid');
    expect(layers[3].type).toBe('axis');
  });

  test('execute() creates ViewBuilder with timeline', () => {
    const builder = new SimpleViewBuilder();
    
    builder.scene(() => ({ width: 800, height: 600 }));

    const viewBuilder = builder.execute(timeline);
    expect(viewBuilder).toBeInstanceOf(ViewBuilder);
    expect(viewBuilder.getTimeline()).toBe(timeline);
  });

  test('factory functions work correctly', () => {
    const builder1 = scene(() => ({ width: 800 }));
    const builder2 = plot(() => 1, 'red');
    const builder3 = grid({ showGrid: false });
    const builder4 = axis('x');

    expect(builder1).toBeInstanceOf(SimpleViewBuilder);
    expect(builder2).toBeInstanceOf(SimpleViewBuilder);
    expect(builder3).toBeInstanceOf(SimpleViewBuilder);
    expect(builder4).toBeInstanceOf(SimpleViewBuilder);
  });
});
