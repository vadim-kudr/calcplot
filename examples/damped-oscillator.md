# Damped Harmonic Oscillator

Interactive exploration of damped harmonic oscillator dynamics with real-time parameter adjustment.

## Mathematical Background

The damped harmonic oscillator follows the differential equation:
- **Position**: dx/dt = v
- **Velocity**: dv/dt = -ω²·x - ζ·v
- **Parameters**: angular frequency (ω) and damping coefficient (ζ)

## Interactive Demo

```js exec
import { defineIVP, explore, view, slider } from 'calcplot';

const oscillatorModel = defineIVP({
  state: { x: 1, v: 0 },
  params: { omega: 1, damping: 0.2 },
  derivatives: {
    x: (s) => s.v,
    v: (s, p) => -p.omega * p.omega * s.x - p.damping * s.v
  }
});

explore(
  oscillatorModel,
  {
    params: {
      amplitude: slider(0.1, 2, 1, 'Initial Amplitude'),
      omega: slider(0.5, 3, 1, 'Angular Frequency (rad/s)'),
      damping: slider(0, 1, 0.2, 'Damping Coefficient')
    },

    initial: (p) => ({
      x: p.amplitude,
      v: 0
    }),

    view: [
      // First view: position and velocity over time
      view()
        .plot((s) => s.x, { label: 'Position' })
        .plot((s) => s.v, { label: 'Velocity' })
        .grid()
        .axis({ xLabel: 'Time (s)', yLabel: 'Value' }),

      // Second view: phase space
      view()
        .plot((s) => [s.x, s.v], { label: 'Phase Space' })
        .grid()
        .axis({ xLabel: 'Position', yLabel: 'Velocity', aspectRatio: 'equal' })
    ]
  }
);
```
