# CalcPlot API Documentation

## Overview

CalcPlot provides a declarative API for creating interactive mathematical visualizations of differential equations and dynamical systems.

### Three Main Visualization Functions:
- **`explore(model, config, options?)`** - Interactive exploration with parameter controls
- **`show(timeline, viewConfig, options?)`** - Quick visualization of simulation results  
- **`compare(timelines, viewConfig, options?)`** - Compare multiple simulations side-by-side

### Core Modeling Functions:
- **`defineIVP(config)`** - Define differential equation models
- **`simulate(model, config?)`** - Run numerical simulations
- **`view(timeline?)`** - Build visualization configurations

### UI Controls:
- **`slider(min, max, defaultValue, label, step?)`** - Interactive parameter sliders
- **`checkbox(label, defaultValue?)`** - Boolean toggle controls

## Core Functions

### `defineIVP(config)`

Defines an Initial Value Problem (IVP) model for differential equations.

```typescript
interface IVPConfig {
  state: Record<string, number>;      // Initial state variables
  params: Record<string, number>;     // System parameters
  derivatives: {                      // System dynamics
    [key: string]: (state: State, params: Params) => number;
  };
  events?: {                          // Optional event handling
    [key: string]: {
      when: (state: State) => number;
      then: (state: State, params: Params) => State | null;
      once?: boolean;
    };
  };
}

function defineIVP(config: IVPConfig): Model
```

**Parameters:**
- `config.state` - Initial values for state variables (e.g., `{x: 1, v: 0}`)
- `config.params` - System parameters (e.g., `{omega: 1, damping: 0.1}`)
- `config.derivatives` - Functions defining derivatives for each state variable
- `config.events` - Optional event handlers for discrete events

**Returns:** A complete model object ready for simulation

**Example:**
```javascript
// Simple harmonic oscillator
const oscillator = defineIVP({
  state: { x: 1, v: 0 },           // Initial position and velocity
  params: { omega: 1, damping: 0.1 }, // Natural frequency and damping
  derivatives: {
    x: (s) => s.v,                                    // dx/dt = velocity
    v: (s, p) => -p.omega**2 * s.x - p.damping * s.v  // dv/dt = acceleration
  }
});
```

**Example with Events:**
```javascript
// Pendulum with collision detection
const pendulum = defineIVP({
  state: { theta: 0.1, omega: 0 },
  params: { g: 9.81, L: 1, damping: 0.05 },
  derivatives: {
    theta: (s) => s.omega,
    omega: (s, p) => -(p.g/p.L) * Math.sin(s.theta) - p.damping * s.omega
  },
  events: {
    'bottom': {
      when: (s) => s.theta,  // Trigger when theta = 0
      then: (s) => ({...s, omega: s.omega * 0.9}), // Lose 10% velocity
      once: false
    },
    'limit': {
      when: (s) => Math.abs(s.theta) - Math.PI, // Trigger at ±π
      then: (s) => null, // Return null to keep current state (just log event)
      once: true
    }
  }
});
```

**Event Return Values:**
- **`State` object** - New state to continue simulation with
- **`null`** - Keep current state (useful for logging or side effects only)
- **`undefined`** - Treated as `null` (keeps current state)

### `simulate(model, config?)`

Runs numerical simulation of a differential equation model.

**Overload 1 - Simple Configuration:**
```typescript
interface SimulateConfig {
  timeRange: [number, number];  // [start, end] time
  timeStep?: number;            // Integration step (default: 0.01)
}

function simulate(model: Model, config: SimulateConfig): Timeline
```

**Overload 2 - Fluent Builder API:**
```typescript
class SimulationBuilder {
  initial(state: State): SimulationBuilder;
  params(params: Params): SimulationBuilder;
  run(options?: SimulationOptions): Timeline;
}

function simulate(model: Model): SimulationBuilder
```

**Parameters:**
- `model` - The differential equation model (from `defineIVP`)
- `config.timeRange` - Simulation time range `[start, end]`
- `config.timeStep` - Numerical integration step size

**Returns:** Timeline containing simulation results

**Example - Simple:**
```javascript
const timeline = simulate(model, {
  timeRange: [0, 10],
  timeStep: 0.01
});
```

**Example - Fluent API:**
```javascript
const timeline = simulate(model)
  .initial({ x: 1, v: 0 })
  .params({ omega: 2, damping: 0.1 })
  .run({ timeRange: [0, 20] });
```

