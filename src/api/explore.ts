/**
 * explore() - Interactive exploration API
 * For interactive investigation with parameter controls
 */

import { Model } from '../core/ivp';
import { serializeModel, serializeParams } from '../runtime/serialization';
import { renderToHTML } from '../utils/renderToHTML';
import { displayHTML } from '../utils/displayHTML';
import { loadClientBundle } from '../utils/bundleLoader';
import { ViewBuilder } from '../ui/ViewBuilder';

export interface ExploreConfig {
  params: Record<string, any>;
  initial: (params: Record<string, any>) => any;
  view:
    | ViewBuilder
    | ViewBuilder[];
}

export interface ExploreOptions {
  dt?: number;
  maxTime?: number;
  width?: number | string;
  height?: number | string;
  target?: string | HTMLElement;
  layout?: {
    columns?: number;
    rows?: number;
    gaps?: number;
  };
}

/**
 * Interactive exploration with parameter controls
 */
export async function explore(
  model: Model,
  config: ExploreConfig,
  options: ExploreOptions = {}
): Promise<void> {
  const { params, initial, view: viewFn } = config;
  const { dt = 0.01, maxTime = 10, width = 'auto', height = 480, target } = options;

  // Handle single or multiple view functions
  const viewFunctions = Array.isArray(viewFn) ? viewFn : [viewFn];

  const views = viewFunctions.map((config) => {
    let viewDescriptor;
    let viewLayers;
    
    // Handle ViewBuilder or ViewBuilder[]
    if (config && typeof config === 'object' && 'executeWithTimeline' in config && typeof config.executeWithTimeline === 'function') {
      // New format: view().plot(...).grid(...) - save the layers for client-side execution
      viewDescriptor = config.toDescriptor();
      viewLayers = config.getLayers();
    } else if (config && typeof config === 'object' && 'toDescriptor' in config && typeof config.toDescriptor === 'function') {
      // Already a ViewBuilder
      viewDescriptor = config.toDescriptor();
      viewLayers = config.getLayers();
    } else {
      throw new Error('Invalid view configuration: expected ViewBuilder or ViewBuilder[]');
    }

    return {
      view: config.toString(),
      viewDescriptor: viewDescriptor,
      layers: viewLayers
    };
  });

  const descriptor = {
    type: 'explore' as const,
    model: serializeModel(model),
    params: serializeParams(params),
    initial: initial.toString(),
    views: views,
    options: { dt, maxTime, width, height }
  };

  const clientBundle = await loadClientBundle();
  const html = renderToHTML(descriptor, clientBundle);
  await displayHTML(html, target);
}
