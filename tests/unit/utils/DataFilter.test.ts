/**
 * Unit Tests: DataFilter
 * Tests data filtering and validation functionality
 */

import { describe, test, expect } from 'vitest';
import { DataFilter } from '../../../src/visualization/plots/utils';

describe('DataFilter', () => {
  describe('filterValidData', () => {
    test('should filter out null and undefined values', () => {
      const xValues = [1, 2, null, 4, undefined, 6];
      const yValues = [2, 3, 4, null, 6, 7];

      const result = DataFilter.filterValidData(xValues, yValues);
      
      // Only keep indices where both x and y are valid
      expect(result.xValues).toEqual([1, 2, 6]);
      expect(result.yValues).toEqual([2, 3, 7]);
    });

    test('should filter out infinite values', () => {
      const xValues = [1, 2, Infinity, -Infinity, 5];
      const yValues = [2, 3, 4, 5, 6];

      const result = DataFilter.filterValidData(xValues, yValues);
      
      expect(result.xValues).toEqual([1, 2, 5]);
      expect(result.yValues).toEqual([2, 3, 6]);
    });

    test('should handle empty arrays', () => {
      const result = DataFilter.filterValidData([], []);
      
      expect(result.xValues).toEqual([]);
      expect(result.yValues).toEqual([]);
    });

    test('should handle NaN values', () => {
      const xValues = [1, 2, NaN, 4];
      const yValues = [2, 3, 4, 5];

      const result = DataFilter.filterValidData(xValues, yValues);
      
      expect(result.xValues).toEqual([1, 2, 4]);
      expect(result.yValues).toEqual([2, 3, 5]);
    });

    test('should preserve valid data', () => {
      const xValues = [1, 2, 3, 4, 5];
      const yValues = [2, 3, 4, 5, 6];

      const result = DataFilter.filterValidData(xValues, yValues);
      
      expect(result.xValues).toEqual(xValues);
      expect(result.yValues).toEqual(yValues);
    });
  });

  describe('filterValidPoints', () => {
    test('should filter valid 2D points', () => {
      const points = [
        [1, 2],
        [3, 4],
        [5, 6]
      ];

      const result = DataFilter.filterValidPoints(points);
      
      expect(result).toEqual(points);
    });

    test('should filter out invalid points', () => {
      const points = [
        [1, 2],
        [3, 'invalid' as any],
        [5, 6],
        null as any,
        [7, 8, 9] as any,
        [9, Infinity]
      ];

      const result = DataFilter.filterValidPoints(points);
      
      expect(result).toEqual([[1, 2], [5, 6]]);
    });

    test('should handle empty array', () => {
      const result = DataFilter.filterValidPoints([]);
      
      expect(result).toEqual([]);
    });

    test('should filter out non-array values', () => {
      const points = [
        [1, 2],
        'invalid' as any,
        { x: 1, y: 2 } as any,
        [3, 4]
      ];

      const result = DataFilter.filterValidPoints(points);
      
      expect(result).toEqual([[1, 2], [3, 4]]);
    });
  });
});