### `slider(min, max, defaultValue, label, step?, options?)`

Creates an interactive slider control for parameter adjustment.

```typescript
function slider(
  min: number, 
  max: number, 
  defaultValue: number, 
  label: string, 
  step?: number = 0.01,
  options?: { scale?: 'linear' | 'log' }
): SliderControl

interface SliderControl {
  type: 'slider';
  label: string;
  default: number;
  min: number;
  max: number;
  step?: number;
  scale?: 'linear' | 'log';
}
```

**Parameters:**
- `min` - Minimum slider value
- `max` - Maximum slider value  
- `defaultValue` - Initial slider position
- `label` - Display label for the slider
- `step` - Increment size (default: 0.01)
- `options.scale` - Scale type: 'linear' or 'log' (default: 'linear')

**Returns:** Slider control configuration object

**Example:**
```javascript
// Basic frequency slider
slider(0.1, 5, 1, 'Frequency');

// Fine-grained damping control
slider(0, 1, 0.1, 'Damping', 0.001);

// Logarithmic scale for wide ranges
slider(0.001, 1000, 1, 'Gain', 0.1, { scale: 'log' });
```

### `checkbox(label, defaultValue?)`

Creates a checkbox control for boolean parameters.

```typescript
function checkbox(label: string, defaultValue?: boolean = false): CheckboxControl

interface CheckboxControl {
  type: 'checkbox';
  label: string;
  default: boolean;
}
```

**Parameters:**
- `label` - Display label for the checkbox
- `defaultValue` - Initial checked state (default: false)

**Returns:** Checkbox control configuration object

**Example:**
```javascript
// Toggle damping on/off
checkbox('Enable Damping', false);

// Show/hide vector field  
checkbox('Show Vector Field', true);

// Switch between integration methods
checkbox('Use RK4', true);
```

## Visualization Functions

### `explore(model, config, options?)`

Creates an interactive visualization with parameter controls for real-time exploration.

```typescript
interface ExploreConfig {
  params?: Record<string, Control>;        // Interactive parameters
  initial?: State | ((params: Params) => State);   // Initial state function
  timeRange?: [number, number];          // default [0, 10]
  timeStep?: number;                     // default 0.01
  view: ViewBuilder | ViewBuilder[];      // Visualization
}

interface ExploreOptions {
  width?: number | string;             // default 'auto'
  height?: number | string;            // default 480
  target?: string | HTMLElement;       // rendering target
}

function explore(model: Model, config: ExploreConfig, options?: ExploreOptions): Promise<void>
```

**Parameters:**
- `model` - The differential equation model (from `defineIVP`)
- `config.params` - Interactive controls for parameters
- `config.initial` - Initial state or function to compute it from parameters
- `config.timeRange` - Simulation time range (default: [0, 10])
- `config.timeStep` - Integration time step (default: 0.01)
- `config.events` - Optional event handlers for discrete events
- `config.events.[key].when` - Function returning event trigger value (0 = trigger)
- `config.events.[key].then` - Function handling state change when event triggers (returns `State` for new state or `null` to keep current state)
- `config.events.[key].once` - Whether event triggers only once (default: false)
- `config.view` - Visualization configuration (single or multiple views)
- `options.width` - Container width (default: 'auto')
- `options.height` - Container height in pixels (default: 480)
- `options.target` - Target element for rendering

**Returns:** Promise that resolves when visualization is rendered

**Example:**
```javascript
// Interactive harmonic oscillator
await explore(oscillator, {
  params: {
    omega: slider(0.1, 5, 1, 'Frequency'),
    damping: slider(0, 2, 0.1, 'Damping')
  },
  initial: (p) => ({ x: 1, v: 0 }),
  view: view().plot((s) => s.x).axis('Time', 'Position').defaults()
});
```

**Example - Multiple Views:**
```javascript
// Phase space and time series
await explore(pendulum, {
  params: { length: slider(0.5, 2, 1, 'Length') },
  view: [
    view().plot((s) => s.theta).axis('Time', 'Angle'),
    view().plot((s) => [s.theta, s.omega]).axis('Angle', 'Angular Velocity')
  ]
}, { height: 400 });
```

### `show(timeline, viewConfig, options?)`

Creates a quick visualization of pre-computed simulation results.

