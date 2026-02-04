/**
 * Example 7: Damped Oscillator
 * 
 * Harmonic oscillator with damping parameter
 * Demonstrates: parameter effects on oscillation behavior
 * 
 * Equations: dx/dt = v, dv/dt = -ω²x - γv
 * Solution: x(t) = A·e^(-γt/2)·cos(ωt + φ)
 */

import { defineIVP, simulate, show, view } from 'calcplot';

// Model: damped harmonic oscillator
const model = defineIVP({
  state: { 
    x: 1,    // Initial displacement
    v: 0     // Initial velocity
  },
  params: { 
    omega: 2 * Math.PI,  // Natural frequency (1 Hz)
    gamma: 0.5           // Damping coefficient
  },
  derivatives: {
    x: (s) => s.v,                           // Position changes with velocity
    v: (s, p) => -(p.omega**2) * s.x - p.gamma * s.v  // Damped acceleration
  }
});

// Simulate for 5 seconds
const trajectory = simulate(model, {
  timeRange: [0, 5]
});

// Visualize the result
show(trajectory, view()
  .plot(s => s.x, { label: 'Position' })
  .plot(s => s.v, { label: 'Velocity' })
  .axis({ 
    xLabel: 'Time (s)', 
    yLabel: 'Value'
  })
  .title('Damped Oscillator: γ = 0.5')
);

/**
 * Try modifying:
 * - Damping: gamma: 0.5 → 0 (undamped) or 2.0 (heavy damping)
 * - Frequency: omega: 2*Math.PI → Math.PI (slower) or 4*Math.PI (faster)
 * - Initial displacement: x: 1 → 2 or 0.5
 */
