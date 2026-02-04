/**
 * RefLineRenderer Tests
 */

import { RefLineRenderer } from '../../../src/runtime/client/renderers/RefLineRenderer';
import { Layer } from '../../../src/ui/ViewBuilder';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock DOM elements
const mockSVG = {
  node: vi.fn(() => ({
    appendChild: vi.fn()
  })),
  selectAll: vi.fn(() => ({
    remove: vi.fn()
  }))
};

// Mock D3 scale
const mockXScale = vi.fn((value: number) => {
  // Linear scale from domain [0, 10] to range [80, 520]
  return 80 + (520 - 80) * (value / 10);
}) as any;

mockXScale.domain = vi.fn(() => [0, 10]);
mockXScale.range = vi.fn(() => [80, 520]);

const mockYScale = vi.fn((value: number) => {
  // Linear scale from domain [0, 100] to range [380, 40] (inverted for SVG)
  return 380 - (380 - 40) * (value / 100);
}) as any;

mockYScale.domain = vi.fn(() => [0, 100]);
mockYScale.range = vi.fn(() => [380, 40]);

// Mock context
const createMockContext = () => ({
  svg: mockSVG,
  xScale: mockXScale,
  yScale: mockYScale,
  width: 600,
  height: 400,
  margins: {
    left: 60,
    right: 40,
    top: 40,
    bottom: 40
  }
});