```typescript
interface ShowOptions {
  width?: number | string;             // default 'auto'
  height?: number | string;            // default auto
  target?: string | HTMLElement;       // rendering target
  layout?: {
    columns?: number;                  // default: number of views
    rows?: number;                     // default: 1
    gaps?: number;                     // default: 10
  };
}

function show(timeline: Timeline, viewConfig: ViewBuilder | ViewBuilder[], options?: ShowOptions): Promise<void>
```

**Parameters:**
- `timeline` - Simulation results from `simulate()` function
- `viewConfig` - Visualization configuration (single or multiple views)
- `options.width` - Container width (default: 'auto')
- `options.height` - Container height (default: auto)
- `options.target` - Target element for rendering
- `options.layout` - Grid layout for multiple views

**Returns:** Promise that resolves when visualization is rendered

**Example:**
```javascript
// Simple plot of simulation results
const timeline = simulate(model, { timeRange: [0, 10] });
await show(timeline, view().plot((s) => s.x).axis('Time', 'Position'));
```

**Example - Multiple Views:**
```javascript
// Grid layout with multiple plots
await show(timeline, [
  view().plot((s) => s.x).axis('Time', 'Position'),
  view().plot((s) => s.v).axis('Time', 'Velocity'),
  view().plot((s) => [s.x, s.v]).axis('Position', 'Velocity')
], { layout: { columns: 2, rows: 2 } });
```

### `compare(timelines, viewConfig, options?)`

Compares multiple simulations side by side with consistent styling.

```typescript
interface CompareConfig {
  [label: string]: Timeline;           // Labeled timelines
}

interface CompareOptions {
  width?: number | string;             // default 'auto'
  height?: number | string;            // default auto
  target?: string | HTMLElement;       // rendering target
}

function compare(timelines: CompareConfig, viewConfig: ViewBuilder, options?: CompareOptions): Promise<void>
```

**Parameters:**
- `timelines` - Object mapping labels to simulation timelines
- `viewConfig` - Visualization configuration applied to all timelines
- `options.width` - Container width (default: 'auto')
- `options.height` - Container height (default: auto)
- `options.target` - Target element for rendering

**Returns:** Promise that resolves when visualization is rendered

**Example:**
```javascript
// Compare different damping values
const noDrag = simulate(model).params({ damping: 0 }).run({ timeRange: [0, 10] });
const lightDrag = simulate(model).params({ damping: 0.1 }).run({ timeRange: [0, 10] });
const heavyDrag = simulate(model).params({ damping: 0.5 }).run({ timeRange: [0, 10] });

await compare({
  'No damping': noDrag,
  'Light damping': lightDrag,
  'Heavy damping': heavyDrag
}, view().plot((s) => s.x).axis('Time', 'Position'));
```

**Example - Different Initial Conditions:**
```javascript
await compare({
  'Small amplitude': simulate(model).initial({ x: 0.5, v: 0 }).run(),
  'Medium amplitude': simulate(model).initial({ x: 1.0, v: 0 }).run(),
  'Large amplitude': simulate(model).initial({ x: 2.0, v: 0 }).run()
}, view().plot((s) => [s.x, s.v]).axis('Position', 'Velocity'));
```

## View API

The `view()` function returns a chainable builder for constructing mathematical visualizations.

### `view(timeline?)`

Creates a new ViewBuilder for constructing visualizations.

```typescript
function view(timeline?: Timeline): ViewBuilder
```

**Parameters:**
- `timeline` - Optional timeline for immediate visualization (from `simulate`)

**Returns:** New ViewBuilder instance

**Example:**
```javascript
// Create builder without timeline (for explore)
const builder = view();

// Create builder with timeline (for show)
const timeline = simulate(model, { timeRange: [0, 10] });
const builder = view(timeline);
```

### Basic Methods

#### `.plot(selector, options?)`

Plots variables or parametric curves with flexible configuration.

```typescript
.plot(selector: SelectorFunction, options?: PlotOptions | string, label?: string): ViewBuilder

interface PlotOptions {
  color?: string;                    // Line color
  lineWidth?: number;                // Line width (default: 1.5)
  label?: string;                    // Legend label
  dash?: number[];                   // Dash pattern
  alpha?: number;                    // Opacity (0-1)
}

// Selector signatures:
selector: (state: State) => number | number[];
selector: (state: State, params: Params) => number | number[];
```

