# CalcPlot API Documentation

## Overview

CalcPlot provides a declarative API for creating interactive mathematical visualizations. The library is designed around three main functions:

- **`show(model, config, options?)`** - Quick visualization with minimal configuration
- **`explore(model, config, options?)`** - Interactive visualization with parameter controls  
- **`compare(model, config, options?)`** - Compare multiple simulations or parameter sets

---

## Core Functions

### `defineIVP(config)`

Define an initial value problem (dynamical system model).

```typescript
interface IVPConfig {
  state: Record<string, number>;      // Initial state variables
  params: Record<string, number>;     // System parameters
  derivatives: {                      // System dynamics
    [key: string]: (state: State, params: Params) => number;
  };
  events?: {                          // Optional event handling
    [key: string]: {
      when: (state: State) => number;  // Event trigger condition (returns number, triggers when crosses zero)
      then: (state: State, params: Params) => State | null;  // Event action (null = remove event)
      once?: boolean;                  // Trigger only once
    };
  };
}

function defineIVP(config: IVPConfig): Model
```

**Note:** All functions in `derivatives` and `events` are automatically serialized for HTML embedding and client-side execution.

**Example:**
```javascript
const oscillator = defineIVP({
  state: { x: 1, v: 0 },
  params: { omega: 1, damping: 0.1 },
  derivatives: {
    x: (s) => s.v,                                    // Position derivative = velocity
    v: (s, p) => -p.omega**2 * s.x - p.damping * s.v // Velocity derivative
  },
  events: {
    bounce: {
      when: (s) => s.x,  // Trigger when x crosses zero (position = 0)
      then: (s) => ({ ...s, v: -s.v * 0.8 }),  // Reverse velocity with energy loss
      once: false
    },
    maxVelocity: {
      when: (s) => Math.abs(s.v) - 5,  // Trigger when |velocity| exceeds 5
      then: (s) => ({ ...s, v: Math.sign(s.v) * 5 }),  // Cap velocity
      once: false
    },
    stopHighEnergy: {
      when: (s) => 0.5 * s.v**2 + 0.5 * s.x**2 - 10,  // Trigger when energy > 10
      then: () => null,  // Remove event (stop simulation)
      once: true
    }
  }
});
```

### Event System Examples

**1. Bouncing Ball:**
```javascript
const bouncingBall = defineIVP({
  state: { y: 10, v: 0 },
  params: { g: 9.81, damping: 0.8 },
  derivatives: {
    y: (s) => s.v,
    v: (s, p) => -p.g
  },
  events: {
    ground: {
      when: (s) => s.y,  // Trigger when y crosses zero
      then: (s, p) => ({ y: 0, v: -s.v * p.damping }),  // Bounce with energy loss
      once: false
    }
  }
});
```

**2. Pendulum with Angle Limits:**
```javascript
const pendulum = defineIVP({
  state: { theta: 0, omega: 0 },
  params: { length: 1, gravity: 9.81 },
  derivatives: {
    theta: (s) => s.omega,
    omega: (s, p) => -(p.gravity / p.length) * Math.sin(s.theta)
  },
  events: {
    leftLimit: {
      when: (s) => s.theta + Math.PI/2,  // Trigger at -90°
      then: (s) => ({ ...s, omega: 0 }),  // Stop at limit
      once: false
    },
    rightLimit: {
      when: (s) => s.theta - Math.PI/2,  // Trigger at +90°
      then: (s) => ({ ...s, omega: 0 }),  // Stop at limit
      once: false
    }
  }
});
```

**3. Population Dynamics with Harvesting:**
```javascript
const population = defineIVP({
  state: { N: 100 },
  params: { r: 0.1, K: 1000, harvest: 50 },
  derivatives: {
    N: (s, p) => p.r * s.N * (1 - s.N/p.K) - p.harvest
  },
  events: {
    extinction: {
      when: (s) => s.N - 1,  // Trigger when population drops to 1
      then: () => null,  // Stop simulation
      once: true
    },
    overpopulation: {
      when: (s) => s.N - 900,  // Trigger when N > 900
      then: (s, p) => ({ ...s, harvest: p.harvest * 1.5 }),  // Increase harvesting
      once: false
    }
  }
});
```

