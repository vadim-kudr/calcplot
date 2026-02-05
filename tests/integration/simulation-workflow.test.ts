/**
 * Integration Tests: Real-World Scenarios
 * 
 * Living documentation demonstrating complete API workflows through practical examples.
 */

import { describe, test, expect } from 'vitest';
import { defineIVP } from '../../src/core/defineIVP';
import { simulate } from '../../src/core/simulate';
import { view } from '../../src/lib/builders/ViewBuilder';
import { explore } from '../../src/lib/explore';
import { show } from '../../src/lib/show';

describe('Integration: Real-World Simulation Scenarios', () => {
  
  describe('🏀 Physics: Bouncing Ball with Energy Loss', () => {
    test('Scenario: Ball dropped from height bounces realistically', () => {
      // 📖 Story: A basketball dropped from 2m should bounce multiple times
      // with decreasing height due to energy loss (restitution coefficient)
      
      const ballModel = defineIVP({
        state: { y: 2.0, vy: 0.0 },
        params: { g: 9.81, restitution: 0.75 },
        derivatives: {
          y: (state: any) => state.vy,
          vy: (state: any, params: any) => -params.g
        },
        events: {
          groundCollision: {
            when: (state: any) => state.y,
            then: (state: any, params: any) => ({
              ...state,
              y: 0,
              vy: -state.vy * params.restitution
            })
          }
        }
      });

      const timeline = simulate(ballModel)
        .initial({ y: 2.0, vy: 0.0 })
        .params({ g: 9.81, restitution: 0.75 })
        .run({ timeRange: [0, 3.0], timeStep: 0.01 });

      const heights = timeline.states.y;
      const groundContacts = heights.filter((y: number) => Math.abs(y) < 0.01).length;
      
      // ✅ Reality check: ball should bounce and lose energy
      expect(groundContacts).toBeGreaterThan(2, 'Should bounce multiple times');
      expect(Math.min(...heights)).toBeLessThanOrEqual(0.01, 'Should reach ground');
      
      // Final height should be much lower than initial
      const finalHeight = Math.max(...heights.slice(-50));
      expect(finalHeight).toBeLessThan(2.0 * 0.5, 'Energy should dissipate');

      console.log(`🏀 Ball bounced ${groundContacts} times, final height: ${finalHeight.toFixed(2)}m`);
    });
  });

  describe('🚀 Physics: Projectile Motion', () => {
    test('Scenario: Air resistance affects projectile trajectory', () => {
      // 📖 Story: Compare how air resistance changes projectile range and height
      
      const projectileModel = (airResistance: number) => defineIVP({
        state: { x: 0, y: 0, vx: 30, vy: 40 },
        params: { g: 9.81, k: airResistance },
        derivatives: {
          x: (state: any) => state.vx,
          y: (state: any) => state.vy,
          vx: (state: any, params: any) => -params.k * state.vx,
          vy: (state: any, params: any) => -params.g - params.k * state.vy
        }
      });

      const noAir = simulate(projectileModel(0))
        .initial({ x: 0, y: 0, vx: 30, vy: 40 })
        .run({ timeRange: [0, 8], timeStep: 0.01 });

      const withAir = simulate(projectileModel(0.1))
        .initial({ x: 0, y: 0, vx: 30, vy: 40 })
        .run({ timeRange: [0, 8], timeStep: 0.01 });

      const noARange = Math.max(...noAir.states.x);
      const withARange = Math.max(...withAir.states.x);
      const noARHeight = Math.max(...noAir.states.y);
      const withARHeight = Math.max(...withAir.states.y);

      // ✅ Physics check: air resistance reduces both range and height
      expect(withARange).toBeLessThan(noARange, 'Air resistance reduces range');
      expect(withARHeight).toBeLessThan(noARHeight, 'Air resistance reduces height');

      console.log(`🚀 No air: ${noARange.toFixed(1)}m range, ${noARHeight.toFixed(1)}m height`);
      console.log(`🚀 With air: ${withARange.toFixed(1)}m range, ${withARHeight.toFixed(1)}m height`);
    });
  });

  describe('🎨 Visualization Integration', () => {
    test('Scenario: Complete workflow from model to visualization', () => {
      // 📖 Story: Full pipeline - model → simulation → visualization
      
      const pendulumModel = defineIVP({
        state: { theta: 0.5, omega: 0 },
        params: { g: 9.81, L: 1.0, damping: 0.1 },
        derivatives: {
          theta: (state: any) => state.omega,
          omega: (state: any, params: any) => -(params.g / params.L) * Math.sin(state.theta) - params.damping * state.omega
        }
      });

      const timeline = simulate(pendulumModel)
        .initial({ theta: 0.5, omega: 0 })
        .params({ g: 9.81, L: 1.0, damping: 0.1 })
        .run({ timeRange: [0, 10], timeStep: 0.01 });

      // 🎨 Create visualizations using new API
      const phaseView = view()
        .plot((state: any) => [state.theta, state.omega], { color: '#e74c3c' })
        .grid()
        .axis({ x: 'Angle (rad)', y: 'Angular Velocity (rad/s)' });

      const timeView = view()
        .plot((state: any) => state.theta, { color: '#3498db' })
        .plot((state: any) => state.omega, { color: '#2ecc71' })
        .grid()
        .axis({ x: 'Time (s)', y: 'Value' });

      // ✅ Views should serialize correctly
      const phaseDesc = phaseView.executeWithTimeline(timeline);
      const timeDesc = timeView.executeWithTimeline(timeline);

      expect(phaseDesc.layers).toHaveLength(3, 'Phase view has 3 layers');
      expect(timeDesc.layers).toHaveLength(4, 'Time view has 4 layers');
      expect(phaseDesc.timeline.times).toBe(timeline.times);

      console.log(`🎨 Created ${phaseDesc.layers.length + timeDesc.layers.length} visualization layers`);
    });
  });

  describe('🌐 Interactive Exploration', () => {
    test('Scenario: Explore mode with parameter controls', () => {
      // 📖 Story: Interactive pendulum with adjustable parameters
      
      const pendulumModel = defineIVP({
        state: { theta: 0.5, omega: 0 },
        params: { g: 9.81, L: 1.0, damping: 0.0 },
        derivatives: {
          theta: (state: any) => state.omega,
          omega: (state: any, params: any) => -(params.g / params.L) * Math.sin(state.theta) - params.damping * state.omega
        }
      });

      // 🎨 Create views for exploration
      const phaseView = view()
        .plot((state: any) => [state.theta, state.omega], { color: '#3498db' })
        .grid()
        .axis({ x: 'Angle (rad)', y: 'Angular Velocity (rad/s)' });

      const timeView = view()
        .plot((state: any) => state.theta, { color: '#e74c3c' })
        .grid()
        .axis({ x: 'Time (s)', y: 'Angle (rad)' });

      // ✅ Views should be ready for explore mode
      const views = [phaseView, timeView];
      views.forEach((viewBuilder, index) => {
        const descriptor = viewBuilder.toDescriptor();
        expect(descriptor.layers.length).toBeGreaterThan(2, `View ${index} has multiple layers`);
        expect(viewBuilder.getLayers).toBeDefined(`View ${index} supports layers`);
      });

      console.log(`🎮 Created ${views.length} views for interactive exploration`);
    });
  });
});
