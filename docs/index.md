---
layout: home

hero:
  name: CalcPlot
  text: Differential Equations Visualization
  tagline: Interactive plotting and exploration of differential equations in JavaScript
  actions:
    - theme: brand
      text: Get Started
      link: /quick-start
    - theme: alt
      text: View Examples
      link: /examples/basics
    - theme: alt
      text: GitHub
      link: https://github.com/vadim-kudr/calcplot

features:
  - icon: 📊
    title: Interactive Plots
    details: Visualize differential equations with interactive controls and real-time updates
  
  - icon: ⚡
    title: Fast & Lightweight
    details: Built with performance in mind, using efficient numerical methods
  
  - icon: 🎨
    title: Beautiful Visualizations
    details: Clean, customizable plots with support for multiple view types
  
  - icon: 🔧
    title: Easy to Use
    details: Simple, intuitive API for defining and solving differential equations
  
  - icon: 🤖
    title: Robotics Support
    details: Built-in models for common robotics systems like inverted pendulums
  
  - icon: 📚
    title: 30+ Examples
    details: Learn from comprehensive examples covering basics to advanced topics
---

## Quick Example

```js
import { defineIVP, simulate, show, view } from 'calcplot';

// Define an initial value problem
const oscillator = defineIVP({
  state: { x: 1, v: 0 },           // Initial position and velocity
  params: { omega: 1 },               // Natural frequency
  derivatives: {
    x: (s) => s.v,                   // dx/dt = velocity
    v: (s, p) => -(p.omega**2) * s.x   // dv/dt = -ω²x
  }
});

// Simulate and visualize
const timeline = simulate(oscillator, { timeRange: [0, 10] });
show(timeline, view().plot((s) => s.x).axis('Time', 'Position').defaults());
```

<script setup>
const exampleCode = `import { defineIVP, simulate, show, view } from 'calcplot';

const oscillator = defineIVP({
  state: { x: 1, v: 0 },
  params: { omega: 1 },
  derivatives: {
    x: (s) => s.v,
    v: (s, p) => -(p.omega**2) * s.x
  }
});

const timeline = simulate(oscillator, { timeRange: [0, 10] });
show(timeline, view().plot((s) => s.x).axis('Time', 'Position').defaults());`;
</script>

<ExampleRunner :code="exampleCode" />