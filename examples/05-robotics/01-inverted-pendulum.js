/**
 * Example 20: Inverted Pendulum Control
 * 
 * Interactive inverted pendulum with stabilization control
 * Demonstrates: robotics control systems, feedback control, stability
 * 
 * Equations: 
 * dθ/dt = ω
 * dω/dt = (g/L)·sin(θ) + (u/mL²)·cos(θ) - γ·ω
 * Control: u = -k₁·θ - k₂·ω (PD controller)
 */

import { defineIVP, explore, view, slider } from 'calcplot';

// Model: inverted pendulum with PD control
const model = defineIVP({
  state: { 
    theta: 0.1,    // Initial angle from vertical (radians)
    omega: 0       // Initial angular velocity
  },
  params: { 
    L: 1,          // Pendulum length (m)
    m: 1,          // Mass (kg)
    g: 9.81,       // Gravity (m/s²)
    k1: 50,        // Proportional gain
    k2: 10,        // Derivative gain
    gamma: 0.1     // Damping coefficient
  },
  derivatives: {
    theta: (s) => s.omega,
    omega: (s, p) => {
      // PD control torque
      const u = -p.k1 * s.theta - p.k2 * s.omega;
      // Pendulum dynamics with control
      return (p.g / p.L) * Math.sin(s.theta) + (u / (p.m * p.L**2)) * Math.cos(s.theta) - p.gamma * s.omega;
    }
  }
});

// Interactive exploration with control gains
explore(model, {
  params: {
    k1: slider(0, 100, 50, 'Proportional Gain (k₁)'),
    k2: slider(0, 20, 10, 'Derivative Gain (k₂)'),
    theta0: slider(-0.5, 0.5, 0.1, 'Initial Angle (rad)'),
    L: slider(0.5, 2, 1, 'Pendulum Length (m)')
  },
  initial: (p) => ({ theta: p.theta0, omega: 0 }),
  timeRange: [0, 5],
  view: [
    // Angle and angular velocity over time
    view()
      .plot(s => s.theta, { label: 'Angle (rad)' })
      .plot(s => s.omega, { label: 'Angular Velocity' })
      .axhline(0, { linestyle: 'dashed', color: 'gray', label: 'θ = 0' })
      .axis({ 
        xLabel: 'Time (s)', 
        yLabel: 'Value'
      })
      .grid()
      .title('Inverted Pendulum Stabilization'),
    
    // Phase portrait
    view()
      .plot(s => [s.theta, s.omega], { label: 'Trajectory' })
      .axis({ 
        xLabel: 'Angle (rad)', 
        yLabel: 'Angular Velocity',
        aspectRatio: 'equal'
      })
      .grid()
      .title('Phase Space')
  ]
});

/**
 * Try modifying:
 * - Control gains: k₁ (stiffness), k₂ (damping)
 * - Initial disturbance: theta0 slider
 * - Pendulum length: L slider (affects dynamics)
 * - Try to find optimal gains for fast stabilization
 */