### `simulate(model, config?)`

Run numerical simulation of the model.

```typescript
interface SimulateConfig {
  timeRange: [number, number];        // [t_start, t_end]
  timeStep?: number;                  // Integration step (default: 0.01)
}

// Overload 1: Simple simulation
function simulate(model: Model, config: SimulateConfig): Timeline

// Overload 2: Fluent API  
function simulate(model: Model): SimulationBuilder
```

**Examples:**

```javascript
// Simple simulation
const timeline = simulate(oscillator, {
  timeRange: [0, 10],
  timeStep: 0.01
});

// Fluent API
const timeline = simulate(oscillator)
  .initial({ x: 1, v: 0 })
  .params({ omega: 1, damping: 0.1 })
  .run({ timeRange: [0, 10], timeStep: 0.01 });
```

### `slider(min, max, value, label, options?)`

Create an interactive parameter slider.

```typescript
function slider(min: number, max: number, value: number, label: string, options?: { step?: number; scale?: 'linear' | 'log' }): SliderControl
```

**Example:**
```javascript
const dampingSlider = slider(0, 1, 0.1, 'Damping');
const frequencySlider = slider(0.1, 100, 1, 'Frequency', { scale: 'log' });
```

---

## `explore(model, config, options?)`

Create an interactive visualization of the model with parameter controls.

### Parameters

```typescript
interface ExploreConfig {
  params: Record<string, Control>;         // Interactive parameters
  initial?: (params: Params) => State;   // Initial state function
  timeRange?: [number, number];          // [t_start, t_end], default [0, 10]
  timeStep?: number;                     // Integration step, default 0.01
  view: ViewBuilder | ViewBuilder[];      // Visualization configuration
}

interface ExploreOptions {
  width?: number | string;             // Width (default: 'auto')
  height?: number | string;            // Height (default: 480)
  target?: string | HTMLElement;       // DOM element ID or element
}
```

**Basic Usage**

```javascript
explore(oscillator, {
  params: {
    damping: slider(0, 1, 0.1, 'Damping'),
    omega: slider(0.1, 3, 1, 'Frequency')
  },
  view: view()
    .plot((s) => s.x)
    .grid()
    .axis({ xLabel: 'Time', yLabel: 'Position' })
}, { target: 'viz' });
```

---

## View API

The `view()` function returns a chainable builder for creating visualizations.

### Basic Methods

#### `.plot(selector, options?)`

Plot a variable or parametric curve.

```typescript
interface PlotOptions {
  color?: string;
  lineWidth?: number;
  label?: string;
  dash?: number[];                      // Dash pattern for lines
  alpha?: number;                       // Opacity (0-1)
}
```

**Examples:**
```javascript
// Scalar plot (time series)
view()
  .plot((s) => s.x, { label: 'Position' })
  .plot((s) => s.v, { label: 'Velocity' })

// Parametric plot (phase portrait)
view()
  .plot((s) => [s.x, s.v], { lineWidth: 2 })
```

**Note:** Colors are automatically selected from a palette of 10 distinct colors. You can optionally specify colors, but it's usually not necessary.

#### `.grid(options?)`

Add background grid.

```typescript
interface GridOptions {
  color?: string;
  alpha?: number;
  spacing?: 'auto' | number;
}
```

**Example:**
```javascript
view()
  .plot((s) => s.x)
  .grid({ color: '#ccc', alpha: 0.5 })
```

#### `.axis(options?)`

Configure axes.

```typescript
interface AxisOptions {
  xLabel?: string;
  yLabel?: string;
  xLim?: [number, number];
  yLim?: [number, number];
  aspectRatio?: 'equal' | 'auto' | number;
  showTicks?: boolean;
  showLabels?: boolean;
  showSpine?: boolean;
  tickSize?: number;
  tickPadding?: number;
  labelPadding?: number;
  fontSize?: number;
  fontColor?: string;
  tickColor?: string;
  labelColor?: string;
  axisColor?: string;
  axisWidth?: number;
}
```

