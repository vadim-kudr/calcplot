/**
 * Example 24: 2-DOF Robotic Arm
 * 
 * Interactive 2-DOF planar robotic arm manipulator
 * Demonstrates: robot kinematics, workspace, joint control
 * 
 * Forward Kinematics:
 * x = L₁·cos(θ₁) + L₂·cos(θ₁ + θ₂)
 * y = L₁·sin(θ₁) + L₂·sin(θ₁ + θ₂)
 * Joint control with PD controllers
 */

import { defineIVP, explore, view, slider } from 'calcplot';

// Model: 2-DOF robotic arm with joint control
const model = defineIVP({
  state: { 
    theta1: 0,     // Joint 1 angle
    omega1: 0,    // Joint 1 angular velocity
    theta2: 0,     // Joint 2 angle
    omega2: 0     // Joint 2 angular velocity
  },
  params: { 
    L1: 1,        // Link 1 length (m)
    L2: 0.8,      // Link 2 length (m)
    m1: 1,        // Link 1 mass (kg)
    m2: 0.5,      // Link 2 mass (kg)
    g: 9.81,      // Gravity (m/s²)
    k1: 50,       // Joint 1 PD gain
    k2: 30        // Joint 2 PD gain
  },
  derivatives: {
    theta1: (s) => s.omega1,
    omega1: (s, p) => {
      // PD control for joint 1
      const target1 = Math.PI / 4; // Target angle
      const error1 = target1 - s.theta1;
      const control1 = p.k1 * error1 - 5 * s.omega1;
      
      // Simplified dynamics (ignoring coupling)
      return control1 / (p.m1 * p.L1**2 / 3);
    },
    theta2: (s) => s.omega2,
    omega2: (s, p) => {
      // PD control for joint 2
      const target2 = Math.PI / 6; // Target angle
      const error2 = target2 - s.theta2;
      const control2 = p.k2 * error2 - 3 * s.omega2;
      
      // Simplified dynamics
      return control2 / (p.m2 * p.L2**2 / 3);
    }
  }
});

// Interactive exploration with arm kinematics
explore(model, {
  params: {
    L1: slider(0.5, 2, 1, 'Link 1 Length (m)'),
    L2: slider(0.3, 1.5, 0.8, 'Link 2 Length (m)'),
    k1: slider(10, 100, 50, 'Joint 1 Control Gain'),
    k2: slider(10, 80, 30, 'Joint 2 Control Gain'),
    theta1_0: slider(-Math.PI, Math.PI, 0, 'Initial Joint 1 (rad)'),
    theta2_0: slider(-Math.PI, Math.PI, 0, 'Initial Joint 2 (rad)')
  },
  initial: (p) => ({ 
    theta1: p.theta1_0, omega1: 0, 
    theta2: p.theta2_0, omega2: 0 
  }),
  timeRange: [0, 3],
  view: [
    // Joint angles over time
    view()
      .plot(s => s.theta1, { label: 'Joint 1 (rad)' })
      .plot(s => s.theta2, { label: 'Joint 2 (rad)' })
      .axhline(Math.PI/4, { linestyle: 'dashed', color: 'blue', label: 'Target θ₁' })
      .axhline(Math.PI/6, { linestyle: 'dashed', color: 'red', label: 'Target θ₂' })
      .axis({ 
        xLabel: 'Time (s)', 
        yLabel: 'Joint Angle (rad)'
      })
      .grid()
      .title('Robotic Arm Joint Control'),
    
    // End-effector trajectory
    view()
      .plot(s => {
        const L1 = 1; // Default link length
        const L2 = 0.8; // Default link length
        return [
          L1 * Math.cos(s.theta1) + L2 * Math.cos(s.theta1 + s.theta2),
          L1 * Math.sin(s.theta1) + L2 * Math.sin(s.theta1 + s.theta2)
        ];
      }, { label: 'End-Effector Path' })
      .axis({ 
        xLabel: 'X Position (m)', 
        yLabel: 'Y Position (m)',
        aspectRatio: 'equal'
      })
      .grid()
      .title('End-Effector Workspace')
  ]
});

/**
 * Try modifying:
 * - Link lengths: L1, L2 sliders (affects workspace)
 * - Control gains: k1, k2 sliders (response speed)
 * - Initial joint angles: theta1_0, theta2_0 sliders
 * - Observe how link lengths affect reachable workspace
 * - Try different control gains for faster/slower response
 */