**Shorthand Forms:**
```javascript
// Basic plot
.plot((s) => s.x)

// With color
.plot((s) => s.x, 'red')

// With label
.plot((s) => s.x, 'Position')

// With options
.plot((s) => s.x, { color: 'blue', lineWidth: 2 })

// Parametric plot (phase space)
.plot((s) => [s.x, s.v])
```

#### `.axis(arg1?, arg2?, arg3?)`

Configures axes with multiple shorthand forms.

```typescript
.axis(options?: AxisOptions): ViewBuilder
.axis(xLabel: string, yLabel: string): ViewBuilder
.axis(aspectRatio: number | 'equal' | 'auto'): ViewBuilder

interface AxisOptions {
  xLabel?: string;                   // X-axis label
  yLabel?: string;                   // Y-axis label
  xLim?: [number, number];           // X-axis limits
  yLim?: [number, number];           // Y-axis limits
  aspectRatio?: 'equal' | 'auto' | number;
  showTicks?: boolean;                // Show tick marks
  showLabels?: boolean;               // Show axis labels
}
```

**Shorthand Forms:**
```javascript
// Simple labels
.axis('Time', 'Position')

// Equal aspect ratio
.axis('equal')

// Custom aspect ratio
.axis(2)  // 2:1 aspect ratio

// Full options
.axis({ xLabel: 'Time', yLabel: 'Position', aspectRatio: 'equal' })
```

#### `.grid(options?)`

Adds background grid with customizable appearance.

```typescript
.grid(options?: GridOptions): ViewBuilder

interface GridOptions {
  color?: string;                    // Grid line color
  alpha?: number;                    // Grid opacity (0-1)
  spacing?: 'auto' | number;         // Grid spacing
}
```

**Example:**
```javascript
// Default grid
.grid()

// Custom styling
.grid({ color: '#ccc', alpha: 0.5, spacing: 1 })
```

### Advanced Methods

#### `.fill(predicate, options?)`

Fills regions where a condition is true.

```typescript
.fill(predicate: (state: State) => boolean, options?: FillOptions): ViewBuilder

interface FillOptions {
  color?: string;                    // Fill color (default: 'blue')
  alpha?: number;                    // Fill opacity (default: 0.2)
}
```

**Example:**
```javascript
// Fill region where x > 0
.fill((s) => s.x > 0, { color: 'red', alpha: 0.3 })
```

#### `.axhline(y, options?)` / `.axvline(x, options?)`

Adds horizontal and vertical reference lines.

```typescript
.axhline(y: number, options?: RefLineOptions): ViewBuilder
.axvline(x: number, options?: RefLineOptions): ViewBuilder

interface RefLineOptions {
  color?: string;                    // Line color (default: 'gray')
  linestyle?: 'solid' | 'dashed' | 'dotted';
  linewidth?: number;                // Line width (default: 1)
  label?: string;                    // Line label
}
```

**Example:**
```javascript
// Horizontal line at y=0
.axhline(0, { color: 'red', linestyle: 'dashed' })

// Vertical line with label
.axvline(5, { label: 'Critical point' })
```

#### `.title(text)`

Sets plot title.

```typescript
.title(text: string): ViewBuilder
```

**Example:**
```javascript
.title('Harmonic Oscillator Response')
```

#### `.legend(options?)`

Adds legend with customizable position and appearance.

```typescript
.legend(options?: LegendOptions): ViewBuilder

interface LegendOptions {
  loc?: 'upper right' | 'upper left' | 'lower right' | 'lower left' | 'center';
  frame?: boolean;                   // Show legend frame (default: true)
  alpha?: number;                    // Legend opacity (default: 1)
}
```

**Example:**
```javascript
.legend({ loc: 'upper right', frame: false })
```

### Specialized Methods

#### `.nullcline(variable, options?)`

Adds nullcline lines where derivatives are zero.

```typescript
.nullcline(variable: string, options?: NullclineOptions): ViewBuilder

interface NullclineOptions {
  color?: string;                    // Line color (default: 'blue')
  linestyle?: 'solid' | 'dashed' | 'dotted';
  linewidth?: number;                // Line width (default: 1)
  label?: string;                    // Line label
}
```

**Example:**
```javascript
// Nullcline for x variable
.nullcline('x', { color: 'blue', linestyle: 'dashed' })
```

#### `.poincare(section, options?)`

Adds Poincaré section points for analyzing periodic behavior.

