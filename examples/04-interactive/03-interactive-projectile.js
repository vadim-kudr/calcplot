/**
 * Example 17: Interactive Projectile Motion
 * 
 * Interactive projectile launcher with angle and velocity controls
 * Demonstrates: explore() with parametric plots, physics simulation
 * 
 * Equations: dx/dt = v₀·cos(θ), dy/dt = v₀·sin(θ) - g·t
 * Parameters: launch angle θ, initial velocity v₀
 */

import { defineIVP, explore, view, slider } from 'calcplot';

// Model: projectile motion
const model = defineIVP({
  state: { 
    x: 0,    // Initial x position
    y: 0,    // Initial y position
    vx: 0,   // Initial x velocity
    vy: 0    // Initial y velocity
  },
  params: { 
    v0: 20,      // Initial velocity (m/s)
    angle: 45,   // Launch angle (degrees)
    g: 9.81      // Gravity
  },
  derivatives: {
    x: (s) => s.vx,                    // x changes with vx
    y: (s) => s.vy,                    // y changes with vy
    vx: (s) => 0,                       // vx is constant (no air resistance)
    vy: (s, p) => -p.g                   // vy changes due to gravity
  }
});

// Interactive exploration with parametric plot
explore(model, {
  params: {
    v0: slider(5, 50, 20, 'Initial Velocity (m/s)'),
    angle: slider(0, 90, 45, 'Launch Angle (degrees)'),
    g: slider(1, 20, 9.81, 'Gravity (m/s²)')
  },
  initial: (p) => ({ 
    x: 0, 
    y: 0, 
    vx: p.v0 * Math.cos(p.angle * Math.PI / 180),
    vy: p.v0 * Math.sin(p.angle * Math.PI / 180)
  }),
  timeRange: [0, 5],
  view: view()
    .plot(s => [s.x, s.y], { label: 'Trajectory' })
    .axis({ 
      xLabel: 'Distance (m)', 
      yLabel: 'Height (m)',
      aspectRatio: 'equal'
    })
    .grid()
    .title('Interactive Projectile Motion')
});

/**
 * Try modifying:
 * - Initial velocity: v0 slider 5-50 m/s
 * - Launch angle: angle slider 0-90° (45° = max range)
 * - Gravity: g slider 1-20 (Moon: 1.62, Mars: 3.71, Jupiter: 24.79)
 * - Time range: [0, 5] → [0, 10] for longer flights
 */
