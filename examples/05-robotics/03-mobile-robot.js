/**
 * Example 22: Mobile Robot Kinematics
 * 
 * Interactive differential drive mobile robot
 * Demonstrates: robot kinematics, path planning, motion control
 * 
 * Equations:
 * ẋ = v·cos(θ)
 * ẏ = v·sin(θ)  
 * θ̇ = ω
 * Control: v, ω from path tracking
 */

import { defineIVP, explore, view, slider } from 'calcplot';

// Model: differential drive mobile robot
const model = defineIVP({
  state: { 
    x: 0,      // Robot x position
    y: 0,      // Robot y position
    theta: 0   // Robot orientation
  },
  params: { 
    v: 1,      // Linear velocity (m/s)
    omega: 0.5 // Angular velocity (rad/s)
  },
  derivatives: {
    x: (s, p) => p.v * Math.cos(s.theta),
    y: (s, p) => p.v * Math.sin(s.theta),
    theta: (s, p) => p.omega
  }
});

// Interactive exploration with different motion patterns
explore(model, {
  params: {
    v: slider(0, 3, 1, 'Linear Velocity (m/s)'),
    omega: slider(-2, 2, 0.5, 'Angular Velocity (rad/s)'),
    theta0: slider(-Math.PI, Math.PI, 0, 'Initial Orientation (rad)')
  },
  initial: (p) => ({ x: 0, y: 0, theta: p.theta0 }),
  timeRange: [0, 10],
  view: [
    // Robot trajectory
    view()
      .plot(s => [s.x, s.y], { label: 'Robot Path' })
      .axis({ 
        xLabel: 'X Position (m)', 
        yLabel: 'Y Position (m)',
        aspectRatio: 'equal'
      })
      .grid()
      .title('Mobile Robot Trajectory'),
    
    // Orientation over time
    view()
      .plot(s => s.theta, { label: 'Orientation (rad)' })
      .plot(s => s.x, { label: 'X Position' })
      .plot(s => s.y, { label: 'Y Position' })
      .axis({ 
        xLabel: 'Time (s)', 
        yLabel: 'Value'
      })
      .grid()
      .title('Robot State Evolution')
  ]
});

/**
 * Try modifying:
 * - Linear velocity: v slider (speed of movement)
 * - Angular velocity: omega slider (turning rate)
 * - Initial orientation: theta0 slider
 * - Try circular motion (v > 0, ω ≠ 0)
 * - Try straight line (ω = 0)
 * - Try spinning in place (v = 0, ω ≠ 0)
 */
