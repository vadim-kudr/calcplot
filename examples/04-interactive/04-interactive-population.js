/**
 * Example 18: Interactive Population Dynamics
 * 
 * Interactive logistic growth model with carrying capacity
 * Demonstrates: explore() with biological models, equilibrium analysis
 * 
 * Equation: dP/dt = r·P·(1 - P/K)
 * Parameters: growth rate r, carrying capacity K
 */

import { defineIVP, explore, view, slider } from 'calcplot';

// Model: logistic population growth
const model = defineIVP({
  state: { 
    P: 10    // Initial population
  },
  params: { 
    r: 0.5,   // Growth rate
    K: 100    // Carrying capacity
  },
  derivatives: {
    P: (s, p) => p.r * s.P * (1 - s.P / p.K)  // Logistic growth
  }
});

// Interactive exploration with equilibrium lines
explore(model, {
  params: {
    r: slider(0.1, 2, 0.5, 'Growth Rate (r)'),
    K: slider(20, 200, 100, 'Carrying Capacity (K)'),
    P0: slider(1, 50, 10, 'Initial Population')
  },
  initial: (p) => ({ P: p.P0 }),
  timeRange: [0, 20],
  view: view()
    .plot(s => s.P, { label: 'Population' })
    .axhline(0, { linestyle: 'dashed', color: 'gray', label: 'P = 0' })
    .axhline(100, { linestyle: 'dashed', color: 'red', label: 'P = K' })
    .axis({ 
      xLabel: 'Time', 
      yLabel: 'Population'
    })
    .grid()
    .title('Interactive Population Dynamics')
});

/**
 * Try modifying:
 * - Growth rate: r slider 0.1-2 (higher = faster growth)
 * - Carrying capacity: K slider 20-200 (environment limit)
 * - Initial population: P0 slider 1-50
 * - Time range: [0, 20] → [0, 50] for longer observation
 */
