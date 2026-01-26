const projectileModel = defineIVP({
  state: { x: 0, y: 0, vx: 0, vy: 0 },
  params: { g: 9.81, drag: 0.1 },
  derivatives: {
    x: (s) => s.vx,
    y: (s) => s.vy,
    vx: (s, p) => -p.drag * s.vx,
    vy: (s, p) => -p.g - p.drag * s.vy
  }
});

// Compare different trajectories with parametric plotting
const timeline1 = simulate(projectileModel).initial({ x: 0, y: 0, vx: 20, vy: 15 }).run();
const timeline2 = simulate(projectileModel).initial({ x: 0, y: 0, vx: 25, vy: 20 }).run();

await compare(
  {
    'Trajectory 1': timeline1,
    'Trajectory 2': timeline2
  },
  view()
    .plot((s) => [s['Trajectory 1_x'], s['Trajectory 1_y']], {
      color: '#2563eb',
      label: 'Trajectory 1'
    })
    .plot((s) => [s['Trajectory 2_x'], s['Trajectory 2_y']], {
      color: '#dc2626',
      label: 'Trajectory 2'
    })
    .grid()
    .axis(),
  { target: 'compare-target' }
);