```typescript
.poincare(section: (state: State) => boolean, options?: PoincareOptions): ViewBuilder

interface PoincareOptions {
  direction?: 'positive' | 'negative' | 'both';
  marker?: string;                    // Marker style
  color?: string;                    // Marker color (default: 'red')
  size?: number;                     // Marker size (default: 4)
}
```

**Example:**
```javascript
// Poincaré section at y=0 crossing
.poincare((s) => s.y > 0 && s.prev_y <= 0, { 
  direction: 'positive', 
  color: 'red', 
  size: 6 
})
```

#### `.vectorField(field, options?)`

Adds vector field visualization for phase space analysis.

```typescript
.vectorField(field: (state: State, params: Params) => { dx: number; dy: number }, options?: VectorFieldOptions): ViewBuilder

interface VectorFieldOptions {
  gridSize?: number;                  // Grid resolution (default: 20)
  color?: string;                    // Vector color (default: 'gray')
  alpha?: number;                    // Vector opacity (default: 0.6)
  normalize?: boolean;               // Normalize vector lengths (default: true)
  scale?: number;                    // Vector scaling factor (default: 1)
}
```

**Example:**
```javascript
// Vector field for pendulum
.vectorField((s, p) => ({ 
  dx: s.omega, 
  dy: -(p.g/p.L) * Math.sin(s.theta) 
}), { 
  gridSize: 15, 
  color: 'blue', 
  alpha: 0.4 
})
```

#### `.phase(selector, options?)`

Convenience method for phase portraits (parametric plots with default styling).

```typescript
.phase(selector: (state: State) => [number, number], options?: PlotOptions): ViewBuilder
```

**Example:**
```javascript
// Phase portrait with red styling
.phase((s) => [s.x, s.v], { color: 'red', lineWidth: 2 })
```

#### `.defaults()`

Adds default grid and axes for quick setup.

```typescript
.defaults(): ViewBuilder
```

**Example:**
```javascript
// Equivalent to .grid().axis()
view().plot((s) => s.x).defaults()
```

## Parameter Flow Logic

### Parameter Merging Rules

CalcPlot uses a hierarchical parameter system that merges values from multiple sources:

1. **Model Parameters** - Default constants defined in `model.params`
2. **Control Parameters** - Interactive overrides in `explore.params`
3. **Merged Parameters** - Combined values available in selectors and initial functions

**Parameter Resolution:**
```javascript
const model = defineIVP({
  params: { omega: 1, damping: 0.1 }  // Model defaults
});

explore(model, {
  params: {
    damping: slider(0, 1, 0.2, 'Damping')  // Overrides model.damping
  },
  initial: (p) => ({ x: 1, v: 0 }),  // p = { omega: 1, damping: 0.2 }
  view: view().plot((s, p) => s.x * p.omega)  // p contains merged values
});
```

### Function Signatures

Selectors and functions can access parameters in different ways:

- **State only**: `(s) => s.x` - Uses only state variables
- **State + params**: `(s, p) => s.x * p.amplitude` - Uses merged parameters
- **Parameter availability**: All model.params + explore.params are merged

## Layout and Multiple Views

### Multiple Views Configuration

CalcPlot supports multiple simultaneous visualizations with automatic layout:

```javascript
// Multiple views in explore
await explore(model, {
  view: [
    view().plot((s) => s.x),  // First view: position vs time
    view().plot((s) => s.v),  // Second view: velocity vs time
    view().plot((s) => [s.x, s.v])  // Third view: phase portrait
  ]
}, { 
  width: 1200,  // Total container width
  height: 400   // Minimum container height
});
```

### Layout Behavior

- **Automatic sizing** - Uses CSS flexbox for responsive layout
- **Grid arrangement** - Views arranged in responsive grid
- **Flexible dimensions** - Adapts to available space
- **Minimum heights** - Uses `min-height` for proper scaling

### Custom Layout in show()

```javascript
// Custom grid layout
await show(timeline, [
  view().plot((s) => s.x),
  view().plot((s) => s.y),
  view().plot((s) => [s.x, s.y]),
  view().plot((s) => Math.sqrt(s.x**2 + s.y**2))
], { 
  layout: { 
    columns: 2,  // 2x2 grid
    rows: 2,
    gaps: 15     // 15px spacing
  }
});
```

## Type Definitions

### Core Types

