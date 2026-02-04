/**
 * Example 14: Projectile Trajectories
 * 
 * Comparing projectile motion at different launch angles
 * Demonstrates: compare() with parametric plots [x, y]
 * 
 * Equations: dx/dt = v₀·cos(θ), dy/dt = v₀·sin(θ) - g·t
 * Solutions: Parabolic trajectories
 */

import { defineIVP, simulate, compare, view } from 'calcplot';

// Projectile motion model
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

// Simulate different launch angles
const angle30 = simulate(model)
  .params({ angle: 30, v0: 20 })
  .initial({ 
    x: 0, 
    y: 0, 
    vx: 20 * Math.cos(30 * Math.PI / 180),   // v₀·cos(θ)
    vy: 20 * Math.sin(30 * Math.PI / 180)    // v₀·sin(θ)
  })
  .run({ timeRange: [0, 3] });

const angle45 = simulate(model)
  .params({ angle: 45, v0: 20 })
  .initial({ 
    x: 0, 
    y: 0, 
    vx: 20 * Math.cos(45 * Math.PI / 180),   // v₀·cos(θ)
    vy: 20 * Math.sin(45 * Math.PI / 180)    // v₀·sin(θ)
  })
  .run({ timeRange: [0, 3] });

const angle60 = simulate(model)
  .params({ angle: 60, v0: 20 })
  .initial({ 
    x: 0, 
    y: 0, 
    vx: 20 * Math.cos(60 * Math.PI / 180),   // v₀·cos(θ)
    vy: 20 * Math.sin(60 * Math.PI / 180)    // v₀·sin(θ)
  })
  .run({ timeRange: [0, 3] });

// Compare trajectories (parametric plot)
compare({
  'Angle30': angle30,
  'Angle45': angle45,
  'Angle60': angle60
}, view()
  .plot(s => [s.Angle30_x, s.Angle30_y], { label: '30°' })
  .plot(s => [s.Angle45_x, s.Angle45_y], { label: '45°' })
  .plot(s => [s.Angle60_x, s.Angle60_y], { label: '60°' })
  .axis({ 
    xLabel: 'Distance (m)', 
    yLabel: 'Height (m)',
    aspectRatio: 'equal'
  })
  .title('Projectile Trajectories (v₀ = 20 m/s)')
);

/**
 * Try modifying:
 * - Initial velocity: v0: 20 → 10 (slower) or 30 (faster)
 * - Launch angles: 30°, 45°, 60° → 15°, 75°, 90°
 * - Gravity: g: 9.81 → 1.62 (Moon) or 3.71 (Mars)
 * - Time range: [0, 3] → [0, 5] for longer flights
 */
