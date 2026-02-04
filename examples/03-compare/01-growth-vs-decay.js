/**
 * Example 11: Growth vs Decay
 * 
 * Comparing exponential growth and decay
 * Demonstrates: compare() function, multiple trajectories
 * 
 * Equations: dx/dt = 0.5·x (growth) vs dx/dt = -0.5·x (decay)
 * Solutions: x(t) = x₀·e^(0.5t) vs x(t) = x₀·e^(-0.5t)
 */

import { defineIVP, simulate, compare, view } from 'calcplot';

// Model: exponential growth/decay with parameter k
const model = defineIVP({
  state: { x: 1 },           // Initial value
  params: { k: 0.5 },       // Growth/decay rate
  derivatives: {
    x: (s, p) => p.k * s.x   // Growth/decay: dx/dt = k·x
  }
});

// Simulate both growth and decay
const growthTrajectory = simulate(model, {
  params: { k: 0.5 },        // Positive rate = growth
  timeRange: [0, 10]
});

const decayTrajectory = simulate(model, {
  params: { k: -0.5 },       // Negative rate = decay
  timeRange: [0, 10]
});

// Compare both trajectories
compare({
  'Growth': growthTrajectory,
  'Decay': decayTrajectory
}, view()
  .plot(s => s.Growth_x, { label: 'Growth (k=0.5)' })
  .plot(s => s.Decay_x, { label: 'Decay (k=-0.5)' })
  .axis({ 
    xLabel: 'Time', 
    yLabel: 'Value'
  })
  .title('Exponential Growth vs Decay')
);

/**
 * Try modifying:
 * - Growth rate: k: 0.5 → 1.0 (faster growth) or 0.2 (slower)
 * - Decay rate: k: -0.5 → -1.0 (faster decay) or -0.2 (slower)
 * - Initial value: x: 1 → 2 or 0.5
 * - Time range: [0, 10] → [0, 20] for longer observation
 */
