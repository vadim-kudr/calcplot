/**
 * Example 10: Free Fall with Air Resistance
 * 
* Object falling with linear air drag
 * Demonstrates: terminal velocity, comparison with ideal free fall
 * 
 * Equations: dy/dt = v, dv/dt = -g - k·v
 * Terminal velocity: v_terminal = -g/k
 */

import { defineIVP, simulate, show, compare, view } from 'calcplot';

// Model: free fall with air resistance
const model = defineIVP({
  state: { 
    y: 100,  // Initial height (100m)
    v: 0,    // Initial velocity (dropped)
    v_no_drag: 0  // Velocity without drag (for comparison)
  },
  params: { 
    g: 9.81, // Gravity
    k: 0.1   // Drag coefficient
  },
  derivatives: {
    y: (s) => s.v,                    // Position changes with velocity
    v: (s, p) => -p.g - p.k * s.v,      // Velocity with drag
    v_no_drag: (s, p) => -p.g           // Velocity without drag (free fall)
  }
});

// Simulate with drag
const trajectory = simulate(model, {
  params: { k: 0.1 },  // With drag
  timeRange: [0, 10]
});

// Show velocity comparison
show(trajectory, view()
  .plot(s => s.v, { label: 'With drag' })
  .plot(s => s.v_no_drag, { label: 'Without drag' })
  .axis({ 
    xLabel: 'Time (s)', 
    yLabel: 'Velocity (m/s)'
  })
  .title('Free Fall: With vs Without Air Resistance')
);

/**
 * Try modifying:
 * - Drag coefficient: k: 0.1 → 0.05 (less drag) or 0.3 (more drag)
 * - Initial height: y: 100 → 50 or 200
 * - Gravity: g: 9.81 → 1.62 (Moon) or 3.71 (Mars)
 * - Initial velocity: v: 0 → -10 (thrown down)
 */