**Example:**
```javascript
view()
  .plot((s) => [s.x, s.v])
  .axis({ 
    xLabel: 'Position', 
    yLabel: 'Velocity',
    aspectRatio: 'equal',
    xLim: [-2, 2],
    yLim: [-2, 2],
    tickColor: '#666',
    labelColor: '#333',
    axisColor: '#333',
    showTicks: true,
    showLabels: true
  })
```

### Advanced Methods

#### `.fill(predicate, options?)`

Fill region where condition is true.

```typescript
interface FillOptions {
  color?: string;
  alpha?: number;
}

.fill(
  (state) => boolean,
  options?: FillOptions
)
```

**Examples:**
```javascript
// Highlight positive region
view()
  .plot((s) => s.x)
  .fill((s) => s.x > 0, { color: 'green', alpha: 0.2 })

// Highlight velocity regions
view()
  .plot((s) => s.v)
  .fill((s) => Math.abs(s.v) > 1, { color: 'red', alpha: 0.15 })
```

#### `.axhline(y, options?)` / `.axvline(x, options?)`

Add horizontal/vertical reference lines.

```typescript
interface RefLineOptions {
  color?: string;
  linestyle?: 'solid' | 'dashed' | 'dotted';
  linewidth?: number;
  label?: string;
}
```

**Examples:**
```javascript
view()
  .plot((s) => s.energy)
  .axhline(0, { linestyle: 'dashed', color: 'gray' })
  .axhline(1, { linestyle: 'dotted', color: 'red', label: 'Threshold' })

view()
  .plot((s) => [s.x, s.v])
  .axvline(0, { linestyle: 'dashed', color: '#ccc' })
  .axhline(0, { linestyle: 'dashed', color: '#ccc' })
```

#### `.title(text)`

Set plot title.

```javascript
view()
  .plot((s) => s.x)
  .title('Damped Harmonic Oscillator')
  .axis({ xLabel: 'Time', yLabel: 'Position' })
```

#### `.legend(options?)`

Add legend to plot.

```typescript
interface LegendOptions {
  loc?: 'upper right' | 'upper left' | 'lower right' | 'lower left' | 'center';
  frame?: boolean;
  alpha?: number;
}
```

**Example:**
```javascript
view()
  .plot((s) => s.x, { color: 'blue', label: 'Position' })
  .plot((s) => s.v, { color: 'red', label: 'Velocity' })
  .legend({ loc: 'upper right' })
```

#### `.nullcline(variable, options?)`

Add nullcline lines where derivatives are zero.

```typescript
interface NullclineOptions {
  color?: string;
  linestyle?: 'solid' | 'dashed' | 'dotted';
  linewidth?: number;
  label?: string;
}
```

**Example:**
```javascript
view()
  .nullcline('x', { color: 'blue', linestyle: 'dashed', label: 'dx/dt = 0' })
  .nullcline('v', { color: 'red', linestyle: 'dashed', label: 'dv/dt = 0' })
  .plot((s) => [s.x, s.v], { color: 'black', linewidth: 2 })
```

#### `.poincare(section, options?)`

Add Poincaré section points for analyzing dynamical systems.

```typescript
interface PoincareOptions {
  direction?: 'positive' | 'negative' | 'both';  // Crossing direction
  marker?: string;                    // Marker style ('circle' | 'cross')
  color?: string;                      // Color
  size?: number;                       // Marker size
}
```

**Example:**
```javascript
view()
  .plot((s) => [s.x, s.v], { color: 'blue', alpha: 0.3 })
  .poincare((s) => s.x, { 
    direction: 'positive',
    marker: 'circle',
    color: 'red',
    size: 6
  })
```

### Advanced Features

#### Vector Field Visualization

