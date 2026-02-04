/**
 * explore() - Interactive exploration API
 * For interactive investigation with parameter controls
 */

import { Model, Params, State } from '../core/ivp';
import { serializeModel, serializeParams } from '../simulation/serialization';
import { renderToHTML } from './utils/renderToHTML';
import { displayHTML } from './utils/displayHTML';
import { loadClientBundle } from './utils/bundleLoader';
import { ViewBuilder } from './builders/ViewBuilder';
import { Control } from './controls';

export interface ExploreConfig {
  params: Record<string, Control>;
  initial?: State | ((params?: Params) => State);
  timeRange?: [number, number];
  timeStep?: number;
  view: ViewBuilder | ViewBuilder[];
}

export interface ExploreOptions {
  width?: number | string;
  height?: number | string;
  target?: string | HTMLElement;
}

/**
 * Interactive exploration with parameter controls
 */
export async function explore(
  model: Model,
  config: ExploreConfig,
  options: ExploreOptions = {}
): Promise<void> {
  const { params, initial, timeRange = [0, 10], timeStep = 0.01, view: viewFn } = config;
  const { width = 'auto', height = 480, target } = options;

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
