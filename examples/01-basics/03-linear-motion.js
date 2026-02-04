/**
 * Example 3: Linear Motion
 * 
 * Constant velocity motion: dx/dt = v, dv/dt = 0
 * Demonstrates: multiple state variables, constant velocity
 * 
 * Equations: dx/dt = 2, dv/dt = 0
 * Solution: x(t) = x₀ + 2t, v(t) = 2
 */

import { defineIVP, simulate, show, view } from 'calcplot';

// Model: linear motion with constant velocity
const model = defineIVP({
  state: { 
    x: 0,    // Initial position
    v: 2     // Constant velocity (2 units/time)
  },
  derivatives: {
    x: (s) => s.v,    // Position changes with velocity
    v: (s) => 0       // Velocity is constant
  }
});

// Simulate from t=0 to t=10
const trajectory = simulate(model, {
  timeRange: [0, 10]
});

// Visualize both position and velocity
show(trajectory, view()
  .plot(s => s.x, { label: 'Position' })
  .plot(s => s.v, { label: 'Velocity' })
  .axis({ 
    xLabel: 'Time', 
    yLabel: 'Value'
  })
  .title('Linear Motion: Constant Velocity')
);

/**
 * Try modifying:
 * - Initial velocity: v: 2 → -1 (backward motion) or 5 (faster)
 * - Initial position: x: 0 → 3
 * - Add acceleration: v: (s) => 0 → v: (s) => 1 (constant acceleration)
 */
