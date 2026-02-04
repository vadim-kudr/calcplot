/**
 * Example 21: Cart-Pole System
 * 
 * Interactive cart-pole (inverted pendulum on cart) system
 * Demonstrates: underactuated robotics, coupled dynamics, control challenges
 * 
 * Equations:
 * Cart: ẍ = (F + mL·θ̈·cos(θ) - mL·θ̇²·sin(θ)) / (M + m)
 * Pole: θ̈ = (-g·sin(θ) - θ̈·cos(θ)) / L
 */

import { defineIVP, explore, view, slider } from 'calcplot';

// Model: cart-pole system
const model = defineIVP({
  state: { 
    x: 0,      // Cart position
    vx: 0,     // Cart velocity
    theta: 0.1, // Pole angle from vertical
    omega: 0    // Pole angular velocity
  },
  params: { 
    M: 1,      // Cart mass (kg)
    m: 0.1,    // Pole mass (kg)
    L: 1,      // Pole length (m)
    g: 9.81,   // Gravity (m/s²)
    F: 0       // Control force on cart
  },
  derivatives: {
    x: (s) => s.vx,
    vx: (s, p) => {
      // Simplified control: F = -k₁·x - k₂·θ - k₃·vx - k₄·ω
      const k1 = 10, k2 = 50, k3 = 5, k4 = 10;
      const control = -k1 * s.x - k2 * s.theta - k3 * s.vx - k4 * s.omega;
      
      // Cart acceleration (simplified dynamics)
      return (control + p.m * p.L * s.omega * s.omega * Math.sin(s.theta)) / (p.M + p.m);
    },
    theta: (s) => s.omega,
    omega: (s, p) => {
      // Pole angular acceleration
      const k1 = 10, k2 = 50, k3 = 5, k4 = 10;
      const control = -k1 * s.x - k2 * s.theta - k3 * s.vx - k4 * s.omega;
      const ax = (control + p.m * p.L * s.omega * s.omega * Math.sin(s.theta)) / (p.M + p.m);
      
      return (-p.g * Math.sin(s.theta) - ax * Math.cos(s.theta)) / p.L;
    }
  }
});

// Interactive exploration
explore(model, {
  params: {
    M: slider(0.5, 5, 1, 'Cart Mass (kg)'),
    m: slider(0.05, 0.5, 0.1, 'Pole Mass (kg)'),
    L: slider(0.5, 2, 1, 'Pole Length (m)'),
    theta0: slider(-0.3, 0.3, 0.1, 'Initial Pole Angle (rad)')
  },
  initial: (p) => ({ x: 0, vx: 0, theta: p.theta0, omega: 0 }),
  timeRange: [0, 5],
  view: [
    // Cart position and pole angle
    view()
      .plot(s => s.x, { label: 'Cart Position (m)' })
      .plot(s => s.theta, { label: 'Pole Angle (rad)' })
      .axhline(0, { linestyle: 'dashed', color: 'gray', label: 'Equilibrium' })
      .axis({ 
        xLabel: 'Time (s)', 
        yLabel: 'Value'
      })
      .grid()
      .title('Cart-Pole System'),
    
    // Phase portrait of pole
    view()
      .plot(s => [s.theta, s.omega], { label: 'Pole Dynamics' })
      .axis({ 
        xLabel: 'Pole Angle (rad)', 
        yLabel: 'Angular Velocity',
        aspectRatio: 'equal'
      })
      .grid()
      .title('Pole Phase Space')
  ]
});

/**
 * Try modifying:
 * - Mass ratio: M (cart) vs m (pole)
 * - Pole length: L slider (affects control difficulty)
 * - Initial disturbance: theta0 slider
 * - Observe how mass ratio affects stability
 */
