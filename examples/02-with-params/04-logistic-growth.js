/**
 * Example 9: Logistic Growth
 * 
 * Population growth with carrying capacity
 * Demonstrates: S-shaped curve, steady states
 * 
 * Equation: dN/dt = r·N·(1 - N/K)
 * Solution: N(t) = K/(1 + ((K/N₀) - 1)·e^(-rt))
 */

import { defineIVP, simulate, show, view } from 'calcplot';

// Model: logistic population growth
const model = defineIVP({
  state: { N: 10 },          // Initial population
  params: { 
    r: 0.5,    // Growth rate
    K: 100     // Carrying capacity
  },
  derivatives: {
    N: (s, p) => p.r * s.N * (1 - s.N / p.K)  // Logistic growth
  }
});

// Simulate for 30 time units
const trajectory = simulate(model, {
  timeRange: [0, 30]
});

// Visualize the result
show(trajectory, view()
  .plot(s => s.N, { label: 'Population' })
  .axhline(100, { linestyle: 'dashed', label: 'K = 100' })
  .axis({ 
    xLabel: 'Time', 
    yLabel: 'Population'
  })
  .title('Logistic Growth: S-Curve')
);

/**
 * Try modifying:
 * - Growth rate: r: 0.5 → 0.2 (slower) or 1.0 (faster)
 * - Carrying capacity: K: 100 → 50 or 200
 * - Initial population: N: 10 → 1 or 50
 * - Time range: [0, 30] → [0, 50] for longer observation
 */
