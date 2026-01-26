/**
 * Unit Tests: ViewRenderer
 * Tests client-side rendering functionality including plot selector handling
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ViewRenderer } from '../../src/runtime/client/ViewRenderer';
import { FunctionSerializer } from '../../src/runtime/serialization';

describe('ViewRenderer', () => {
  let renderer: ViewRenderer;
  let mockLog: ReturnType<typeof vi.fn>;
  let mockContainer: HTMLElement;

  // Mock canvas context with all required methods
  const mockCanvas = {
    getContext: vi.fn(() => ({
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      setLineDash: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      font: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      globalAlpha: 1,
      clearRect: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      fillRect: vi.fn()
    })),
    width: 800,
    height: 600,
    style: {
      width: '',
      height: '',
      display: ''
    }
  };

  // Mock document.createElement
  global.document = {
    createElement: vi.fn((tag: string) => {
      if (tag === 'div') {
        return {
          innerHTML: '',
          querySelector: vi.fn(() => mockCanvas),
          firstChild: mockCanvas,
          appendChild: vi.fn(),
          style: {}
        };
      }
      return mockCanvas;
    }),
    querySelector: vi.fn(() => mockCanvas)
  } as any;

  beforeEach(() => {
    mockLog = vi.fn();
    mockContainer = {
      appendChild: vi.fn(),
      style: {}
    } as any;
    renderer = new ViewRenderer(mockContainer as any, 800, 600, mockLog);
    vi.clearAllMocks();
  });

  describe('FunctionSerializer Integration', () => {
    test('should parse simple arrow function', () => {
      // Given: simple arrow function string
      const fnStr = 's => s.x';
      
      // When: parsing function
      const result = FunctionSerializer.parseFunction(fnStr);
      
      // Then: should extract function body correctly
      expect(result).toBe('return s.x');
    });

    test('should parse arrow function with parentheses', () => {
      // Given: arrow function with parentheses
      const fnStr = '(s) => s.y';
      
      // When: parsing function
      const result = FunctionSerializer.parseFunction(fnStr);
      
      // Then: should extract function body correctly
      expect(result).toBe('return s.y');
    });

    test('should parse arrow function with block', () => {
      // Given: arrow function with block body
      const fnStr = '(s) => { return s.x + s.y; }';
      
      // When: parsing function
      const result = FunctionSerializer.parseFunction(fnStr);
      
      // Then: should extract function body correctly
      expect(result).toBe('return s.x + s.y;');
    });

    test('should parse arrow function returning array', () => {
      // Given: arrow function returning array
      const fnStr = '(s) => [s.x, s.y]';
      
      // When: parsing function
      const result = FunctionSerializer.parseFunction(fnStr);
      
      // Then: should extract function body correctly
      expect(result).toBe('return [s.x, s.y]');
    });

    test('should parse arrow function with parentheses returning array', () => {
      // Given: arrow function with parentheses returning array
      const fnStr = 's => [s.x, s.v]';
      
      // When: parsing function
      const result = FunctionSerializer.parseFunction(fnStr);
      
      // Then: should extract function body correctly
      expect(result).toBe('return [s.x, s.v]');
    });

    test('should parse arrow function with block returning array', () => {
      // Given: arrow function with block returning array
      const fnStr = '(s) => { return [s.x, s.y]; }';
      
      // When: parsing function
      const result = FunctionSerializer.parseFunction(fnStr);
      
      // Then: should extract function body correctly
      expect(result).toBe('return [s.x, s.y];');
    });

    test('should create functions from parsed selectors', () => {
      // Given: parsed function body and parameters
      const params = ['s'];
      const body = 'return s.x';
      
      // When: creating function
      const fn = FunctionSerializer.createFunction(params, body);
      
      // Then: should create working function
      expect(typeof fn).toBe('function');
      expect(fn({ x: 5, y: 10 })).toBe(5);
      
      // Test block with return
      const fn3 = FunctionSerializer.parseAndCreateFunction(['s'], '(s)=>{ return s.y; }');
      expect(fn3({ x: 0, y: 10 })).toBe(10);
    });
  });

  describe('renderScene', () => {
    test('should handle invalid scene draw functions gracefully', () => {
      // Given: visualization data with invalid scene function
      const data = {
        type: 'view' as const,
        timeline: {
          times: [0, 0.1],
          states: { x: [0, 1] }
        },
        layers: [{
          type: 'scene',
          draw: 'invalid syntax !!!'
        }]
      };

      // When: rendering scene
      expect(() => {
        renderer.render(data);
      }).not.toThrow();
      
      // Then: should handle error gracefully and not crash
      expect(true).toBe(true); // Test passes if no exception thrown
    });

    test('should handle missing draw function gracefully', () => {
      // Given: visualization data with scene layer missing draw function
      const data = {
        type: 'view' as const,
        timeline: {
          times: [0, 0.1],
          states: { x: [0, 1] }
        },
        layers: [{
          type: 'scene'
          // Missing draw function
        }]
      };

      // When: rendering scene
      expect(() => {
        renderer.render(data);
      }).not.toThrow();
      
      // Then: should handle missing draw function gracefully
      expect(true).toBe(true); // Test passes if no exception thrown
    });
  });

  describe('Error Handling', () => {
    test('should log scene function compilation errors', () => {
      // Given: scene function with syntax error
      const data = {
        type: 'view' as const,
        timeline: {
          times: [0, 0.1],
          states: { x: [0, 1] }
        },
        layers: [{
          type: 'scene',
          draw: 'function(ctx, state) { invalid syntax }'
        }]
      };

      // When: rendering scene
      renderer.render(data);
      
      // Then: should log compilation error
      expect(mockLog).toHaveBeenCalledWith(
        '⚠️ Failed to compile scene function:',
        expect.any(Error)
      );
      
      // Should also have the new debug logging
      expect(mockLog).toHaveBeenCalledWith(
        '🎨 renderInternal called:',
        expect.any(Object)
      );
    });

    test('should log scene function execution errors', () => {
      // Given: scene function that throws error during execution
      const data = {
        type: 'view' as const,
        timeline: {
          times: [0, 0.1],
          states: { x: [0, 1] }
        },
        layers: [{
          type: 'scene',
          draw: '(ctx, state) => { throw new Error("Test error"); }'
        }]
      };

      // When: rendering scene
      renderer.render(data);
      
      // Then: should log execution error
      expect(mockLog).toHaveBeenCalledWith(
        '⚠️ Error in scene function:',
        expect.any(Error)
      );
      
      // Should also have the new debug logging
      expect(mockLog).toHaveBeenCalledWith(
        '🎨 renderInternal called:',
        expect.any(Object)
      );
    });
  });

  describe('Bounds Calculation', () => {
    test('should handle rendering with timeline data', () => {
      // Given: timeline with test data
      const data = {
        type: 'view' as const,
        timeline: {
          times: [0, 0.1, 0.2],
          states: {
            x: [0, 1, 2],
            y: [0, 1, 4],
            v: [0, 2, 3]
          }
        },
        layers: []
      };

      // When: rendering with timeline
      expect(() => {
        renderer.render(data);
      }).not.toThrow();
      
      // Then: should render successfully
      expect(true).toBe(true);
    });

    test('should handle empty timeline gracefully', () => {
      // Given: empty timeline
      const data = {
        type: 'view' as const,
        timeline: {
          times: [],
          states: {}
        },
        layers: []
      };

      // When: rendering with empty timeline
      expect(() => {
        renderer.render(data);
      }).not.toThrow();
      
      // Then: should handle gracefully
      expect(true).toBe(true);
    });

    test('should handle negative values in timeline', () => {
      // Given: timeline with negative values
      const data = {
        type: 'view' as const,
        timeline: {
          times: [0, 0.1],
          states: {
            x: [-5, 10],
            y: [-10, 5]
          }
        },
        layers: []
      };

      // When: rendering with negative values
      expect(() => {
        renderer.render(data);
      }).not.toThrow();
      
      // Then: should handle gracefully
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle null/undefined timeline gracefully', () => {
      // Given: null timeline
      const data = {
        type: 'view' as const,
        timeline: null,
        layers: []
      };

      // When: rendering with null timeline
      expect(() => {
        renderer.render(data);
      }).not.toThrow();
      
      // Then: should handle gracefully
      expect(true).toBe(true);
    });

    test('should handle malformed function selectors', () => {
      // Given: various malformed selector strings
      const malformedSelectors = [
        '',
        '=>',
        '() =>',
        'function() {',
        'x =>',
        '(x) =>',
        'invalid syntax',
        '() => { return x',
        'x => return x'
      ];

      malformedSelectors.forEach(selector => {
        // When: parsing malformed selector
        expect(() => {
          FunctionSerializer.parseFunction(selector);
        }).not.toThrow();
      });
    });

    test('should handle very large numbers in timeline', () => {
      // Given: timeline with very large numbers
      const data = {
        type: 'view' as const,
        timeline: {
          times: [0, 0.1],
          states: {
            x: [Number.MAX_VALUE, Number.MIN_VALUE],
            y: [Infinity, -Infinity]
          }
        },
        layers: []
      };

      // When: rendering with large numbers
      expect(() => {
        renderer.render(data);
      }).not.toThrow();
      
      // Then: should handle large numbers gracefully
      expect(true).toBe(true);
    });
  });
});
