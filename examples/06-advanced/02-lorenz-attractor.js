/**
 * Example 26: Lorenz Attractor
 * 
 * Interactive Lorenz chaotic system
 * Demonstrates: chaos theory, strange attractors, sensitive dependence
 * 
 * Lorenz Equations:
 * dx/dt = σ·(y - x)
 * dy/dt = x·(ρ - z) - y
 * dz/dt = x·y - β·z
 * Classic parameters: σ=10, ρ=28, β=8/3
 */

import { defineIVP, explore, view, slider } from 'calcplot';

// Model: Lorenz attractor
const model = defineIVP({
  state: { 
    x: 1,    // Initial x
    y: 1,    // Initial y
    z: 1     // Initial z
  },
  params: { 
    sigma: 10,    // Prandtl number
    rho: 28,      // Rayleigh number
    beta: 8/3     // Geometric factor
  },
  derivatives: {
    x: (s, p) => p.sigma * (s.y - s.x),
    y: (s, p) => s.x * (p.rho - s.z) - s.y,
    z: (s, p) => s.x * s.y - p.beta * s.z
  }
});

// Interactive exploration with 3D projections
explore(model, {
  params: {
    sigma: slider(5, 20, 10, 'σ (Prandtl Number)'),
    rho: slider(10, 50, 28, 'ρ (Rayleigh Number)'),
    beta: slider(0.1, 3, 8/3, 'β (Geometric Factor)'),
    x0: slider(-20, 20, 1, 'Initial X'),
    y0: slider(-20, 20, 1, 'Initial Y'),
    z0: slider(0, 40, 1, 'Initial Z')
  },
  initial: (p) => ({ x: p.x0, y: p.y0, z: p.z0 }),
  timeRange: [0, 50],
  view: [
    // X-Y projection
    view()
      .plot(s => [s.x, s.y], { label: 'X-Y Projection' })
      .axis({ 
        xLabel: 'X', 
        yLabel: 'Y'
      })
      .grid()
      .title('Lorenz Attractor (X-Y)'),
    
    // X-Z projection
    view()
      .plot(s => [s.x, s.z], { label: 'X-Z Projection' })
      .axis({ 
        xLabel: 'X', 
        yLabel: 'Z'
      })
      .grid()
      .title('Lorenz Attractor (X-Z)'),
    
    // Y-Z projection
    view()
      .plot(s => [s.y, s.z], { label: 'Y-Z Projection' })
      .axis({ 
        xLabel: 'Y', 
        yLabel: 'Z'
      })
      .grid()
      .title('Lorenz Attractor (Y-Z)')
  ]
});

/**
 * Try modifying:
 * - σ slider: affects stretching/folding (chaos intensity)
 * - ρ slider: critical parameter (ρ < 24.74 = stable, > 24.74 = chaotic)
 * - β slider: affects attractor shape
 * - Initial conditions: small changes lead to vastly different trajectories
 * - Try ρ = 28 for classic butterfly attractor
 */
