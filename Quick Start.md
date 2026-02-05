# CalcPlot Quick Start

CalcPlot is a library for interactive mathematical visualization. Get started in 5 minutes!

## 🚀 Quick Start

### 1. Define a Model

```javascript
import { defineIVP, explore, view, slider } from './index.js';

// Harmonic oscillator model
const oscillator = defineIVP({
  state: { x: 1, v: 0 },           // Initial state
  params: { omega: 1, damping: 0.1 }, // Parameters
  derivatives: {
    x: (s) => s.v,                                    // dx/dt = v
    v: (s, p) => -p.omega**2 * s.x - p.damping * s.v  // dv/dt
  }
});
```

### 2. Create Interactive Visualization

```javascript
explore(oscillator, {
  params: {
    damping: slider(0, 1, 0.1, 'Damping'),
    omega: slider(0.1, 3, 1, 'Frequency')
  },
  view: view()
    .plot((s) => s.x, { label: 'Position' })
    .plot((s) => s.v, { label: 'Velocity' })
    .grid()
    .axis('Time', 'Position')  // Shorthand notation
}, { target: 'viz' });
```

## 📊 Core Functions

### `defineIVP(config)`
Creates a mathematical model.

```javascript
const model = defineIVP({
  state: { x: 1, y: 2 },      // Initial values
  params: { a: 0.5, b: 1 },   // Model parameters
  derivatives: {
    x: (s, p) => p.a * s.x,   // dx/dt = a*x
    y: (s, p) => p.b * s.y    // dy/dt = b*y
  }
});
```

### `explore(model, config, options?)`
Interactive visualization with parameters.

```javascript
explore(model, {
  params: { a: slider(0, 2, 0.5, 'Parameter a') },
  view: view().plot((s) => s.x)
});
```

### `show(model, config, options?)`
Quick visualization without parameters.

```javascript
show(model, {
  view: view().plot((s) => s.x).grid()
});
```

### `compare(models, config, options?)`
Compare multiple models.

```javascript
compare([model1, model2], {
  view: view().plot((s) => s.x),
  labels: ['Model 1', 'Model 2']
});
```

## 🎨 Visualization

### Basic Plot
```javascript
view()
  .plot((s) => s.x)                    // Time series
  .plot((s) => [s.x, s.y])             // Phase portrait
  .plot((s, p) => s.x * p.amplitude)   // With parameter
```

### Axis Configuration
```javascript
view()
  .plot((s) => s.x)
  .axis('Time', 'Position')           // Shorthand
  .axis({ xLabel: 'Time', yLabel: 'Position' })  // Full
  .axis('equal')                      // Equal aspect ratio
  .axis({ aspectRatio: 'equal' })
```

### Grid and Styling
```javascript
view()
  .plot((s) => s.x)
  .grid()                             // Default grid
  .grid({ color: '#ccc', alpha: 0.5 }) // Custom
  .title('Plot Title')
  .legend({ loc: 'upper right' })
```

## 🎛️ Working with Parameters

### Parameter Flow Logic
1. **model.params** - default parameters
2. **explore.params** - interactive controls (override model.params)
3. **initial(p)** - function receives merged parameters

```javascript
const model = defineIVP({
  params: { omega: 1, damping: 0.1 }  // Defaults
});

explore(model, {
  params: {
    damping: slider(0, 1, 0.2, 'Damping')  // Overrides model.damping
    // omega: 1 (uses from model.params)
  },
  initial: (p) => ({ x: 1, v: 0 }),  // p = { omega: 1, damping: 0.2 }
  view: view().plot((s) => s.x)
});
```

### Control Types
```javascript
slider(min, max, default, label, { step?, scale? })
// scale: 'linear' | 'log'
```

## 📈 Advanced Features

### Vector Fields
```javascript
view()
  .vectorField((s, p) => ({
    dx: s.v,
    dy: -(p.omega**2) * s.x - p.damping * s.v
  }))
  .plot((s) => [s.x, s.v])
```

### Nullclines
```javascript
view()
  .nullcline('x', { color: 'blue' })    // dx/dt = 0
  .nullcline('y', { color: 'red' })     // dy/dt = 0
  .plot((s) => [s.x, s.y])
```

### Fill Regions
```javascript
view()
  .plot((s) => s.x)
  .fill((s) => s.x > 0, { color: 'green', alpha: 0.2 })
```

### Poincaré Sections
```javascript
view()
  .plot((s) => [s.x, s.v])
  .poincare((s) => s.x, { direction: 'positive' })
```

## 📱 Multiple Plots

```javascript
explore(model, {
  view: [
    view().plot((s) => s.x).title('Position'),
    view().plot((s) => s.v).title('Velocity'),
    view().plot((s) => [s.x, s.v]).title('Phase Portrait')
  ]
});
```

## 🔗 Full Documentation

- **API.md** - Complete API reference
- **src/core/types.ts** - Core types (State, Params, Model)
- **src/lib/types.ts** - Visualization types
- **src/lib/controls.ts** - Control types

## 💡 Tips

1. **Start with `show()`** for quick visualization
2. **Use `explore()`** for interactivity
3. **Axis shortcuts**: `axis('x', 'y')`, `axis('equal')`
4. **Functions**: `(s) => s.x` for state, `(s, p) => s.x * p.k` for parameters
5. **Multiple views** automatically arranged in grid

Ready! Now you can create interactive mathematical visualizations.
