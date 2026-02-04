/**
 * Unit Tests: BoundsCalculator
 * Tests bounds calculation functionality
 */

import { describe, test, expect, vi } from 'vitest';
import { BoundsCalculator } from '../../../src/runtime/client/utils';

describe('BoundsCalculator', () => {
  describe('calculateBoundsFromTimeline', () => {
    test('should calculate bounds from simple timeline', () => {
      const timeline = {
        times: [0, 1, 2, 3, 4],
        states: {
          x: [0, 1, 2, 3, 4],
          y: [0, 1, 4, 9, 16]
        }
      };

      const bounds = BoundsCalculator.calculateBoundsFromTimeline(timeline);
      
      // When no plot layers are provided, it uses time for x-axis and defaults for y-axis
      expect(bounds.x[0]).toBeLessThanOrEqual(0);
      expect(bounds.x[1]).toBeGreaterThanOrEqual(4);
      expect(bounds.y[0]).toBeLessThanOrEqual(-10); // Default with padding
      expect(bounds.y[1]).toBeGreaterThanOrEqual(10); // Default with padding
    });

    test('should handle empty timeline gracefully', () => {
      const timeline = {
        times: [],
        states: {}
      };

      const bounds = BoundsCalculator.calculateBoundsFromTimeline(timeline);
      
      // Empty timeline uses default bounds with padding
      // x: [0, 10] -> padding = (10-0)*0.05 = 0.5 -> [-0.5, 10.5]
      // y: [-10, 10] -> padding = (10-(-10))*0.05 = 1 -> [-11, 11]
      expect(bounds.x[0]).toBe(-0.5); // 0 - 0.5
      expect(bounds.x[1]).toBe(10.5);  // 10 + 0.5
      expect(bounds.y[0]).toBe(-11); // -10 - 1
      expect(bounds.y[1]).toBe(11);  // 10 + 1
    });

    test('should calculate bounds from plot layers with selectors', () => {
      const timeline = {
        times: [0, 1, 2],
        states: {
          x: [1, 2, 3],
          y: [2, 4, 6]
        }
      };

      const layers = [
        {
          type: 'plot',
          selector: 's => s.x'
        }
      ];

      const bounds = BoundsCalculator.calculateBoundsFromTimeline(timeline, layers);
      
      expect(bounds.x[0]).toBeLessThanOrEqual(0);
      expect(bounds.x[1]).toBeGreaterThanOrEqual(2);
      expect(bounds.y[0]).toBeLessThanOrEqual(1);
      expect(bounds.y[1]).toBeGreaterThanOrEqual(3);
    });

    test('should handle parametric plots', () => {
      const timeline = {
        times: [0, 1, 2],
        states: {
          x: [1, 2, 3],
          y: [2, 4, 6]
        }
      };

      const layers = [
        {
          type: 'plot',
          selector: 's => [s.x, s.y]'
        }
      ];

      const bounds = BoundsCalculator.calculateBoundsFromTimeline(timeline, layers);
      
      expect(bounds.x[0]).toBeLessThanOrEqual(1);
      expect(bounds.x[1]).toBeGreaterThanOrEqual(3);
      expect(bounds.y[0]).toBeLessThanOrEqual(2);
      expect(bounds.y[1]).toBeGreaterThanOrEqual(6);
    });
  });

  describe('areBoundsValid', () => {
    test('should validate correct bounds', () => {
      const bounds = { x: [0, 10], y: [-5, 5] };
      
      expect(BoundsCalculator.areBoundsValid(bounds)).toBe(true);
    });

    test('should reject invalid bounds with wrong order', () => {
      const bounds = { x: [10, 0], y: [-5, 5] };
      
      expect(BoundsCalculator.areBoundsValid(bounds)).toBe(false);
    });

    test('should reject bounds with missing arrays', () => {
      const bounds = { x: [0], y: [-5, 5] };
      
      expect(BoundsCalculator.areBoundsValid(bounds)).toBe(false);
    });

    test('should reject bounds with non-numeric values', () => {
      const bounds = { x: [0, '10' as any], y: [-5, 5] };
      
      expect(BoundsCalculator.areBoundsValid(bounds)).toBe(false);
    });
  });
});
