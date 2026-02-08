/**
 * Explore Manager - handles explore mode initialization and simulation
 */

import { SimulationEngine } from '../../simulation/SimulationEngine';
import { ViewRenderer } from '../../visualization/plots/renderers/ViewRenderer';
import { Timeline } from '../../core/timeline';
import { deserializeEvents } from '../../simulation/serialization';
import { createControls, getParameters } from './ControlsManager';
import { createWrapper, initializeViews, updateViews } from './LayoutManager';
import { ensureUnits, parseDimension } from '../utils/dimensions';
import { ExploreDescriptor, ViewConfig } from '../../lib/types';

// Helper function to convert ExploreDescriptor view to ViewConfig
function convertViewToConfig(view: ExploreDescriptor['views'][0]): ViewConfig {
  const result: ViewConfig = {
    layers: view.viewDescriptor.layers || []
  };
  if (view.viewDescriptor.controls) {
    result.controls = view.viewDescriptor.controls;
  }
  return result;
}

// Initialize explore mode with controls and simulation
export function initializeExplore(
  data: ExploreDescriptor,
  container: HTMLElement,
  log: (...args: unknown[]) => void
): void {
  try {
    const views = data.views || [];
    const isMultiView = views.length > 1;
    const containerWidth = data.options?.width || 'auto';
    const containerHeight = data.options?.height || '480px';

    // Ensure height has units
    const heightWithUnits = ensureUnits(containerHeight);
    const widthWithUnits = ensureUnits(containerWidth);

    createControls(data, container, { log, onUpdate: updateSimulation });

    const canvasContainer = isMultiView
      ? createWrapper(container, widthWithUnits, heightWithUnits, 10)
      : container;
    const parsedWidth = parseDimension(widthWithUnits, 800);
    const parsedHeight = parseDimension(heightWithUnits, 480);

    const renderers = isMultiView
      ? initializeViews(views.map(convertViewToConfig), canvasContainer, widthWithUnits, heightWithUnits, log)
      : [new ViewRenderer(canvasContainer, parsedWidth, parsedHeight, log)];

    // Update simulation function
    function updateSimulation(): void {
      // Get parameters from controls (with defaults)
      const exploreParams = getParameters(data);
      // If no controls exist, use only model.params
      const currentParams = Object.keys(exploreParams).length > 0 
        ? { ...data.model.params, ...exploreParams }
        : data.model.params;

      try {
        const engine = new SimulationEngine(log);
        const initialFn = engine.parseInitialFunction(data.initial);
        const initialState = initialFn(currentParams as Record<string, number>);

        // Deserialize events if present
        if (data.model?.events) {
          // data.model.events = deserializeEvents(data.model.events); // Skip for now
        }

        const trajectory = engine.simulateTrajectory({
          model: data.model,
          params: currentParams as Record<string, number>,
          derivatives: data.model.derivatives || {},
          options: {
            timeRange: data.options.timeRange,
            timeStep: data.options.timeStep
          }
        }, initialState, currentParams as Record<string, number>);

        if (isMultiView) {
          const viewDataList = views.map(convertViewToConfig);
          
          updateViews(renderers, viewDataList, new Timeline(trajectory.times, trajectory.states), currentParams as Record<string, number>, 
            parseDimension(containerWidth, 800), 
            parseDimension(containerHeight, 480)
          );
        } else {
          const viewData = views[0];
          if (viewData && viewData.viewDescriptor && Array.isArray(viewData.viewDescriptor.layers)) {
            renderers[0].render({
              type: 'view',
              timeline: new Timeline(trajectory.times, trajectory.states),
              layers: viewData.viewDescriptor.layers,
              width: parseDimension(containerWidth, 800),
              height: parseDimension(containerHeight, 480)
            });
          }
        }
      } catch (error: any) {
        log('Error in simulation:', error.message);
      }
    }

    // Initial simulation run
    updateSimulation();
  } catch (error: any) {
    log('Error in explore initialization:', error.message);
  }
}
