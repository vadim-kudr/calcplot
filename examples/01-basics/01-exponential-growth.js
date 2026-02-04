/**
 * Example 1: Exponential Growth
 * 
 * The simplest differential equation: dx/dt = k·x
 * Demonstrates: basic model definition, simulation, visualization
 * 
 * Equation: dx/dt = 0.5·x
 * Solution: x(t) = x₀·e^(0.5t)
 */

import { defineIVP, simulate, show, view } from 'calcplot';

// Model: exponential growth with rate k = 0.5
const model = defineIVP({
  state: { x: 1 },           // Initial value
  derivatives: {
    x: (s) => 0.5 * s.x      // Growth rate: dx/dt = 0.5·x
  }
});

// Simulate from t=0 to t=10
const trajectory = simulate(model, {
  timeRange: [0, 10]
});

// Visualize the result
show(trajectory, view()
  .plot(s => s.x, { label: 'Population' })
  .axis({ 
    xLabel: 'Time', 
    yLabel: 'Value'
  })
  .title('Exponential Growth: dx/dt = 0.5·x')
);

/**
 * Try modifying:
 * - Change growth rate: 0.5 → 0.2 (slower) or 1.0 (faster)
 * - Initial value: 1 → 0.1 or 10
 * - Time range: [0, 10] → [0, 20] for longer growth
 */
