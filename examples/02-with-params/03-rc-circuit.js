/**
 * Example 8: RC Circuit
 * 
 * First-order RC circuit charging
 * Demonstrates: exponential approach to steady state
 * 
 * Equation: dV/dt = (V_in - V)/(R·C)
 * Solution: V(t) = V_in + (V₀ - V_in)·e^(-t/(R·C))
 */

import { defineIVP, simulate, show, view } from 'calcplot';

// Model: RC circuit charging
const model = defineIVP({
  state: { V: 0 },           // Initial voltage (0V)
  params: { 
    V_in: 5,    // Input voltage (5V)
    R: 1000,    // Resistance (1kΩ)
    C: 0.001    // Capacitance (1mF)
  },
  derivatives: {
    V: (s, p) => (p.V_in - s.V) / (p.R * p.C)  // Charging rate
  }
});

// Simulate for 10 seconds (5 time constants)
const trajectory = simulate(model, {
  timeRange: [0, 10]
});

// Visualize the result
show(trajectory, view()
  .plot(s => s.V, { label: 'Voltage (V)' })
  .axhline(5, { linestyle: 'dashed', label: 'V_in = 5V' })
  .axis({ 
    xLabel: 'Time (s)', 
    yLabel: 'Voltage (V)'
  })
  .title('RC Circuit Charging')
);

/**
 * Try modifying:
 * - Input voltage: V_in: 5 → 3 or 12
 * - Resistance: R: 1000 → 500 (faster) or 2000 (slower)
 * - Capacitance: C: 0.001 → 0.0005 (faster) or 0.002 (slower)
 * - Initial voltage: V: 0 → 2 (pre-charged)
 */
