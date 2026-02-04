/**
 * Unit Tests: GridRenderer
 * Tests grid rendering functionality
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { GridRenderer } from '../../../src/runtime/client/renderers';
import type { RenderContext } from '../../../src/runtime/client/interfaces';

// Mock D3
vi.mock('d3', () => ({
  select: vi.fn(() => ({
    append: vi.fn(() => ({
      attr: vi.fn().mockReturnThis(),
      style: vi.fn().mockReturnThis()
    })),
    selectAll: vi.fn(() => ({
      data: vi.fn(() => ({
        enter: vi.fn(() => ({
          append: vi.fn(() => ({
            attr: vi.fn().mockReturnThis(),
            style: vi.fn().mockReturnThis()
          }))
        }))
      })),
      datum: vi.fn().mockReturnThis(),
      node: vi.fn().mockReturnValue(null)
    })),
    attr: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis()
  })),
  scaleLinear: vi.fn(() => ({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    ticks: vi.fn(() => [0, 1, 2, 3, 4, 5])
  }))
}));

describe('GridRenderer', () => {
  let gridRenderer: GridRenderer;
  let mockContext: RenderContext;

  beforeEach(() => {
    gridRenderer = new GridRenderer();
    
    mockContext = {
      svg: {
        append: vi.fn(() => ({
          attr: vi.fn().mockReturnThis()
        }))
      } as any,
      g: {
        selectAll: vi.fn(() => ({
          remove: vi.fn().mockReturnThis(),
          data: vi.fn(() => ({
            enter: vi.fn(() => ({
              append: vi.fn(() => ({
                attr: vi.fn().mockReturnThis()
              }))
            }))
          }))
        })),
        append: vi.fn(() => ({
          attr: vi.fn().mockReturnThis(),
          selectAll: vi.fn(() => ({
            remove: vi.fn().mockReturnThis(),
            data: vi.fn(() => ({
              enter: vi.fn(() => ({
                append: vi.fn(() => ({
                  attr: vi.fn().mockReturnThis()
                }))
              }))
            }))
          }))
        }))
      } as any,
      xScale: {
        ticks: vi.fn(() => [0, 1, 2, 3, 4, 5]),
        domain: vi.fn(() => [0, 10])
      } as any,
      yScale: {
        ticks: vi.fn(() => [0, 1, 2, 3, 4, 5]),
        domain: vi.fn(() => [-10, 10])
      } as any,
      width: 800,
      height: 600,
      margins: {
        top: 50,
        right: 50,
        bottom: 80,
        left: 100
      }
    };
  });

  test('should render grid when showGrid is true', () => {
    const layer = {
      type: 'grid',
      options: {
        showGrid: true
      }
    };
    
    gridRenderer.render(layer, mockContext);
    
    // Should create grid group
    expect(mockContext.g.append).toHaveBeenCalledWith('g');
    
    // Should not call scale.ticks() anymore (uses TickCalculator)
    expect(mockContext.xScale.ticks).not.toHaveBeenCalled();
    expect(mockContext.yScale.ticks).not.toHaveBeenCalled();
  });

  test('should not render grid when showGrid is false', () => {
    const layer = {
      type: 'grid',
      options: {
        showGrid: false
      }
    };

    gridRenderer.render(layer, mockContext);
    
    expect(mockContext.g.selectAll).not.toHaveBeenCalled();
  });

  test('should use default grid color when not specified', () => {
    const layer = {
      type: 'grid',
      options: {
        showGrid: true
      }
    };

    gridRenderer.render(layer, mockContext);
  });

  test('should handle missing options gracefully', () => {
    const layer = {
      type: 'grid'
    };

    gridRenderer.render(layer, mockContext);
  });

  test('should render vertical and horizontal grid lines', () => {
    const layer = {
      type: 'grid',
      options: {
        showGrid: true
      }
    };

    gridRenderer.render(layer, mockContext);
    
    // Should create grid group
    expect(mockContext.g.append).toHaveBeenCalledWith('g');
    
    // Should not call scale.ticks() anymore (uses TickCalculator)
    expect(mockContext.xScale.ticks).not.toHaveBeenCalled();
    expect(mockContext.yScale.ticks).not.toHaveBeenCalled();
  });
});
