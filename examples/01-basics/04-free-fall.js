/**
 * Example 4: Free Fall
 * 
 * Gravity acceleration: dy/dt = v, dv/dt = -g
 * Demonstrates: parameters, physics simulation, gravity
 * 
 * Equations: dy/dt = v, dv/dt = -9.81
 * Solution: y(t) = y₀ + v₀t - 0.5gt²
 */

import { defineIVP, simulate, show, view } from 'calcplot';

// Model: free fall under gravity
const model = defineIVP({
  state: { 
    y: 100,  // Initial height (100 meters)
    v: 0     // Initial velocity (dropped from rest)
  },
  params: { 
    g: 9.81  // Gravitational acceleration (m/s²)
  },
  derivatives: {
    y: (s) => s.v,        // Position changes with velocity
    v: (s, p) => -p.g     // Velocity changes due to gravity
  }
});

// Simulate until hitting ground (approximately)
const trajectory = simulate(model, {
  timeRange: [0, 5]
});

// Visualize height and velocity
show(trajectory, view()
  .plot(s => s.y, { label: 'Height (m)' })
  .plot(s => s.v, { label: 'Velocity (m/s)' })
  .grid({ color: '#e5e7eb', alpha: 0.5 })
  .axis({ 
    xLabel: 'Time (s)', 
    yLabel: 'Value'
  })
  .grid()
  .title('Free Fall: Gravity Acceleration')
);

/**
 * Try modifying:
 * - Initial height: y: 100 → 50 or 200
 * - Initial velocity: v: 0 → 10 (thrown upward) or -5 (thrown downward)
 * - Gravity: g: 9.81 → 1.62 (Moon) or 3.71 (Mars)
 */
