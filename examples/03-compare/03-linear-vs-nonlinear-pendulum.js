/**
 * Example 13: Linear vs Nonlinear Pendulum
 * 
 * Comparing linear approximation vs full nonlinear pendulum
 * Demonstrates: compare() showing approximation validity
 * 
 * Linear: d²θ/dt² = -(g/L)·θ (small angle approximation)
 * Nonlinear: d²θ/dt² = -(g/L)·sin(θ) (full equation)
 */

import { defineIVP, simulate, compare, view } from 'calcplot';

// Linear pendulum model (small angle approximation)
const linearModel = defineIVP({
  state: { 
    theta: 0.5,    // Initial angle (radians)
    omega: 0       // Initial angular velocity
  },
  params: { 
    g: 9.81,       // Gravity
    L: 1           // Length (1 meter)
  },
  derivatives: {
    theta: (s) => s.omega,                    // Angle changes with angular velocity
    omega: (s, p) => -(p.g / p.L) * s.theta   // Linear: d²θ/dt² = -(g/L)·θ
  }
});

// Nonlinear pendulum model (full equation)
const nonlinearModel = defineIVP({
  state: { 
    theta: 0.5,    // Initial angle (radians)
    omega: 0       // Initial angular velocity
  },
  params: { 
    g: 9.81,       // Gravity
    L: 1           // Length (1 meter)
  },
  derivatives: {
    theta: (s) => s.omega,                    // Angle changes with angular velocity
    omega: (s, p) => -(p.g / p.L) * Math.sin(s.theta)  // Nonlinear: d²θ/dt² = -(g/L)·sin(θ)
  }
});

// Simulate both models
const linearTrajectory = simulate(linearModel, {
  timeRange: [0, 10]
});

const nonlinearTrajectory = simulate(nonlinearModel, {
  timeRange: [0, 10]
});

// Compare both models
compare({
  'Linear': linearTrajectory,
  'Nonlinear': nonlinearTrajectory
}, view()
  .plot(s => s.Linear_theta, { label: 'Linear (small angle)' })
  .plot(s => s.Nonlinear_theta, { label: 'Nonlinear (full)' })
  .axis({ 
    xLabel: 'Time (s)', 
    yLabel: 'Angle (radians)'
  })
  .title('Linear vs Nonlinear Pendulum (θ₀ = 0.5 rad)')
);

/**
 * Try modifying:
 * - Initial angle: theta: 0.5 → 0.1 (better approximation) or 1.0 (worse)
 * - Pendulum length: L: 1 → 0.5 (faster) or 2 (slower)
 * - Gravity: g: 9.81 → 1.62 (Moon) or 3.71 (Mars)
 * - Time range: [0, 10] → [0, 20] for more oscillations
 */
