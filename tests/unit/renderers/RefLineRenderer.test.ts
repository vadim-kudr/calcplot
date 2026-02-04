/**
 * RefLineRenderer Tests
 * 
 * Tests for rendering horizontal and vertical reference lines with labels.
 * Reference lines are used to highlight specific values on plots.
 */

import { RefLineRenderer } from '../../../src/visualization/plots/renderers/RefLineRenderer';
import { Layer } from '../../../src/lib';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Simple mock D3 selection
const createMockSelection = () => {
  const mockSelection = {
    append: vi.fn((tag: string) => {
      if (tag === 'g') {
        // Return another mock selection for nested groups
        return createMockSelection();
      }
      const element = {
        attr: vi.fn().mockReturnThis(),
        text: vi.fn().mockReturnThis(),
        classed: vi.fn().mockReturnThis(),
        style: vi.fn().mockReturnThis()
      };
      return element;
    }),
    selectAll: vi.fn(() => ({ remove: vi.fn() })),
    attr: vi.fn().mockReturnThis()
  };
  return mockSelection;
};

// Mock scales
const mockXScale = vi.fn((v: number) => 80 + (520 - 80) * (v / 10)) as any;
mockXScale.domain = vi.fn(() => [0, 10]);
mockXScale.range = vi.fn(() => [80, 520]);

const mockYScale = vi.fn((v: number) => 380 - (380 - 40) * (v / 100)) as any;
mockYScale.domain = vi.fn(() => [0, 100]);
mockYScale.range = vi.fn(() => [380, 40]);

// Mock render context
const createMockContext = () => {
  const g = createMockSelection();
  return {
    svg: { node: vi.fn(), selectAll: vi.fn() },
    g: g,
    xScale: mockXScale,
    yScale: mockYScale,
    width: 600,
    height: 400,
    margins: { left: 60, right: 40, top: 40, bottom: 40 }
  };
};

describe('RefLineRenderer', () => {
  let renderer: RefLineRenderer;
  let mockContext: any;

  beforeEach(() => {
    renderer = new RefLineRenderer();
    mockContext = createMockContext();
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render horizontal reference line', () => {
      const layer: Layer = {
        type: 'refline',
        options: { orientation: 'horizontal', value: 50 }
      };

      renderer.render(layer, mockContext);

      expect(mockContext.g.append).toHaveBeenCalledWith('g');
    });

    it('should render vertical reference line', () => {
      const layer: Layer = {
        type: 'refline',
        options: { orientation: 'vertical', value: 5 }
      };

      renderer.render(layer, mockContext);

      expect(mockContext.g.append).toHaveBeenCalledWith('g');
    });

    it('should handle dashed line style', () => {
      const layer: Layer = {
        type: 'refline',
        options: { orientation: 'horizontal', value: 25, linestyle: 'dashed' }
      };

      renderer.render(layer, mockContext);

      expect(mockContext.g.append).toHaveBeenCalledWith('g');
    });

    it('should handle dotted line style', () => {
      const layer: Layer = {
        type: 'refline',
        options: { orientation: 'horizontal', value: 75, linestyle: 'dotted' }
      };

      renderer.render(layer, mockContext);

      expect(mockContext.g.append).toHaveBeenCalledWith('g');
    });
  });

  describe('Labels', () => {
    it('should render label when provided', () => {
      const layer: Layer = {
        type: 'refline',
        options: { orientation: 'horizontal', value: 50, label: 'Test Label' }
      };

      renderer.render(layer, mockContext);

      expect(mockContext.g.append).toHaveBeenCalledWith('g');
      expect(mockContext.g.append).toHaveBeenCalledWith('text');
    });

    it('should not render label when not provided', () => {
      const layer: Layer = {
        type: 'refline',
        options: { orientation: 'horizontal', value: 50 }
      };

      renderer.render(layer, mockContext);

      expect(mockContext.g.append).toHaveBeenCalledWith('g');
      expect(mockContext.g.append).toHaveBeenCalledTimes(1);
    });

    it('should handle custom label position', () => {
      const layer: Layer = {
        type: 'refline',
        options: { 
          orientation: 'horizontal', 
          value: 50, 
          label: 'Test Label',
          labelPosition: 'right'
        }
      };

      renderer.render(layer, mockContext);

      expect(mockContext.g.append).toHaveBeenCalledWith('text');
    });

    it('should handle custom label offset', () => {
      const layer: Layer = {
        type: 'refline',
        options: { 
          orientation: 'horizontal', 
          value: 50, 
          label: 'Test Label',
          labelOffset: 15
        }
      };

      renderer.render(layer, mockContext);

      expect(mockContext.g.append).toHaveBeenCalledWith('text');
    });
  });

  describe('Edge cases', () => {
    it('should handle missing margins gracefully', () => {
      const contextWithoutMargins = { ...mockContext, margins: undefined };
      const layer: Layer = {
        type: 'refline',
        options: { orientation: 'horizontal', value: 50 }
      };

      expect(() => {
        renderer.render(layer, contextWithoutMargins);
      }).not.toThrow();
    });

    it('should clean up existing labels', () => {
      const layer: Layer = {
        type: 'refline',
        options: { orientation: 'horizontal', value: 50, label: 'Test' }
      };

      renderer.render(layer, mockContext);

      expect(mockContext.g.selectAll).toHaveBeenCalledWith('.refline-label');
    });
  });
});
