/**
 * Example 5: Harmonic Oscillator
 * 
 * Simple harmonic motion without damping.
 * Demonstrates: multiple state variables, energy conservation, phase portraits
 * 
 * Equation: dx/dt = v, dv/dt = -ω²x
 * Solution: x(t) = A·cos(ωt + φ)
 */

import { defineIVP, simulate, show, view } from 'calcplot';

// Model: simple harmonic oscillator
const model = defineIVP({
  state: { 
    x: 1,    // Initial displacement
    v: 0     // Initial velocity (starts from rest)
  },
  params: { 
    omega: 2 * Math.PI  // Angular frequency (1 Hz)
  },
  derivatives: {
    x: (s) => s.v,                    // Position changes with velocity
    v: (s, p) => -(p.omega**2) * s.x    // Acceleration = -ω²·position
  }
});

// Simulate for 3 complete oscillations
const trajectory = simulate(model, {
  timeRange: [0, 3]
});

// Two views: time series and phase portrait
show(trajectory, [
  // Time series view
  view()
    .plot(s => s.x, { label: 'Position' })
    .plot(s => s.v, { label: 'Velocity' })
    .axis({ 
      xLabel: 'Time (s)', 
      yLabel: 'Value'
    })
    .grid()
    .title('Harmonic Oscillator: Time Series'),
  
  // Phase portrait view
  view()
    .plot(s => [s.x, s.v], { label: 'Trajectory' })
    .axis({ 
      xLabel: 'Position', 
      yLabel: 'Velocity',
      aspectRatio: 'equal'
    })
    .grid()
    .title('Phase Portrait')
]);

/**
 * Try modifying:
 * - Initial displacement: x: 1 → 2 or 0.5
 * - Initial velocity: v: 0 → 1 (gives phase shift)
 * - Frequency: omega: 2*Math.PI → Math.PI (slower) or 4*Math.PI (faster)
 */
