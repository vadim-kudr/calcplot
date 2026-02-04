/**
 * Example 27: Driven Damped Oscillator (Resonance)
 * 
 * Interactive driven oscillator showing resonance phenomenon
 * Demonstrates: forced oscillations, resonance, frequency response
 * 
 * Equation: d²x/dt² + 2γ·dx/dt + ω₀²·x = A·cos(ω·t)
 * Where: γ = damping, ω₀ = natural frequency, A = driving amplitude, ω = driving frequency
 */

import { defineIVP, explore, view, slider } from 'calcplot';

// Model: driven damped oscillator (simplified)
const model = defineIVP({
  state: { 
    x: 0,    // Position
    v: 0     // Velocity
  },
  params: { 
    omega0: 2 * Math.PI,  // Natural frequency (1 Hz)
    gamma: 0.1,           // Damping coefficient
    A: 1,                // Driving amplitude
    omega: 2 * Math.PI   // Driving frequency
  },
  derivatives: {
    x: (s) => s.v,
    v: (s, p) => -2 * p.gamma * s.v - p.omega0**2 * s.x + p.A * Math.cos(p.omega * 0) // Simplified: cos(0) = 1
  }
});

// Interactive exploration with frequency sweep
explore(model, {
  params: {
    omega0: slider(Math.PI, 4 * Math.PI, 2 * Math.PI, 'Natural Frequency (ω₀)'),
    gamma: slider(0.01, 1, 0.1, 'Damping (γ)'),
    A: slider(0.1, 5, 1, 'Driving Amplitude (A)'),
    omega: slider(Math.PI, 4 * Math.PI, 2 * Math.PI, 'Driving Frequency (ω)')
  },
  initial: (p) => ({ x: 0, v: 0 }),
  timeRange: [0, 20],
  view: [
    // Oscillation over time
    view()
      .plot(s => s.x, { label: 'Position' })
      .plot(s => s.v, { label: 'Velocity' })
      .axis({ 
        xLabel: 'Time (s)', 
        yLabel: 'Value'
      })
      .grid()
      .title('Driven Oscillator Response'),
    
    // Phase portrait
    view()
      .plot(s => [s.x, s.v], { label: 'Phase Trajectory' })
      .axis({ 
        xLabel: 'Position', 
        yLabel: 'Velocity',
        aspectRatio: 'equal'
      })
      .grid()
      .title('Phase Portrait')
  ]
});

/**
 * Try modifying:
 * - Driving frequency: ω slider (resonance when ω ≈ ω₀)
 * - Damping: γ slider (lower damping = sharper resonance)
 * - Natural frequency: ω₀ slider (changes resonance point)
 * - Amplitude: A slider (driving force strength)
 * - Find resonance: set ω ≈ ω₀ and observe maximum response
 */
