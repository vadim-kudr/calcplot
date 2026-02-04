# Harmonic Oscillator Simulation

Static simulation and visualization of harmonic oscillator behavior with predefined parameters.

## Mathematical Background

The harmonic oscillator model demonstrates periodic motion:
- **State variables**: position (x) and velocity (v)
- **Equations**: dx/dt = v, dv/dt = -ω²·x - ζ·v
- **Analytical solution**: x(t) = A·e^(-ζt)·cos(ωt + φ)

## Simulation Demo

```js exec
import { defineIVP, simulate, show, view } from 'calcplot';

// Define harmonic oscillator model
const oscillatorModel = defineIVP({
  state: { x: 1, v: 0 },
  params: { omega: 1, damping: 0.2 },
  derivatives: {
    x: (s) => s.v,
    v: (s, p) => -p.omega * p.omega * s.x - p.damping * s.v
  }
});

// Simulate oscillator trajectory - correct fluent API usage
const trajectory = simulate(oscillatorModel)
  .initial({ x: 1, v: 0 })
  .params({ omega: 1, damping: 0.2 })
  .run({ maxTime: 15, dt: 0.05 });

// Create timeline object for view
const timeline = {
  times: trajectory.times || [],
  states: trajectory.states || { x: [], v: [] }
};

// Create ViewBuilder objects
const positionView = view()
  .plot((s) => s.x, { label: 'Position' })
  .plot((s) => s.v, { label: 'Velocity' })
  .grid()
  .axis({ xLabel: 'Time (s)', yLabel: 'Value' });

const phaseView = view()
  .plot((s) => [s.x, s.v], { label: 'Phase Space' })
  .grid()
  .axis({ xLabel: 'Position', yLabel: 'Velocity', aspectRatio: 'equal' });

// Display using show with correct format: (timeline, [viewBuilder1, viewBuilder2])
await show(timeline, [positionView, phaseView]);
```