```javascript
view()
  .vectorField((s, p) => ({
    dx: s.v,
    dy: -p.omega**2 * s.x - p.damping * s.v
  }), {
    gridSize: 20,        // Number of vectors per axis
    color: 'gray',
    alpha: 0.6,
    normalize: true      // Normalize arrow lengths
  })
  .plot((s) => [s.x, s.v], { color: 'red', linewidth: 2 })
  .axis({ 
    xLabel: 'Position', 
    yLabel: 'Velocity',
    aspectRatio: 'equal' 
  })
```

#### Nullclines

```javascript
view()
  .nullcline('x', { color: 'blue', linestyle: 'dashed', label: 'dx/dt = 0' })
  .nullcline('v', { color: 'red', linestyle: 'dashed', label: 'dv/dt = 0' })
  .plot((s) => [s.x, s.v], { color: 'black', linewidth: 2 })
```

#### Poincaré Sections

```javascript
// Poincaré section at x = 0
view()
  .plot((s) => [s.x, s.v], { color: 'blue', alpha: 0.3 })
  .poincare((s) => s.x, { 
    direction: 'positive',
    marker: 'circle',
    color: 'red',
    size: 6
  })

// Zero crossings of velocity
view()
  .plot((s) => s.v, { color: 'green' })
  .poincare((s) => s.v, { 
    direction: 'both',
    marker: 'cross',
    color: 'orange',
    size: 4
  })
```

#### Phase Portraits

```javascript
view()
  .phase((s) => [s.x, s.v], { color: 'purple', lineWidth: 2 })
  .grid()
  .axis({ 
    xLabel: 'Position', 
    yLabel: 'Velocity',
    aspectRatio: 'equal' 
  })
  .title('Phase Portrait')
```

#### Custom Scene Drawing

```javascript
view()
  .scene((ctx, state) => {
    // Draw pendulum bob
    ctx.circle([state.x, state.y], 0.1, { 
      fill: 'red', 
      stroke: 'darkred', 
      width: 2 
    });
    
    // Draw pendulum rod
    ctx.line([0, 0], [state.x, state.y], { 
      width: 3, 
      color: 'black' 
    });
  })
  .plot((s) => [s.x, s.v], { color: 'blue', alpha: 0.3 })
```

---

## Complete Examples

### Example 1: Simple Pendulum

```javascript
const pendulum = defineIVP({
  state: { theta: 0.5, omega: 0 },
  params: { g: 9.81, L: 1, damping: 0.1 },
  derivatives: {
    theta: (s) => s.omega,
    omega: (s, p) => -(p.g / p.L) * Math.sin(s.theta) - p.damping * s.omega
  }
});

explore(pendulum, {
  params: {
    theta0: slider(0, Math.PI, 0.5, 'Initial Angle (rad)'),
    damping: slider(0, 0.5, 0.1, 'Damping')
  },
  initial: (p) => ({ theta: p.theta0, omega: 0 }),
  view: [
    view()
      .plot((s) => s.theta, { color: 'blue', label: 'θ(t)' })
      .grid()
      .axis({ xLabel: 'Time (s)', yLabel: 'Angle (rad)' })
      .title('Damped Pendulum'),
    
    view()
      .plot((s) => [s.theta, s.omega], { color: 'purple' })
      .axhline(0, { linestyle: 'dashed', color: 'gray' })
      .axvline(0, { linestyle: 'dashed', color: 'gray' })
      .grid()
      .axis({ 
        xLabel: 'θ (rad)', 
        yLabel: 'ω (rad/s)',
        aspectRatio: 'equal'
      })
      .title('Phase Portrait')
  ]
}, { target: 'pendulum-viz' });
```

### Example 2: Lotka-Volterra (Predator-Prey)