describe('RefLineRenderer', () => {
  let renderer: RefLineRenderer;
  let mockContext: any;

  beforeEach(() => {
    renderer = new RefLineRenderer();
    mockContext = createMockContext();
    vi.clearAllMocks();
  });

  describe('Horizontal reference lines', () => {
    it('should render horizontal line within plot bounds', () => {
      const layer: Layer = {
        type: 'refline',
        options: {
          orientation: 'horizontal',
          value: 50,
          color: 'gray',
          linestyle: 'solid',
          linewidth: 1
        }
      };

      renderer.render(layer, mockContext);

      // Check that line was created
      expect(mockSVG.node().appendChild).toHaveBeenCalledWith(
        expect.objectContaining({
          tagName: 'line',
          attributes: expect.objectContaining({
            x1: '62', // left margin + axis width (60 + 2)
            x2: '558', // width - right margin - axis width (600 - 40 - 2)
            y1: '210', // yScale(50) = (380 - 40) * (1 - 50/100) + 40 = 210
            y2: '210',
            stroke: 'gray',
            'stroke-width': '1'
          })
        })
      );
    });

    it('should render horizontal line with dashed style', () => {
      const layer: Layer = {
        type: 'refline',
        options: {
          orientation: 'horizontal',
          value: 25,
          linestyle: 'dashed'
        }
      };

      renderer.render(layer, mockContext);

      expect(mockSVG.node().appendChild).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            'stroke-dasharray': '5, 5'
          })
        })
      );
    });

    it('should render horizontal line with dotted style', () => {
      const layer: Layer = {
        type: 'refline',
        options: {
          orientation: 'horizontal',
          value: 75,
          linestyle: 'dotted'
        }
      };

      renderer.render(layer, mockContext);

      expect(mockSVG.node().appendChild).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            'stroke-dasharray': '2, 2'
          })
        })
      );
    });
  });

  describe('Vertical reference lines', () => {
    it('should render vertical line within plot bounds', () => {
      const layer: Layer = {
        type: 'refline',
        options: {
          orientation: 'vertical',
          value: 5,
          color: 'blue',
          linewidth: 2
        }
      };

      renderer.render(layer, mockContext);

      expect(mockSVG.node().appendChild).toHaveBeenCalledWith(
        expect.objectContaining({
          tagName: 'line',
          attributes: expect.objectContaining({
            x1: '300', // xScale(5) = 80 + (520-80) * 5/10 = 300
            x2: '300',
            y1: '42', // top margin + axis width (40 + 2)
            y2: '358', // height - bottom margin - axis width (400 - 40 - 2)
            stroke: 'blue',
            'stroke-width': '2'
          })
        })
      );
    });
  });

  describe('Label positioning', () => {
    it('should render label for horizontal line with auto positioning', () => {
      const layer: Layer = {
        type: 'refline',
        options: {
          orientation: 'horizontal',
          value: 25, // In upper half, should position label below
          label: 'Test Label'
        }
      };

      renderer.render(layer, mockContext);

      // Should create line and label
      expect(mockSVG.node().appendChild).toHaveBeenCalledTimes(2);

      // Check label positioning (below line since in upper half)
      const labelCall = mockSVG.node().appendChild.mock.calls[1][0];
      expect(labelCall.tagName).toBe('text');
      expect(labelCall.attributes.x).toBe('70'); // plotLeft + labelOffset
      expect(labelCall.attributes.y).toBe('273'); // yScale(25) + labelOffset
      expect(labelCall.attributes['text-anchor']).toBe('start');
      expect(labelCall.attributes['dominant-baseline']).toBe('hanging');
    });

    it('should render label for horizontal line in lower half with auto positioning', () => {
      const layer: Layer = {
        type: 'refline',
        options: {
          orientation: 'horizontal',
          value: 75, // In lower half, should position label above
          label: 'Test Label'
        }
      };

      renderer.render(layer, mockContext);

      const labelCall = mockSVG.node().appendChild.mock.calls[1][0];
      expect(labelCall.attributes.y).toBe('147'); // yScale(75) - labelOffset
      expect(labelCall.attributes['dominant-baseline']).toBe('bottom');
    });

    it('should respect explicit label position', () => {
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

      const labelCall = mockSVG.node().appendChild.mock.calls[1][0];
      expect(labelCall.attributes.x).toBe('550'); // plotRight - labelOffset
      expect(labelCall.attributes['text-anchor']).toBe('end');
    });

    it('should use custom label offset', () => {
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

      const labelCall = mockSVG.node().appendChild.mock.calls[1][0];
      expect(labelCall.attributes.x).toBe('77'); // plotLeft + 15
    });

    it('should render label for vertical line with auto positioning', () => {
      const layer: Layer = {
        type: 'refline',
        options: {
          orientation: 'vertical',
          value: 3, // In left half, should position label to the right
          label: 'Test Label'
        }
      };

      renderer.render(layer, mockContext);

      const labelCall = mockSVG.node().appendChild.mock.calls[1][0];
      expect(labelCall.attributes.x).toBe('207'); // xScale(3) + labelOffset/2
      expect(labelCall.attributes['text-anchor']).toBe('start');
    });
  });

  describe('Edge cases', () => {
    it('should handle missing margins gracefully', () => {
      const contextWithoutMargins = {
        ...mockContext,
        margins: undefined
      };

      const layer: Layer = {
        type: 'refline',
        options: {
          orientation: 'horizontal',
          value: 50
        }
      };

      expect(() => {
        renderer.render(layer, contextWithoutMargins);
      }).not.toThrow();
    });

    it('should not render label if not provided', () => {
      const layer: Layer = {
        type: 'refline',
        options: {
          orientation: 'horizontal',
          value: 50
        }
      };

      renderer.render(layer, mockContext);

      // Should only create line, not label
      expect(mockSVG.node().appendChild).toHaveBeenCalledTimes(1);
    });

    it('should clean up existing labels before rendering new ones', () => {
      const layer: Layer = {
        type: 'refline',
        options: {
          orientation: 'horizontal',
          value: 50,
          label: 'Test Label'
        }
      };

      renderer.render(layer, mockContext);

      // Should call selectAll and remove for cleanup
      expect(mockSVG.selectAll).toHaveBeenCalledWith('.refline-label');
      expect(mockSVG.selectAll().remove).toHaveBeenCalled();
    });
  });
});
