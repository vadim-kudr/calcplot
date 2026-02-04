/**
 * Example 12: Damping Regimes
 * 
 * Comparing underdamped, critically damped, and overdamped oscillators
 * Demonstrates: compare() with multiple trajectories, parameter effects
 * 
 * Equations: dx/dt = v, dv/dt = -ω²x - γv
 * Solutions: Different damping behaviors
 */

import { defineIVP, simulate, compare, view } from 'calcplot';

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

// Simulate different damping regimes
const underdamped = simulate(model, {
  params: { gamma: 0.5 },    // Light damping
  timeRange: [0, 5]
});

const criticallyDamped = simulate(model, {
  params: { gamma: 2 * Math.PI },  // Critical damping
  timeRange: [0, 5]
});

const overdamped = simulate(model, {
  params: { gamma: 15 },    // Heavy damping
  timeRange: [0, 5]
});

// Compare all three regimes
compare({
  'Underdamped': underdamped,
  'CriticallyDamped': criticallyDamped,
  'Overdamped': overdamped
}, view()
  .plot(s => s.Underdamped_x, { label: 'Underdamped (γ=0.5)' })
  .plot(s => s.CriticallyDamped_x, { label: 'Critically Damped (γ=2π)' })
  .plot(s => s.Overdamped_x, { label: 'Overdamped (γ=15)' })
  .axis({ 
    xLabel: 'Time (s)', 
    yLabel: 'Position'
  })
  .title('Damping Regimes Comparison')
);

/**
 * Try modifying:
 * - Natural frequency: omega: 2*Math.PI → Math.PI (slower) or 4*Math.PI (faster)
 * - Damping values: change gamma to see different behaviors
 * - Initial conditions: x: 1, v: 0 → x: 2, v: 1
 * - Time range: [0, 5] → [0, 10] for longer observation
 */
