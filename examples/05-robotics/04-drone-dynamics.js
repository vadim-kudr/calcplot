/**
 * Example 23: Quadrotor Drone Dynamics
 * 
 * Interactive quadrotor drone with altitude and attitude control
 * Demonstrates: aerospace dynamics, multi-variable control, stability
 * 
 * Equations:
 * Altitude: z̈ = (T/m)·cos(θ)·cos(φ) - g
 * Pitch: θ̈ = τ_θ / I_y
 * Roll: φ̈ = τ_φ / I_x
 * Control: T (thrust), τ_θ, τ_φ (torques)
 */

import { defineIVP, explore, view, slider } from 'calcplot';

// Model: simplified quadrotor drone (altitude only)
const model = defineIVP({
  state: { 
    z: 1,      // Altitude (m)
    vz: 0      // Vertical velocity
  },
  params: { 
    m: 1,      // Mass (kg)
    g: 9.81,   // Gravity (m/s²)
    T: 12      // Thrust force (N) - > mg for climb
  },
  derivatives: {
    z: (s) => s.vz,
    vz: (s, p) => (p.T / p.m) - p.g
  }
});

// Interactive exploration with altitude control
explore(model, {
  params: {
    T: slider(8, 20, 12, 'Thrust (N)'), // Start above hover
    z0: slider(0.5, 2, 1, 'Initial Altitude (m)')
  },
  initial: (p) => ({ z: p.z0, vz: 0 }),
  timeRange: [0, 5],
  view: [
    // Altitude over time
    view()
      .plot(s => s.z, { label: 'Altitude (m)' })
      .plot(s => s.vz, { label: 'Vertical Velocity (m/s)' })
      .axhline(0, { linestyle: 'dashed', color: 'gray', label: 'Ground Level' })
      .axis({ 
        xLabel: 'Time (s)', 
        yLabel: 'Value'
      })
      .grid()
      .title('Quadrotor Altitude Control'),
    
    // Phase portrait of altitude
    view()
      .plot(s => [s.z, s.vz], { label: 'Altitude Dynamics' })
      .axis({ 
        xLabel: 'Altitude (m)', 
        yLabel: 'Vertical Velocity (m/s)'
      })
      .grid()
      .title('Altitude Phase Space')
  ]
});

/**
 * Try modifying:
 * - Thrust: T slider (T > mg = climb, T < mg = descent)
 * - Pitch/Roll torques: for attitude control
 * - Initial altitude: z0 slider
 * - Try to maintain stable hover (T ≈ 9.81N)
 * - Try maneuvers with torque control
 */
