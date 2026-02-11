/**
 * Example 19: Interactive Predator-Prey Model
 * 
 * Interactive Lotka-Volterra predator-prey dynamics
 * Demonstrates: explore() with ecological models, phase space
 * 
 * Equations: 
 * dPrey/dt = α·Prey - β·Prey·Predator
 * dPredator/dt = δ·Prey·Predator - γ·Predator
 */

import { defineIVP, explore, view, slider } from 'calcplot';

// Model: Lotka-Volterra predator-prey
const model = defineIVP({
  state: { 
    prey: 40,      // Initial prey population
    predator: 9    // Initial predator population
  },
  params: { 
    alpha: 0.1,    // Prey growth rate
    beta: 0.02,    // Predation rate
    gamma: 0.4,    // Predator death rate
    delta: 0.01    // Predator efficiency
  },
  derivatives: {
    prey: (s, p) => p.alpha * s.prey - p.beta * s.prey * s.predator,
    predator: (s, p) => p.delta * s.prey * s.predator - p.gamma * s.predator
  }
});

// Interactive exploration with multiple views
explore(model, {
  params: {
    alpha: slider(0.05, 0.2, 0.1, 'Prey Growth Rate (α)'),
    beta: slider(0.01, 0.05, 0.02, 'Predation Rate (β)'),
    gamma: slider(0.2, 0.6, 0.4, 'Predator Death Rate (γ)'),
    delta: slider(0.005, 0.02, 0.01, 'Predator Efficiency (δ)')
  },
  initial: (p) => ({ prey: 40, predator: 9 }),
  timeRange: [0, 200],
  view: [
    // Population dynamics over time
    view()
      .plot(s => s.prey, { color: 'green', label: 'Prey' })
      .plot(s => s.predator, { color: 'red', label: 'Predator' })
      .axis({ 
        xLabel: 'Time', 
        yLabel: 'Population'
      })
      .grid()
      .title('Population Dynamics'),
    
    // Phase space
    view()
      .plot(s => [s.prey, s.predator], { color: 'purple', label: 'Trajectory' })
      .axis({ 
        xLabel: 'Prey Population', 
        yLabel: 'Predator Population',
        aspectRatio: 'equal'
      })
      .grid()
      .title('Phase Space')
  ]
});

/**
 * Try modifying:
 * - Prey growth rate: α slider (faster prey reproduction)
 * - Predation rate: β slider (hunting efficiency)
 * - Predator death rate: γ slider (predator mortality)
 * - Predator efficiency: δ slider (conversion efficiency)
 */
