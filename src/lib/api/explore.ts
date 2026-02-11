/**
 * explore() - Interactive exploration API
 * For interactive investigation with parameter controls
 */

import type { Model, Params, State } from '../../core/types';
import { serializeModel, serializeParams } from '../../simulation/serialization';
import { renderToHTML } from '../utils/renderToHTML';
import { displayHTML } from '../utils/displayHTML';
import { loadClientBundle } from '../utils/bundleLoader';
import { ViewBuilder } from '../builders/ViewBuilder';
import { Control } from '../controls';
import { DEFAULT_CONFIG } from '../config/defaults';

export interface ExploreConfig {
  /** Interactive parameter controls (sliders, checkboxes) */
  params?: Record<string, Control>;
  /** Initial state or function to compute initial state from parameters */
  initial?: State | ((params?: Params) => State);
  /** Time range for simulation [start, end] */
  timeRange?: [number, number];
  /** Time step for numerical integration */
  timeStep?: number;
  /** Visualization configuration - single view or array of views */
  view: ViewBuilder | ViewBuilder[];
}

export interface ExploreOptions {
  /** Container width */
  width?: number | string;
  /** Container height in pixels */
  height?: number | string;
  /** Target element or ID for rendering */
  target?: string | HTMLElement;
}

/**
 * Creates an interactive visualization with parameter controls.
 * 
 * @param model - The differential equation model (from defineIVP)
 * @param config - Configuration for the exploration
 * @param options - Display options
 * 
 * @returns Promise that resolves when visualization is rendered
 * 
 * @example
 * ```javascript
 * // Interactive harmonic oscillator
 * await explore(oscillator, {
 *   params: {
 *     omega: slider(0.1, 5, 1, 'Frequency'),
 *     damping: slider(0, 2, 0.1, 'Damping')
 *   },
 *   initial: (p) => ({ x: 1, v: 0 }),
 *   view: view().plot((s) => s.x).axis('Time', 'Position').defaults()
 * });
 * ```
 */
export async function explore(
  model: Model,
  config: ExploreConfig,
  options: ExploreOptions = {}
): Promise<void> {
  const { params = {}, initial, timeRange, timeStep, view: viewFn } = config;
  const { width, height, target } = options;

  // Handle single or multiple view functions
  const viewFunctions = Array.isArray(viewFn) ? viewFn : [viewFn];

  const views = viewFunctions.map((viewBuilder) => {
    // ViewBuilder should have both methods
    const viewDescriptor = viewBuilder.toDescriptor();
    const viewLayers = viewBuilder.getLayers();

    return {
      view: viewBuilder.toString(),
      viewDescriptor: viewDescriptor,
      layers: viewLayers
    };
  });

  const descriptor = {
    type: 'explore' as const,
    model: serializeModel(model),
    params: serializeParams(params),
    initial: initial?.toString() || '',
    views: views,
    options: { timeRange, timeStep, width, height }
  };

  const clientBundle = await loadClientBundle();
  const html = renderToHTML(descriptor, clientBundle);
  await displayHTML(html, target);
}
