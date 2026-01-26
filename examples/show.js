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

// Safe access with checks
const timesLength = trajectory.times ? trajectory.times.length : 0;
const statesXLength = trajectory.states && trajectory.states.x ? trajectory.states.x.length : 0;
const statesVLength = trajectory.states && trajectory.states.v ? trajectory.states.v.length : 0;

// Create timeline object for view
const timeline = {
  times: trajectory.times || [],
  states: trajectory.states || { x: [], v: [] }
};


// Create ViewBuilder objects
const positionView = view()
  .plot((s) => s.x, { color: 'blue', label: 'Position' })
  .plot((s) => s.v, { color: 'red', label: 'Velocity' })
  .grid()
  .axis({ xLabel: 'Time (s)', yLabel: 'Value' });

const phaseView = view()
  .plot((s) => [s.x, s.v], { color: 'purple', label: 'Phase Space' })
  .grid()
  .axis({ xLabel: 'Position', yLabel: 'Velocity', aspectRatio: 'equal' });


// Display using show with correct format: (timeline, [viewBuilder1, viewBuilder2])
await show(timeline, [positionView, phaseView], {
  target: 'show-target',
});
