/**
 * Example 15: Interactive Damped Oscillator
 * 
 * Interactive exploration of damped harmonic oscillator with sliders
 * Demonstrates: explore() function, slider controls, real-time updates
 * 
 * Equation: d²x/dt² = -ω²x - γ·dx/dt
 * Parameters: natural frequency ω, damping coefficient γ
 */

import { defineIVP, explore, view, slider } from 'calcplot';

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

// Interactive exploration with sliders
explore(model, {
  params: {
    omega: slider(0.1, 10, 2 * Math.PI, 'Natural Frequency (ω)'),
    gamma: slider(0, 5, 0.5, 'Damping Coefficient (γ)'),
    x0: slider(-2, 2, 1, 'Initial Position'),
    v0: slider(-5, 5, 0, 'Initial Velocity')
  },
  initial: (p) => ({ x: p.x0, v: p.v0 }),
  timeRange: [0, 5],
  view: view()
    .plot(s => s.x, { label: 'Position' })
    .plot(s => s.v, { label: 'Velocity' })
    .axis({ 
      xLabel: 'Time (s)', 
      yLabel: 'Value'
    })
    .grid()
    .title('Interactive Damped Oscillator')
});

/**
 * Try modifying:
 * - Natural frequency: omega slider 0.1-10 Hz
 * - Damping: gamma slider 0-5 (0 = no damping, > critical = overdamped)
 * - Initial conditions: x0 and v0 sliders
 * - Time range: [0, 5] → [0, 10] for longer observation
 */
