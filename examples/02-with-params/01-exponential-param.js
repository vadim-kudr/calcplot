/**
 * Example 6: Exponential Growth with Parameter
 * 
 * Same exponential growth but with parameter k
 * Demonstrates: using params in models, parameter control
 * 
 * Equation: dx/dt = k·x
 * Solution: x(t) = x₀·e^(k·t)
 */

import { defineIVP, simulate, show, view } from 'calcplot';

// Model: exponential growth with parameter k
const model = defineIVP({
  state: { x: 1 },           // Initial value
  params: { k: 0.5 },       // Growth rate parameter
  derivatives: {
    x: (s, p) => p.k * s.x   // Growth: dx/dt = k·x
  }
});

// Simulate with specific parameter value
const trajectory = simulate(model, {
  params: { k: 0.8 },        // Override parameter
  timeRange: [0, 10]
});

// Visualize the result
show(trajectory, view()
  .plot(s => s.x, { label: 'Population' })
  .axis({ 
    xLabel: 'Time', 
    yLabel: 'Value'
  })
  .title('Exponential Growth: dx/dt = 0.8·x')
);

/**
 * Try modifying:
 * - Growth rate: k: 0.8 → 0.2 (slower) or 1.5 (faster)
 * - Initial value: x: 1 → 0.5 or 2
 * - Time range: [0, 10] → [0, 20] for longer growth
 */
