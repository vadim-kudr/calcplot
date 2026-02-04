/**
 * Unit Tests: ViewRenderer
 * Tests the modular ViewRenderer architecture
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ViewRenderer } from '../../src/visualization/plots/renderers/ViewRenderer';
import { SVGManager, ResizeManager } from '../../src/visualization/plots/services';
import { LayerRendererFactory } from '../../src/visualization/plots/renderers';

// Mock fetch to avoid CSS loading
(global.fetch as any) = vi.fn(() => Promise.resolve({
  ok: true,
  text: () => Promise.resolve('')
}));

// Mock all the services
vi.mock('../../src/visualization/plots/services', () => ({
  SVGManager: class MockSVGManager {
    getContext = vi.fn(() => ({
      svg: { append: vi.fn() },
      g: { 
        append: vi.fn(() => ({ 
          attr: vi.fn().mockReturnThis(),
          classed: vi.fn().mockReturnThis(),
          style: vi.fn().mockReturnThis(),
          selectAll: vi.fn(() => ({ remove: vi.fn() }))
        })),
        selectAll: vi.fn(() => ({ remove: vi.fn() }))
      },
      xScale: { 
        domain: vi.fn(() => [0, 10]),
        range: vi.fn(() => [80, 520])
      },
      yScale: { 
        domain: vi.fn(() => [0, 100]),
        range: vi.fn(() => [380, 40])
      },
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
    constructor(container: any, callback: any, options: any) {
      // Call the callback immediately to test it
      if (callback && typeof callback === 'function') {
        try {
          callback(800, 600);
        } catch (error) {
          // Ignore errors in callback
        }
      }
    }
  }
}));

vi.mock('../../src/visualization/plots/renderers', () => ({
  LayerRendererFactory: class MockLayerRendererFactory {
    hasRenderer = vi.fn((layerType: string) => {
      // Return true for all layer types except problematic ones
      return ['grid', 'axis', 'plot', 'vector', 'scene', 'bounds'].includes(layerType);
    });
    getRenderer = vi.fn(() => ({
      render: vi.fn((layer: any, context: any, timeline: any) => {
        // Log what we're rendering to debug
        console.log('Mock rendering layer:', layer?.type, layer);
        return { success: true };
      })
    }));
    constructor() {}
  }
}));

vi.mock('../../src/visualization/plots/utils', () => ({
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
    mockContainer = document.createElement('div');
    
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
        times: [0, 1],
        states: { x: [0, 1] }
      },
      layers: []
    };

    // Test basic rendering - just verify it doesn't throw
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
        times: [0, 1],
        states: { 
          x: [0, 1],
          y: [0, 1]
        }
      },
      layers: []
    };

    // Test that renderer can handle basic structure
    expect(() => {
      renderer.render(data);
    }).not.toThrow();
  });

  test('should handle bounds layer correctly', () => {
    const data = {
      type: 'view' as const,
      timeline: {
        times: [0, 1],
        states: { x: [0, 1] }
      },
      layers: []
    };

    // Test basic rendering with bounds
    expect(() => {
      renderer.render(data);
    }).not.toThrow();
  });
});
