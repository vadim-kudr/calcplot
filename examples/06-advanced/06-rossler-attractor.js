/**
 * Example 30: Rössler Attractor
 * 
 * Interactive Rössler chaotic system
 * Demonstrates: chaos theory, 3D attractors, strange attractors
 * 
 * Rössler Equations:
 * dx/dt = -y - z
 * dy/dt = x + a·y
 * dz/dt = b + z·(x - c)
 * Classic parameters: a=0.2, b=0.2, c=5.7
 */

import { defineIVP, explore, view, slider } from 'calcplot';

// Model: Rössler attractor
const model = defineIVP({
  state: { 
    x: 1,    // Initial x
    y: 1,    // Initial y
    z: 1     // Initial z
  },
  params: { 
    a: 0.2,  // First parameter
    b: 0.2,  // Second parameter
    c: 5.7   // Third parameter (chaos threshold)
  },
  derivatives: {
    x: (s, p) => -s.y - s.z,
    y: (s, p) => s.x + p.a * s.y,
    z: (s, p) => p.b + s.z * (s.x - p.c)
  }
});

// Interactive exploration with 3D projections
explore(model, {
  params: {
    a: slider(0.1, 0.5, 0.2, 'Parameter a'),
    b: slider(0.1, 0.5, 0.2, 'Parameter b'),
    c: slider(3, 10, 5.7, 'Parameter c'),
    x0: slider(-10, 10, 1, 'Initial X'),
    y0: slider(-10, 10, 1, 'Initial Y'),
    z0: slider(0, 20, 1, 'Initial Z')
  },
  initial: (p) => ({ x: p.x0, y: p.y0, z: p.z0 }),
  timeRange: [0, 100],
  view: [
    // X-Y projection
    view()
      .plot(s => [s.x, s.y], { label: 'X-Y Projection' })
      .axis({ 
        xLabel: 'X', 
        yLabel: 'Y'
      })
      .grid()
      .title('Rössler Attractor (X-Y)'),
    
    // X-Z projection
    view()
      .plot(s => [s.x, s.z], { label: 'X-Z Projection' })
      .axis({ 
        xLabel: 'X', 
        yLabel: 'Z'
      })
      .grid()
      .title('Rössler Attractor (X-Z)'),
    
    // Y-Z projection
    view()
      .plot(s => [s.y, s.z], { label: 'Y-Z Projection' })
      .axis({ 
        xLabel: 'Y', 
        yLabel: 'Z'
      })
      .grid()
      .title('Rössler Attractor (Y-Z)')
  ]
});

/**
 * Try modifying:
 * - Parameter c: chaos threshold (c < 4.2 = periodic, c > 4.2 = chaotic)
 * - Parameter a: affects spiral stretching
 * - Parameter b: affects attractor size
 * - Initial conditions: sensitive dependence on initial state
 * - Try c = 5.7 for classic chaotic attractor
 * - Compare with Lorenz: simpler spiral structure
 */
