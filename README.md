# calcplot

> Interactive numerical simulations with beautiful visualizations for TypeScript/JavaScript

Declarative API for solving differential equations and creating interactive plots - inspired by Mathematica's Manipulate and SageMath's @interact, but lightweight and web-native.

## Features

- 🧮 **RK4 Solver** with automatic event detection (zero-crossing with bisection)
- 📊 **Composable visualizations** - scenes, plots, vectors, multiple views
- 🎛️ **Interactive controls** - sliders update simulations in real-time
- 🚀 **Works everywhere** - Deno Jupyter, Node.js, browser
- 📦 **Self-contained output** - generates single HTML file with everything embedded
- 🎨 **Smart defaults** - auto-calculated bounds

## Installation
```bash
npm install calcplot
# or
deno add calcplot
```

## Quick Start
```typescript
import { defineIVP, explore, slider, view } from "npm:calcplot";

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

---

## API Overview

### Core Functions

- `defineIVP(config)` - Define initial value problem
- `explore(model, config)` - Interactive exploration with controls
- `show(timeline, view)` - Static visualization (no controls)
- `simulate(model)` - Programmatic simulation

### Controls

- `slider(min, max, default, label?, step?)`
- `checkbox(default, label?)`

### View Builders

- `canvas(options?)` - Create canvas view
- `plot(selector, options?)` - Add plot layer
- `scene(drawFn)` - Custom drawing
- `grid(options?)` - Grid layer
- `axis(options?)` - Axes with labels
- `vector(at, dir, options?)` - Arrow vectors
- `marker(at, options?)` - Point marker

### Draw Context (in `scene()`)

- `ctx.line(from, to, options?)`
- `ctx.circle(center, radius, options?)`
- `ctx.arrow(from, to, options?)`
- `ctx.text(pos, text, options?)`
- `ctx.rect(topLeft, width, height, options?)`

---

## Comparison

| Feature | calcplot | SciPy | Mathematica | SageMath |
|---------|----------|-------|-------------|----------|
| Language | TypeScript/JS | Python | Wolfram | Python |
| ODE Solver | ✅ RK4 | ✅ Many | ✅ Many | ✅ Many |
| Event Detection | ✅ Built-in | ✅ Manual | ✅ Built-in | ⚠️ Limited |
| Interactive UI | ✅ Auto | ❌ Manual | ✅ Manipulate | ✅ @interact |
| Visualization | ✅ Built-in | ❌ Separate | ✅ Built-in | ✅ Built-in |
| Web Native | ✅ Yes | ❌ No | ❌ Desktop | ❌ Server |
| Output | HTML file | Code | Notebook | Notebook |
| License | MIT | BSD | Proprietary | GPL |

---

## Development
```bash
# Install
npm install

# Build client runtime
npm run build

# Watch mode
npm run dev

# Run examples
npm run example
```

---

## License

MIT © Vadim Kudriavtsev