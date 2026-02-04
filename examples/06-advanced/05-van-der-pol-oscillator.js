/**
 * Example 29: Van der Pol Oscillator
 * 
 * Interactive Van der Pol oscillator showing limit cycles
 * Demonstrates: nonlinear dynamics, limit cycles, relaxation oscillations
 * 
 * Equation: d²x/dt² - μ·(1 - x²)·dx/dt + x = 0
 * Or as system: dx/dt = y, dy/dt = μ·(1 - x²)·y - x
 * Where μ controls nonlinearity strength
 */

import { defineIVP, explore, view, slider } from 'calcplot';

// Model: Van der Pol oscillator
const model = defineIVP({
  state: { 
    x: 2,    // Initial position
    y: 0     // Initial velocity
  },
  params: { 
    mu: 1    // Nonlinearity parameter
  },
  derivatives: {
    x: (s) => s.y,
    y: (s, p) => p.mu * (1 - s.x**2) * s.y - s.x
  }
});

// Interactive exploration with nonlinearity
explore(model, {
  params: {
    mu: slider(0.1, 5, 1, 'Nonlinearity (μ)'),
    x0: slider(-3, 3, 2, 'Initial Position'),
    y0: slider(-3, 3, 0, 'Initial Velocity')
  },
  initial: (p) => ({ x: p.x0, y: p.y0 }),
  timeRange: [0, 20],
  view: [
    // Time series showing relaxation oscillations
    view()
      .plot(s => s.x, { label: 'Position' })
      .plot(s => s.y, { label: 'Velocity' })
      .axis({ 
        xLabel: 'Time (s)', 
        yLabel: 'Value'
      })
      .grid()
      .title('Van der Pol Oscillator'),
    
    // Phase portrait showing limit cycle
    view()
      .plot(s => [s.x, s.y], { label: 'Trajectory' })
      .axis({ 
        xLabel: 'Position', 
        yLabel: 'Velocity',
        aspectRatio: 'equal'
      })
      .grid()
      .title('Phase Portrait (Limit Cycle)')
  ]
});

/**
 * Try modifying:
 * - Nonlinearity μ: 
     • μ ≈ 0: nearly harmonic oscillator
     • μ ≈ 1: moderate nonlinearity
     • μ >> 1: strong relaxation oscillations
 * - Initial conditions: all trajectories converge to limit cycle
 * - Observe how μ affects oscillation shape and period
 * - For μ >> 1: slow buildup, fast discharge (relaxation)
 */
