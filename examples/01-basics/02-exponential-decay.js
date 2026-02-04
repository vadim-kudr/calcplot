/**
 * Example 2: Exponential Decay
 * 
 * Negative growth rate: dx/dt = -k·x
 * Demonstrates: parameters in models, decay processes
 * 
 * Equation: dx/dt = -0.3·x
 * Solution: x(t) = x₀·e^(-0.3t)
 */

import { defineIVP, simulate, show, view } from 'calcplot';

// Model: exponential decay with parameter k
const model = defineIVP({
  state: { x: 10 },          // Initial amount
  params: { k: 0.3 },        // Decay rate parameter
  derivatives: {
    x: (s, p) => -p.k * s.x  // Decay: dx/dt = -k·x
  }
});

// Simulate from t=0 to t=15
const trajectory = simulate(model, {
  timeRange: [0, 15]
});

// Visualize the result
show(trajectory, view()
  .plot(s => s.x, { label: 'Amount' })
  .axis({ 
    xLabel: 'Time', 
    yLabel: 'Amount'
  })
  .title('Exponential Decay: dx/dt = -0.3·x')
);

/**
 * Try modifying:
 * - Decay rate: k: 0.3 → 0.1 (slower decay) or 0.8 (faster decay)
 * - Initial amount: 10 → 5 or 20
 * - Add horizontal line at y=0 to see asymptote
 */
