/**
 * Example 28: Double Pendulum
 * 
 * Interactive double pendulum showing chaotic dynamics
 * Demonstrates: chaos, sensitive dependence, complex dynamics
 * 
 * Equations (simplified):
 * θ₁̈ = complex function of θ₁, θ₂, θ₁̇, θ₂̇
 * θ₂̈ = complex function of θ₁, θ₂, θ₁̇, θ₂̇
 * Small changes lead to vastly different behavior
 */

import { defineIVP, explore, view, slider } from 'calcplot';

// Model: double pendulum (simplified)
const model = defineIVP({
  state: { 
    theta1: Math.PI/2,  // First pendulum angle
    omega1: 0,         // First pendulum angular velocity
    theta2: Math.PI/2,  // Second pendulum angle
    omega2: 0          // Second pendulum angular velocity
  },
  params: { 
    L1: 1,      // First pendulum length
    L2: 1,      // Second pendulum length
    m1: 1,      // First pendulum mass
    m2: 1,      // Second pendulum mass
    g: 9.81     // Gravity
  },
  derivatives: {
    theta1: (s) => s.omega1,
    omega1: (s, p) => {
      // Simplified double pendulum dynamics
      const delta = s.theta2 - s.theta1;
      const den1 = (p.m1 + p.m2) * p.L1 - p.m2 * p.L1 * Math.cos(delta) * Math.cos(delta);
      const num1 = -p.m2 * p.L1 * s.omega1 * s.omega1 * Math.sin(delta) * Math.cos(delta)
        + p.m2 * p.g * Math.sin(s.theta2) * Math.cos(delta)
        + p.m2 * p.L2 * s.omega2 * s.omega2 * Math.sin(delta)
        - (p.m1 + p.m2) * p.g * Math.sin(s.theta1);
      return num1 / den1;
    },
    theta2: (s) => s.omega2,
    omega2: (s, p) => {
      const delta = s.theta2 - s.theta1;
      const den1 = (p.m1 + p.m2) * p.L1 - p.m2 * p.L1 * Math.cos(delta) * Math.cos(delta);
      const den2 = (p.L2 / p.L1) * den1;
      const num2 = -p.m2 * p.L2 * s.omega2 * s.omega2 * Math.sin(delta)
        + (p.m1 + p.m2) * p.g * Math.sin(s.theta1) * Math.sin(delta)
        - (p.m1 + p.m2) * p.L1 * s.omega1 * s.omega1 * Math.sin(delta)
        - (p.m1 + p.m2) * p.g * Math.sin(s.theta2);
      return num2 / den2;
    }
  }
});

// Interactive exploration with chaos
explore(model, {
  params: {
    L1: slider(0.5, 2, 1, 'Pendulum 1 Length (m)'),
    L2: slider(0.5, 2, 1, 'Pendulum 2 Length (m)'),
    m1: slider(0.5, 2, 1, 'Pendulum 1 Mass (kg)'),
    m2: slider(0.5, 2, 1, 'Pendulum 2 Mass (kg)'),
    theta1_0: slider(0, Math.PI, Math.PI/2, 'Initial θ₁ (rad)'),
    theta2_0: slider(0, Math.PI, Math.PI/2, 'Initial θ₂ (rad)')
  },
  initial: (p) => ({ 
    theta1: p.theta1_0, omega1: 0, 
    theta2: p.theta2_0, omega2: 0 
  }),
  timeRange: [0, 10],
  view: [
    // Pendulum angles over time
    view()
      .plot(s => s.theta1, { label: 'Pendulum 1' })
      .plot(s => s.theta2, { label: 'Pendulum 2' })
      .axis({ 
        xLabel: 'Time (s)', 
        yLabel: 'Angle (rad)'
      })
      .grid()
      .title('Double Pendulum Angles'),
    
    // Phase space of first pendulum
    view()
      .plot(s => [s.theta1, s.omega1], { label: 'Pendulum 1' })
      .plot(s => [s.theta2, s.omega2], { label: 'Pendulum 2' })
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
 * - Length ratio: L1 vs L2 (affects coupling)
 * - Mass ratio: m1 vs m2 (affects energy transfer)
 * - Initial angles: small changes lead to chaos
 * - Try symmetric case: L1 = L2, m1 = m2
 * - Observe sensitive dependence on initial conditions
 */