```javascript
const lotkavolterra = defineIVP({
  state: { prey: 40, predator: 9 },
  params: { alpha: 0.1, beta: 0.02, gamma: 0.4, delta: 0.02 },
  derivatives: {
    prey: (s, p) => p.alpha * s.prey - p.beta * s.prey * s.predator,
    predator: (s, p) => p.delta * s.prey * s.predator - p.gamma * s.predator
  }
});

explore(lotkavolterra, {
  params: {
    alpha: slider(0.05, 0.2, 0.1, 'Prey growth rate'),
    beta: slider(0.01, 0.05, 0.02, 'Predation rate'),
    gamma: slider(0.2, 0.6, 0.4, 'Predator death rate'),
    delta: slider(0.01, 0.05, 0.02, 'Predator efficiency')
  },
  timeRange: [0, 200],
  view: [
    view()
      .plot((s) => s.prey, { color: 'green', label: 'Prey' })
      .plot((s) => s.predator, { color: 'red', label: 'Predator' })
      .legend({ loc: 'upper right' })
      .grid()
      .axis({ xLabel: 'Time', yLabel: 'Population' }),
    
    view()
      .plot((s) => [s.prey, s.predator], { color: 'purple', linewidth: 1.5 })
      .grid()
      .axis({ 
        xLabel: 'Prey', 
        yLabel: 'Predator',
        aspectRatio: 'equal' 
      })
      .title('Phase Space')
  ]
}, { target: 'ecosystem' });
```

### Example 3: Van der Pol Oscillator

```javascript
const vanderpol = defineIVP({
  state: { x: 2, v: 0 },
  params: { mu: 1 },
  derivatives: {
    x: (s) => s.v,
    v: (s, p) => p.mu * (1 - s.x**2) * s.v - s.x
  }
});

explore(vanderpol, {
  params: {
    mu: slider(0.1, 5, 1, 'Nonlinearity μ', { step: 0.1 }),
    x0: slider(-3, 3, 2, 'Initial x₀'),
    v0: slider(-3, 3, 0, 'Initial v₀')
  },
  initial: (p) => ({ x: p.x0, v: p.v0 }),
  timeRange: [0, 30],
  view: [
    view()
      .plot((s) => [s.x, s.v], { color: 'blue', linewidth: 2 })
      .vectorField((s, p) => ({
        dx: s.v,
        dy: p.mu * (1 - s.x**2) * s.v - s.x
      }), { gridSize: 15, color: 'lightgray', normalize: true })
      .grid()
      .axis({ 
        xLabel: 'x', 
        yLabel: 'dx/dt',
        aspectRatio: 'equal',
        xLim: [-3, 3],
        yLim: [-3, 3]
      })
      .title('Van der Pol Phase Portrait')
  ]
}, { target: 'vanderpol' });
```

### Example 4: Damped Oscillator with Energy Analysis

```javascript
const oscillator = defineIVP({
  state: { x: 1, v: 0 },
  params: { omega: 1, damping: 0.1 },
  derivatives: {
    x: (s) => s.v,
    v: (s, p) => -p.omega**2 * s.x - p.damping * s.v
  }
});

explore(oscillator, {
  params: {
    damping: slider(0, 0.5, 0.1, 'Damping'),
    omega: slider(0.5, 2, 1, 'Frequency')
  },
  view: [
    view()
      .plot((s) => s.x, { color: 'blue', label: 'Position' })
      .plot((s) => s.v, { color: 'red', label: 'Velocity' })
      .grid()
      .axis({ xLabel: 'Time', yLabel: 'Value' })
      .title('Oscillator Dynamics')
      .legend({ loc: 'upper right' }),
    
    view()
      .plot((s) => 0.5 * s.v**2 + 0.5 * s.x**2, { color: 'green', label: 'Total Energy' })
      .plot((s) => 0.5 * s.v**2, { color: 'orange', label: 'Kinetic Energy' })
      .plot((s) => 0.5 * s.x**2, { color: 'purple', label: 'Potential Energy' })
      .grid()
      .axis({ xLabel: 'Time', yLabel: 'Energy' })
      .title('Energy Analysis')
      .legend({ loc: 'upper right' }),
    
    view()
      .plot((s) => [s.x, s.v], { color: 'purple', lineWidth: 2 })
      .fill((s) => 0.5 * s.v**2 + 0.5 * s.x**2 > 1, { color: 'red', alpha: 0.1 })
      .axhline(0, { linestyle: 'dashed', color: 'gray' })
      .axvline(0, { linestyle: 'dashed', color: 'gray' })
      .grid()
      .axis({ 
        xLabel: 'Position', 
        yLabel: 'Velocity',
        aspectRatio: 'equal' 
      })
      .title('Phase Portrait with Energy Regions')
  ]
}, { target: 'oscillator-analysis' });
```

