/**
 * Example 16: Interactive Pendulum
 * 
 * Interactive pendulum with adjustable length and gravity
 * Demonstrates: explore() with physics simulation, multiple views
 * 
 * Equation: d²θ/dt² = -(g/L)·sin(θ)
 * Parameters: pendulum length L, gravity g
 */

import { defineIVP, explore, view, slider } from 'calcplot';

// Model: nonlinear pendulum
const model = defineIVP({
  state: { 
    theta: 0.5,    // Initial angle (radians)
    omega: 0       // Initial angular velocity
  },
  params: { 
    L: 1,          // Length (meters)
    g: 9.81        // Gravity (m/s²)
  },
  derivatives: {
    theta: (s) => s.omega,                    // Angle changes with angular velocity
    omega: (s, p) => -(p.g / p.L) * Math.sin(s.theta)  // Angular acceleration
  }
});

// Interactive exploration with multiple views
explore(model, {
  params: {
    L: slider(0.1, 3, 1, 'Pendulum Length (m)'),
    g: slider(1, 20, 9.81, 'Gravity (m/s²)'),
    theta0: slider(-Math.PI, Math.PI, 0.5, 'Initial Angle (rad)'),
    omega0: slider(-5, 5, 0, 'Initial Angular Velocity')
  },
  initial: (p) => ({ theta: p.theta0, omega: p.omega0 }),
  timeRange: [0, 10],
  view: [
    // Time series view
    view()
      .plot(s => s.theta, { label: 'Angle' })
      .plot(s => s.omega, { label: 'Angular Velocity' })
      .axis({ 
        xLabel: 'Time (s)', 
        yLabel: 'Value'
      })
      .grid()
      .title('Pendulum Motion'),
    
    // Phase portrait view
    view()
      .plot(s => [s.theta, s.omega], { label: 'Trajectory' })
      .axis({ 
        xLabel: 'Angle (rad)', 
        yLabel: 'Angular Velocity',
        aspectRatio: 'equal'
      })
      .grid()
      .title('Phase Portrait')
  ]
});

/**
 * Try modifying:
 * - Pendulum length: L slider 0.1-3m (shorter = faster)
 * - Gravity: g slider 1-20 (try Moon: 1.62, Mars: 3.71)
 * - Initial angle: theta0 slider -π to π (small angles ≈ linear)
 * - Initial angular velocity: omega0 slider -5 to 5
 */
