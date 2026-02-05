# CalcPlot API Documentation

## Overview

CalcPlot provides a declarative API for creating interactive mathematical visualizations.

Three main functions:
- **`show(model, config, options?)`** - Quick visualization
- **`explore(model, config, options?)`** - Interactive with controls  
- **`compare(model, config, options?)`** - Compare multiple simulations

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
      when: (state: State) => number;
      then: (state: State, params: Params) => State | null;
      once?: boolean;
    };
  };
}

function defineIVP(config: IVPConfig): Model
```

**Types:** See `src/core/types.ts` for State, Params, Model interfaces.

**Example:**
```javascript
const oscillator = defineIVP({
  state: { x: 1, v: 0 },
  params: { omega: 1, damping: 0.1 },
  derivatives: {
    x: (s) => s.v,
    v: (s, p) => -p.omega**2 * s.x - p.damping * s.v
  }
});
```

### `simulate(model, config?)`

Run numerical simulation of the model.

```typescript
interface SimulateConfig {
  timeRange: [number, number];
  timeStep?: number;
}

// Simple simulation
function simulate(model: Model, config: SimulateConfig): Timeline

// Fluent API  
function simulate(model: Model): SimulationBuilder
```

**Types:** See `src/core/types.ts` for Timeline, SimulationOptions.

### `slider(min, max, defaultValue, label, options?)`

Create an interactive parameter slider.

```typescript
function slider(
  min: number, 
  max: number, 
  defaultValue: number, 
  label: string, 
  options?: { 
    step?: number; 
    scale?: 'linear' | 'log' 
  }
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

**Types:** See `src/lib/controls.ts` for SliderControl interface.

## Visualization Functions

### `explore(model, config, options?)`

Interactive visualization with parameter controls.

```typescript
interface ExploreConfig {
  params?: Record<string, Control>;        // Interactive parameters
  initial?: (params: Params) => State;   // Initial state function
  timeRange?: [number, number];          // default [0, 10]
  timeStep?: number;                     // default 0.01
  view: ViewBuilder | ViewBuilder[];      // Visualization
}

interface ExploreOptions {
  width?: number | string;             // default 'auto'
  height?: number | string;            // default 480
  target?: string | HTMLElement;
}
```

### `show(model, config, options?)`

Quick visualization without parameters.

```typescript
interface ShowConfig {
  view: ViewBuilder | ViewBuilder[];
  timeRange?: [number, number];
  timeStep?: number;
  params?: Params;
}
```

### `compare(models, config, options?)`

Compare multiple simulations.

```typescript
interface CompareConfig {
  view: ViewBuilder;
  labels?: string[];
  timeRange?: [number, number];
  timeStep?: number;
}
```

## View API

The `view()` function returns a chainable builder for visualizations.

### Basic Methods

#### `.plot(selector, options?)`

Plot variable or parametric curve.

```typescript
interface PlotOptions {
  color?: string;
  lineWidth?: number;
  label?: string;
  dash?: number[];
  alpha?: number;
}

// Selector signatures:
selector: (state: State) => number | number[];
selector: (state: State, params: Params) => number | number[];
```

#### `.axis(options?)`

Configure axes with shorthand support:

```typescript
// Shorthand forms
.axis('x label', 'y label')           // Simple labels
.axis('equal')                         // Equal aspect ratio
.axis({ xLabel: 'Time', yLabel: 'Position' })  // Full options

interface AxisOptions {
  xLabel?: string;
  yLabel?: string;
  xLim?: [number, number];
  yLim?: [number, number];
  aspectRatio?: 'equal' | 'auto' | number;
  showTicks?: boolean;
  showLabels?: boolean;
  // ... more options
}
```

#### `.grid(options?)`

Add background grid.

```typescript
interface GridOptions {
  color?: string;
  alpha?: number;
  spacing?: 'auto' | number;
}
```

### Advanced Methods

#### `.fill(predicate, options?)`

Fill region where condition is true.

```typescript
.fill((state) => boolean, options?: FillOptions)
```

#### `.axhline(y, options?)` / `.axvline(x, options?)`

Add reference lines.

```typescript
interface RefLineOptions {
  color?: string;
  linestyle?: 'solid' | 'dashed' | 'dotted';
  linewidth?: number;
  label?: string;
}
```

#### `.title(text)`

Set plot title.

#### `.legend(options?)`

Add legend.

```typescript
interface LegendOptions {
  loc?: 'upper right' | 'upper left' | 'lower right' | 'lower left' | 'center';
  frame?: boolean;
  alpha?: number;
}
```

### Specialized Methods

#### `.nullcline(variable, options?)`

Add nullcline lines where derivatives are zero.

```typescript
.nullcline('x', { color: 'blue', linestyle: 'dashed' })
```

#### `.poincare(section, options?)`

Add Poincaré section points.

```typescript
interface PoincareOptions {
  direction?: 'positive' | 'negative' | 'both';
  marker?: string;
  color?: string;
  size?: number;
}
```

#### `.vectorField(field, options?)`

Add vector field visualization.

```typescript
.vectorField((state, params) => ({ dx: number, dy: number }), options?)

interface VectorFieldOptions {
  gridSize?: number;
  color?: string;
  alpha?: number;
  normalize?: boolean;
  scale?: number;
}
```

## Parameter Flow Logic

### Parameter Merging Rules

1. **Model Parameters**: Default constants in `model.params`
2. **Control Parameters**: Interactive overrides in `explore.params`
3. **Merged Parameters**: Available in `initial(p)` and selectors

```javascript
const model = defineIVP({
  params: { omega: 1, damping: 0.1 }  // Model defaults
});

explore(model, {
  params: {
    damping: slider(0, 1, 0.2, 'Damping')  // Overrides model.damping
  },
  initial: (p) => ({ x: 1, v: 0 }),  // p = { omega: 1, damping: 0.2 }
  view: view().plot((s, p) => s.x * p.omega)
});
```

### Function Signatures

- **State only**: `(s) => s.x` - uses only state variables
- **State + params**: `(s, p) => s.x * p.amplitude` - uses parameters
- **Parameters available**: Merged from model.params + explore.params

## Layout and Multiple Views

### Multiple Views

```javascript
explore(model, {
  view: [
    view().plot((s) => s.x),  // First view
    view().plot((s) => s.y),  // Second view
    view().plot((s) => [s.x, s.y])  // Third view
  ]
}, { 
  width: 1200,  // Total container width
  height: 400   // Minimum container height
});
```

### Layout Behavior

- Automatic sizing with CSS flexbox
- Responsive to available space
- Uses `min-height` for containers

## Type Definitions

### Core Types
- **State**: `Record<string, number>` - State variables
- **Params**: `Record<string, number>` - Model parameters  
- **Model**: Complete model definition
- **Timeline**: Simulation results

**File**: `src/core/types.ts`

### Visualization Types
- **ViewBuilder**: Visualization builder
- **Control**: Slider or checkbox control
- **Layer**: Visualization layer

**Files**: 
- `src/lib/types.ts` - Serialization types
- `src/lib/controls.ts` - Control types
- `src/lib/builders/BuilderInterfaces.ts` - Builder interfaces

### Runtime Types
- **RuntimeControl**: Control with dynamic value
- **ExploreDescriptor**: Serialized explore configuration
- **ViewDescriptor**: Serialized view configuration

**File**: `src/lib/types.ts`

## Design Principles

1. **Declarative**: Describe what, not how
2. **Composable**: Chain methods for complex visualizations
3. **Reactive**: Auto-update on parameter changes
4. **Matplotlib-inspired**: Familiar scientific API
5. **Function Serialization**: Auto-serialize for HTML embedding
6. **RK4 Integration**: High-accuracy numerical integration

## Examples

See `Quick Start.md` for practical examples and common patterns.
