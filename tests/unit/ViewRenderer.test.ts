/**
 * Unit Tests: ViewRenderer
 * Tests the modular ViewRenderer architecture
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ViewRenderer } from '../../src/runtime/client/ViewRenderer';
import { SVGManager, ResizeManager } from '../../src/runtime/client/services';
import { LayerRendererFactory } from '../../src/runtime/client/renderers';

// Mock all the services
vi.mock('../../src/runtime/client/services', () => ({
  SVGManager: class MockSVGManager {
    getContext = vi.fn(() => ({
      svg: { append: vi.fn() },
      g: { selectAll: vi.fn(() => ({ remove: vi.fn() })) },
      xScale: { domain: vi.fn(), range: vi.fn() },
      yScale: { domain: vi.fn(), range: vi.fn() },
      width: 800,
      height: 600
    }));
    resize = vi.fn();
    updateDomains = vi.fn();
    getDimensions = vi.fn(() => ({ width: 800, height: 600 }));
    getSVG = vi.fn();
    getGroup = vi.fn();
    destroy = vi.fn();
    constructor(container: any, options: any) {}
  },
  ResizeManager: class MockResizeManager {
    checkResize = vi.fn();
    destroy = vi.fn();
    constructor(container: any, callback: any, options: any) {}
  }
}));

vi.mock('../../src/runtime/client/renderers', () => ({
  LayerRendererFactory: class MockLayerRendererFactory {
    hasRenderer = vi.fn(() => true);
    getRenderer = vi.fn(() => ({
      render: vi.fn()
    }));
    constructor() {}
  }
}));

vi.mock('../../src/runtime/client/utils', () => ({
  BoundsCalculator: {
    calculateBoundsFromTimeline: vi.fn(() => ({ x: [0, 10], y: [0, 10] })),
    areBoundsValid: vi.fn(() => true)
  },
  D3ScaleFactory: {
    getProportionalMargins: vi.fn(() => ({ top: 50, right: 50, bottom: 80, left: 100 }))
  }
}));

describe('ViewRenderer', () => {
  let renderer: ViewRenderer;
  let mockLog: ReturnType<typeof vi.fn>;
  let mockContainer: HTMLElement;

  beforeEach(() => {
    mockLog = vi.fn();
    mockContainer = {
      appendChild: vi.fn(),
      style: {},
      classList: {
        add: vi.fn(),
        contains: vi.fn(() => false)
      }
    } as any;
    
    renderer = new ViewRenderer(mockContainer, 800, 600, mockLog);
    vi.clearAllMocks();
  });

  test('should initialize with modular services', () => {
    expect(() => {
      new ViewRenderer(mockContainer, 800, 600, mockLog);
    }).not.toThrow();
  });

  test('should render visualization data', () => {
    const data = {
      type: 'view' as const,
      timeline: {
        times: [0, 1, 2],
        states: { x: [0, 1, 2] }
      },
      layers: [
        { type: 'grid', options: {} }
      ]
    };

    expect(() => {
      renderer.render(data);
    }).not.toThrow();
  });

  test('should handle missing timeline gracefully', () => {
    const data = {
      type: 'view' as const,
      layers: []
    };

    expect(() => {
      renderer.render(data);
    }).not.toThrow();
  });

  test('should provide access to layer renderer factory', () => {
    const factory = renderer.getLayerRendererFactory();
    expect(factory).toBeDefined();
    expect(factory.hasRenderer).toBeDefined();
  });

  test('should provide access to SVG manager', () => {
    const svgManager = renderer.getSVGManager();
    expect(svgManager).toBeDefined();
    expect(svgManager.getContext).toBeDefined();
  });

  test('should provide access to render context', () => {
    const context = renderer.getRenderContext();
    expect(context).toBeDefined();
    expect(context.svg).toBeDefined();
    expect(context.g).toBeDefined();
  });

  test('should handle resize checking', () => {
    expect(() => {
      renderer.checkResize();
    }).not.toThrow();
  });

  test('should render explore data correctly', () => {
    const data = {
      type: 'explore' as const,
      layers: []
    };
    const timeline = {
      times: [0, 1, 2],
      states: { x: [0, 1, 2] }
    };

    expect(() => {
      renderer.renderExplore(data, timeline);
    }).not.toThrow();
  });

  test('should clean up resources on destroy', () => {
    expect(() => {
      renderer.destroy();
    }).not.toThrow();
  });

  test('should maintain modular architecture', () => {
    // Test that the new architecture works correctly
    expect(() => {
      const context = renderer.getRenderContext();
      expect(context).toBeDefined();
    }).not.toThrow();
  });

  test('should handle complex layer configurations', () => {
    const data = {
      type: 'view' as const,
      timeline: {
        times: [0, 1, 2, 3],
        states: {
          x: [0, 1, 2, 3],
          y: [0, 1, 4, 9]
        }
      },
      layers: [
        { type: 'grid', options: { showGrid: true } },
        { type: 'axis', options: { showTicks: true } },
        { type: 'plot', selector: 's => s.x', options: { color: 'red' } },
        { type: 'vector', at: 's => [s.x, s.y]', dir: 's => [1, 0]' },
        { type: 'scene', draw: 'ctx => ctx.circle([0, 0], 5)' }
      ]
    };

    expect(() => {
      renderer.render(data);
    }).not.toThrow();
  });

  test('should handle bounds layer correctly', () => {
    const data = {
      type: 'view' as const,
      timeline: {
        times: [0, 1, 2],
        states: { x: [0, 1, 2] }
      },
      layers: [
        { type: 'bounds', bounds: { x: [-5, 5], y: [-10, 10] } }
      ]
    };

    expect(() => {
      renderer.render(data);
    }).not.toThrow();
  });
});
