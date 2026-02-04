/**
 * Example 25: SIR Epidemic Model
 * 
 * Interactive SIR (Susceptible-Infected-Recovered) epidemic model
 * Demonstrates: epidemiological modeling, disease dynamics, herd immunity
 * 
 * Equations:
 * dS/dt = -β·S·I/N
 * dI/dt = β·S·I/N - γ·I
 * dR/dt = γ·I
 * Where: β = infection rate, γ = recovery rate, N = total population
 */

import { defineIVP, explore, view, slider } from 'calcplot';

// Model: SIR epidemic
const model = defineIVP({
  state: { 
    S: 990,    // Susceptible population
    I: 10,     // Infected population
    R: 0       // Recovered population
  },
  params: { 
    N: 1000,   // Total population
    beta: 0.3, // Infection rate
    gamma: 0.1  // Recovery rate
  },
  derivatives: {
    S: (s, p) => -p.beta * s.S * s.I / p.N,           // Susceptible decrease
    I: (s, p) => p.beta * s.S * s.I / p.N - p.gamma * s.I, // Infected change
    R: (s, p) => p.gamma * s.I                           // Recovered increase
  }
});

// Interactive exploration with epidemic parameters
explore(model, {
  params: {
    beta: slider(0.1, 1.0, 0.3, 'Infection Rate (β)'),
    gamma: slider(0.05, 0.5, 0.1, 'Recovery Rate (γ)'),
    I0: slider(1, 100, 10, 'Initial Infected'),
    N: slider(100, 10000, 1000, 'Total Population')
  },
  initial: (p) => ({ S: p.N - p.I0, I: p.I0, R: 0 }),
  timeRange: [0, 100],
  view: [
    // Population dynamics over time
    view()
      .plot(s => s.S, { color: 'blue', label: 'Susceptible' })
      .plot(s => s.I, { color: 'red', label: 'Infected' })
      .plot(s => s.R, { color: 'green', label: 'Recovered' })
      .axis({ 
        xLabel: 'Time (days)', 
        yLabel: 'Population'
      })
      .grid()
      .title('SIR Epidemic Model'),
    
    // Phase space: Infected vs Susceptible
    view()
      .plot(s => [s.S, s.I], { color: 'purple', label: 'Epidemic Curve' })
      .axis({ 
        xLabel: 'Susceptible', 
        yLabel: 'Infected'
      })
      .grid()
      .title('Epidemic Phase Space')
  ]
});

/**
 * Try modifying:
 * - Infection rate: β slider (how easily disease spreads)
 * - Recovery rate: γ slider (how quickly people recover)
 * - Initial infected: I0 slider (outbreak size)
 * - Total population: N slider (affects herd immunity threshold)
 * - Basic reproduction number: R₀ = β/γ (should be >1 for epidemic)
 */