**State** - `Record<string, number>`
- State variables of the dynamical system
- Example: `{ x: 1.0, v: 0.5, theta: 0.2 }`

**Params** - `Record<string, number>`
- System parameters and constants
- Example: `{ omega: 2.0, damping: 0.1, gravity: 9.81 }`

**Model** - Complete model definition
```typescript
interface Model {
  state: State;                      // Initial conditions
  params: Params;                    // Default parameters
  derivatives: Derivatives;         // System dynamics
  events?: Events;                   // Optional events
}
```

**Timeline** - Simulation results
```typescript
interface Timeline {
  times: number[];                   // Time points
  states: Record<string, number[]>;  // State trajectories
  at(time: number): State;          // Interpolate state at time
  serialize(): string;              // Convert to JSON
}
```

**Files:** `src/core/types.ts`

### Visualization Types

**ViewBuilder** - Chainable visualization builder
- Provides fluent API for constructing plots
- Methods: `.plot()`, `.axis()`, `.grid()`, `.title()`, etc.

**Control** - UI control configuration
```typescript
type Control = SliderControl | CheckboxControl;

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
```

**Layer** - Visualization layer
- Individual plot elements (lines, fills, vectors, etc.)
- Serialized for HTML embedding

**Files:** 
- `src/lib/types.ts` - Serialization types
- `src/lib/controls.ts` - Control types
- `src/lib/builders/BuilderInterfaces.ts` - Builder interfaces

### Runtime Types

**RuntimeControl** - Control with dynamic value
**ExploreDescriptor** - Serialized explore configuration
**ViewDescriptor** - Serialized view configuration

**File:** `src/lib/types.ts`

## Design Principles

CalcPlot follows these core design principles:

1. **Declarative API** - Describe what to visualize, not how to render
2. **Composable Design** - Chain methods for complex visualizations
3. **Reactive Updates** - Auto-update visualizations when parameters change
4. **Matplotlib-inspired** - Familiar scientific plotting API conventions
5. **Function Serialization** - Automatic serialization for HTML embedding
6. **High-Accuracy Integration** - RK4 numerical integration for reliability
7. **Type Safety** - Full TypeScript support with comprehensive type definitions
8. **Modular Architecture** - Clean separation between modeling, simulation, and visualization

## Quick Reference

### Common Patterns

**Basic Workflow:**
```javascript
// 1. Define model
const model = defineIVP({
  state: { x: 1, v: 0 },
  params: { omega: 1, damping: 0.1 },
  derivatives: {
    x: (s) => s.v,
    v: (s, p) => -p.omega**2 * s.x - p.damping * s.v
  }
});

// 2. Simulate
const timeline = simulate(model, { timeRange: [0, 10] });

// 3. Visualize
await show(timeline, view().plot((s) => s.x).axis('Time', 'Position').defaults());
```

**Interactive Exploration:**
```javascript
await explore(model, {
  params: {
    omega: slider(0.1, 5, 1, 'Frequency'),
    damping: slider(0, 1, 0.1, 'Damping')
  },
  view: view().plot((s) => s.x).defaults()
});
```

**Comparison Analysis:**
```javascript
const low = simulate(model).params({ damping: 0.05 }).run();
const high = simulate(model).params({ damping: 0.5 }).run();

await compare({ 'Low damping': low, 'High damping': high }, 
  view().plot((s) => s.x).defaults());
```

### Function Cheat Sheet

| Function | Purpose | Key Parameters |
|----------|---------|----------------|
| `defineIVP()` | Define differential equation model | `state`, `params`, `derivatives` |
| `simulate()` | Run numerical simulation | `timeRange`, `timeStep` |
| `explore()` | Interactive visualization | `params`, `view` |
| `show()` | Quick visualization | `timeline`, `viewConfig` |
| `compare()` | Compare simulations | `timelines`, `viewConfig` |
| `view()` | Build visualization | `timeline?` |
| `slider()` | Parameter control | `min`, `max`, `default`, `label` |
| `checkbox()` | Boolean control | `label`, `default` |

## Examples

See `Quick Start.md` for practical examples and common patterns.

For more advanced examples, check the `examples/` directory:
- `examples/01-basics/` - Basic usage patterns
- `examples/02-with-params/` - Parameter controls
- `examples/03-compare/` - Comparison visualizations
- `examples/04-interactive/` - Interactive explorations
