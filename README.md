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
import { defineIVP, explore, view, slider } from 'calcplot';

// Model: nonlinear pendulum
const model = defineIVP({
  state: { 
    theta: 0.5,    // Initial angle (radians)
    omega: 0       // Initial angular velocity
  },
  params: { 
    L: 1,          // Length (meters)
    g: 9.81        // Gravity (m/s²)
  },
  derivatives: {
    theta: (s) => s.omega,                    // Angle changes with angular velocity
    omega: (s, p) => -(p.g / p.L) * Math.sin(s.theta)  // Angular acceleration
  }
});

// Interactive exploration with multiple views
explore(model, {
  params: {
    L: slider(0.1, 3, 1, 'Pendulum Length (m)'),
    g: slider(1, 20, 9.81, 'Gravity (m/s²)'),
    theta0: slider(-Math.PI, Math.PI, 0.5, 'Initial Angle (rad)'),
    omega0: slider(-5, 5, 0, 'Initial Angular Velocity')
  },
  initial: (p) => ({ theta: p.theta0, omega: p.omega0 }),
  timeRange: [0, 10],
  view: [
    // Time series view
    view()
      .plot(s => s.theta, { label: 'Angle' })
      .plot(s => s.omega, { label: 'Angular Velocity' })
      .axis({ 
        xLabel: 'Time (s)', 
        yLabel: 'Value'
      })
      .grid()
      .title('Pendulum Motion'),
    
    // Phase portrait view
    view()
      .plot(s => [s.theta, s.omega], { label: 'Trajectory' })
      .axis({ 
        xLabel: 'Angle (rad)', 
        yLabel: 'Angular Velocity',
        aspectRatio: 'equal'
      })
      .grid()
      .title('Phase Portrait')
  ]
});
```

![Interactive Pendulum Demo](assets/interactive_pendulum.png)

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