---

## Design Principles

1. **Declarative**: Describe what you want, not how to compute it
2. **Composable**: Chain methods to build complex visualizations
3. **Reactive**: Automatically updates when parameters change
4. **Matplotlib-inspired**: Familiar API for scientific computing users
5. **Lightweight**: ~35 KB total (15 KB lib + 20 KB D3 modules)
6. **Function Serialization**: All functions (derivatives, events, selectors) are automatically serialized for HTML embedding and client-side execution
7. **RK4 Integration**: High-accuracy 4th-order Runge-Kutta integration with event detection and hybrid system support

## Type Definitions

```typescript
// Core types
interface State {
  [key: string]: number;
}

interface Params {
  [key: string]: number;
}

interface SliderControl {
  type: 'slider';
  label: string;
  default: number;
  min: number;
  max: number;
  step?: number;
  scale?: 'linear' | 'log';
}

interface CheckboxControl {
  type: 'checkbox';
  label: string;
  default: boolean;
}

type Control = SliderControl | CheckboxControl;

interface Model {
  state: Record<string, number>;
  params: Record<string, number>;
  derivatives: Record<string, (state: State, params: Params) => number>;
  events?: Record<string, {
    when: (state: State) => number;
    then: (state: State, params: Params) => State | null;
    once?: boolean;
  }>;
}

interface Timeline {
  times: number[];
  states: Record<string, number[]>;
  at: (time: number) => State;
  serialize: () => string;
}

interface SimulationOptions {
  timeRange?: [number, number];
  timeStep?: number;
  tolerance?: number;
  params?: Params;
}

// View configuration
interface ViewConfig {
  layers: Layer[];
}

// View options interfaces
interface PlotOptions {
  color?: string;
  lineWidth?: number;
  label?: string;
  alpha?: number;
}

interface GridOptions {
  color?: string;
  alpha?: number;
  spacing?: 'auto' | number;
}

interface AxisOptions {
  xLabel?: string;
  yLabel?: string;
  xLim?: [number, number];
  yLim?: [number, number];
  aspectRatio?: 'equal' | 'auto' | number;
  showTicks?: boolean;
  showLabels?: boolean;
  showSpine?: boolean;
  tickSize?: number;
  tickPadding?: number;
  labelPadding?: number;
  fontSize?: number;
  fontColor?: string;
  tickColor?: string;
  labelColor?: string;
  axisColor?: string;
  axisWidth?: number;
}

interface FillOptions {
  color?: string;
  alpha?: number;
}

interface RefLineOptions {
  color?: string;
  linestyle?: 'solid' | 'dashed' | 'dotted';
  linewidth?: number;
  label?: string;
}

interface LegendOptions {
  loc?: 'upper right' | 'upper left' | 'lower right' | 'lower left' | 'center';
  frame?: boolean;
  alpha?: number;
}

interface NullclineOptions {
  color?: string;
  linestyle?: 'solid' | 'dashed' | 'dotted';
  linewidth?: number;
  label?: string;
}

interface PoincareOptions {
  direction?: 'positive' | 'negative' | 'both';
  marker?: string;
  color?: string;
  size?: number;
}

interface VectorFieldOptions {
  gridSize?: number;
  color?: string;
  alpha?: number;
  normalize?: boolean;
  scale?: number;
}

// Export everything
export {
  defineIVP,
  simulate,
  explore,
  show,
  compare,
  view,
  slider
};
```
