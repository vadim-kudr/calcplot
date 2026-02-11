/**
 * Explore Manager - handles explore mode initialization and simulation
 */

import { SimulationEngine } from '../../simulation/SimulationEngine';
import { Timeline } from '../../core/timeline';
import { createControls, getParameters } from './ControlsManager';
import { ViewManager } from './ViewManager';
import type { ExploreDescriptor, ViewDescriptor, ViewConfig } from '../../lib/types';

// Helper function to convert ExploreDescriptor view to ViewDescriptor
function convertViewToDescriptor(
  view: ExploreDescriptor['views'][0],
  timeline: any
): ViewDescriptor {
  return {
    timeline: timeline,
    layers: view.viewDescriptor.layers || [],
    controls: view.viewDescriptor.controls
  };
}

// Initialize explore mode with controls and simulation
export function initializeExplore(data: ExploreDescriptor, container: HTMLElement): void {
  const viewManager = new ViewManager(container);

  // Create main grid container for visual alignment
  const gridContainer = document.createElement('div');
  gridContainer.className = 'calcplot-explore-grid';
  container.appendChild(gridContainer);

  createControls(data, gridContainer, viewManager, { onUpdate: updateSimulation });

  // Create initial view descriptors with empty timeline (will be set after simulation)
  const viewDescriptors = data.views.map((view) =>
    convertViewToDescriptor(view, { times: [], states: {} })
  );

  viewManager.renderViews(viewDescriptors, data.options?.width, data.options?.height, () => {
    // Initial simulation run after rendering is complete
    updateSimulation();
  });

  // Update simulation function
  function updateSimulation(): void {
    // Get parameters from controls (with defaults)
    const exploreParams = getParameters(data);
    // If no controls exist, use only model.params
    const currentParams =
      Object.keys(exploreParams).length > 0
        ? { ...data.model.params, ...exploreParams }
        : data.model.params;

    try {
      const engine = new SimulationEngine();
      const initialFn = engine.parseInitialFunction(data.initial);
      const initialState = initialFn(currentParams as Record<string, number>);

      const trajectory = engine.simulateTrajectory(
        {
          model: data.model,
          params: currentParams as Record<string, number>,
          derivatives: data.model.derivatives || {},
          options: {
            timeRange: data.options.timeRange,
            timeStep: data.options.timeStep
          }
        },
        initialState,
        currentParams as Record<string, number>
      );

      // Update view descriptors with new timeline
      const updatedViewDescriptors = data.views.map((view) =>
        convertViewToDescriptor(view, new Timeline(trajectory.times, trajectory.states))
      );

      // Update views with new data (ViewManager handles cleanup internally)
      viewManager.updateViews(updatedViewDescriptors);
    } catch (error: any) {
      console.error('Error in simulation:', error.message);
    }
  }

  // Save for cleanup
  (container as any)._viewManager = viewManager;
  (container as any)._updateSimulation = updateSimulation;
}
