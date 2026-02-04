/**
 * BoundsCalculator - Handles coordinate bounds calculation from timeline data
 */

import { FunctionSerializer } from '../../../simulation/serialization';

export interface Bounds {
  x: [number, number];
  y: [number, number];
}

export class BoundsCalculator {
  /**
   * Calculate bounds from timeline data and plot layers
   */
  static calculateBoundsFromTimeline(timeline: any, layers?: any[]): Bounds {
    let xMin = Infinity,
      xMax = -Infinity;
    let yMin = Infinity,
      yMax = -Infinity;

    // First try to find bounds from selectors in plot layers
    if (layers) {
      const plotLayers = layers.filter(layer => layer.type === 'plot' && layer.selector);
      
      for (const layer of plotLayers) {
        try {
          const selectFn = FunctionSerializer.parseAndCreateFunction(['s'], layer.selector);
          
          // Test if selector is parametric
          const testState = { x: 0, y: 0 };
          const result = selectFn(testState);
          const isParametric = Array.isArray(result) && result.length === 2;
          
          if (isParametric) {
            // Extract all points from timeline
            const points = timeline.times.map((_: any, i: number) => {
              const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
                acc[key] = timeline.states[key][i];
                return acc;
              }, {});
              return selectFn(state);
            }).filter((p: any) => Array.isArray(p) && p.length === 2 && typeof p[0] === 'number' && typeof p[1] === 'number');
            
            // Update bounds from points
            for (const point of points) {
              xMin = Math.min(xMin, point[0]);
              xMax = Math.max(xMax, point[0]);
              yMin = Math.min(yMin, point[1]);
              yMax = Math.max(yMax, point[1]);
            }
          } else {
            // For non-parametric plots, use time as x and selector result as y
            const yValues = timeline.times.map((_: any, i: number) => {
              const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
                acc[key] = timeline.states[key][i];
                return acc;
              }, {});
              return selectFn(state);
            }).filter((v: any) => typeof v === 'number');
            
            xMin = Math.min(xMin, ...timeline.times);
            xMax = Math.max(xMax, ...timeline.times);
            yMin = Math.min(yMin, ...yValues);
            yMax = Math.max(yMax, ...yValues);
          }
        } catch (e) {
          console.warn('Failed to analyze selector for bounds:', e);
        }
      }
    }
    
    // Fallback: use time for x-axis if bounds not found from selectors
    if (xMin === Infinity && timeline.times) {
      xMin = Math.min(...timeline.times);
      xMax = Math.max(...timeline.times);
    }

    // Default values if still not found
    if (xMin === Infinity) xMin = 0;
    if (xMax === -Infinity) xMax = 10;
    if (yMin === Infinity) yMin = -10;
    if (yMax === -Infinity) yMax = 10;

    const xPadding = (xMax - xMin) * 0.05 || 0.5; // 5% padding, less clipping
    const yPadding = (yMax - yMin) * 0.05 || 0.5;

    return {
      x: [xMin - xPadding, xMax + xPadding],
      y: [yMin - yPadding, yMax + yPadding]
    };
  }

  /**
   * Check if bounds are valid
   */
  static areBoundsValid(bounds: Bounds): boolean {
    return (
      bounds &&
      Array.isArray(bounds.x) && bounds.x.length === 2 &&
      Array.isArray(bounds.y) && bounds.y.length === 2 &&
      typeof bounds.x[0] === 'number' && typeof bounds.x[1] === 'number' &&
      typeof bounds.y[0] === 'number' && typeof bounds.y[1] === 'number' &&
      bounds.x[0] < bounds.x[1] &&
      bounds.y[0] < bounds.y[1]
    );
  }
}
