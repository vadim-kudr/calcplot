/**
 * compare() - Comparison API
 * For comparing multiple simulations side by side
 */

import { Timeline } from '../core/ivp';
import { renderToHTML } from '../utils/renderToHTML';
import { displayHTML } from '../utils/displayHTML';
import { loadClientBundle } from '../utils/bundleLoader';
import { ViewBuilder } from '../ui/ViewBuilder';

export interface CompareConfig {
  [label: string]: Timeline;
}

export interface CompareOptions {
  width?: number | string;
  height?: number | string;
  target?: string | HTMLElement;
}

/**
 * Compare multiple simulations
 *
 * Usage:
 * compare({
 *   'No drag': simulate(Model).params({ k: 0 }).run(),
 *   'Light drag': simulate(Model).params({ k: 0.05 }).run(),
 *   'Heavy drag': simulate(Model).params({ k: 0.2 }).run()
 * }, view().plot(s => s.y));
 */
export async function compare(
  timelines: CompareConfig,
  viewConfig: ViewBuilder,
  options: CompareOptions = {}
): Promise<void> {
  // Create combined timeline first
  const combinedTimeline = createCombinedTimeline(timelines);

  let viewBuilder;
  
  // Handle ViewBuilder
  if (viewConfig && typeof viewConfig === 'object' && 'executeWithTimeline' in viewConfig && typeof viewConfig.executeWithTimeline === 'function') {
    // New format: view().plot(...).grid(...) - execute with combined timeline
    const descriptor = viewConfig.executeWithTimeline(combinedTimeline);
    viewBuilder = { toDescriptor: () => descriptor } as any;
  } else if (viewConfig && typeof viewConfig === 'object' && 'toDescriptor' in viewConfig && typeof viewConfig.toDescriptor === 'function') {
    // For ViewBuilder, set the combined timeline and get descriptor
    viewConfig.setTimeline(combinedTimeline);
    viewBuilder = viewConfig;
  } else {
    throw new Error('Invalid view configuration: expected ViewBuilder');
  }

  // For compare, we need to merge all timelines into the view
  const descriptor = createCompareDescriptor(combinedTimeline, viewBuilder, options);

  const clientBundle = await loadClientBundle();
  const html = renderToHTML(descriptor, clientBundle);

  // Use unified displayHTML function
  await displayHTML(html, options.target);
}

/**
 * Create combined timeline from multiple timelines
 */
function createCombinedTimeline(timelines: CompareConfig): any {
  const combinedTimeline = {
    times: [] as number[],
    states: {} as Record<string, number[]>,
    labels: Object.keys(timelines)
  };

  // Merge timeline data
  for (const [label, timeline] of Object.entries(timelines)) {
    if (combinedTimeline.times.length === 0) {
      combinedTimeline.times = timeline.times.map((_, i) => i);
    }

    // Prefix state keys with label to avoid conflicts
    for (const [key, values] of Object.entries(timeline.states)) {
      combinedTimeline.states[`${label}_${key}`] = values;
    }
  }

  return combinedTimeline;
}

/**
 * Create descriptor for comparison visualization
 */
function createCompareDescriptor(
  combinedTimeline: any,
  viewBuilder: any,
  options: { width?: number | string; height?: number | string }
): any {
  // Extract all layers from view builder
  let layers;
  if (viewBuilder.getLayers) {
    layers = viewBuilder.getLayers();
  } else if (viewBuilder.toDescriptor) {
    // For wrapped viewBuilder, get layers from descriptor
    const descriptor = viewBuilder.toDescriptor();
    layers = descriptor.layers || [];
  } else {
    layers = [];
  }

  return {
    type: 'compare' as const,
    timeline: combinedTimeline,
    viewDescriptor: {
      timeline: combinedTimeline,
      layers: layers
    },
    layers,
    labels: combinedTimeline.labels || [],
    width: options.width,
    height: options.height
  };
}
