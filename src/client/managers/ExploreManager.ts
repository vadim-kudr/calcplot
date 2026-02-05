/**
 * Explore Manager - handles explore mode initialization and simulation
 */

import { SimulationEngine } from '../../simulation/SimulationEngine';
import { ViewRenderer } from '../../visualization/plots/renderers/ViewRenderer';
import { deserializeEvents } from '../../simulation/serialization';
import { createControls, getParameters } from './ControlsManager';
import { createWrapper, initializeViews, updateViews } from './LayoutManager';
import { ensureUnits, parseDimension } from '../utils/dimensions';
import { ExploreDescriptor } from '../../lib/types';

// Initialize explore mode with controls and simulation
export function initializeExplore(
  data: ExploreDescriptor,
  container: HTMLElement,
  log: (...args: any[]) => void
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
      ? initializeViews(views, canvasContainer, widthWithUnits, heightWithUnits, log)
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
        const initialState = initialFn(currentParams);

        // Deserialize events if present
        if (data.model?.events) {
          data.model.events = deserializeEvents(data.model.events);
        }

        const trajectory = engine.simulateTrajectory({
          model: data.model,
          params: currentParams,
          derivatives: data.model.derivatives || {},
          options: {
            timeRange: data.options.timeRange,
            timeStep: data.options.timeStep
          }
        }, initialState, currentParams);

        if (isMultiView) {
          updateViews(renderers, views, trajectory, currentParams, 
            typeof containerWidth === 'string' ? parseInt(containerWidth) : containerWidth, 
            typeof containerHeight === 'string' ? parseInt(containerHeight) : containerHeight
          );
        } else {
          const viewData = views[0];
          if (viewData && viewData.viewDescriptor && Array.isArray(viewData.viewDescriptor.layers)) {
            renderers[0].render({
              type: 'view',
              timeline: trajectory,
              layers: viewData.viewDescriptor.layers,
              width: typeof containerWidth === 'string' ? parseInt(containerWidth) : containerWidth,
              height: typeof containerHeight === 'string' ? parseInt(containerHeight) : containerHeight
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
