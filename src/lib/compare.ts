/**
 * compare() - Comparison API
 * For comparing multiple simulations side by side
 */

import { Timeline } from '../core/ivp';
import { renderToHTML } from './utils/renderToHTML';
import { displayHTML } from './utils/displayHTML';
import { loadClientBundle } from './utils/bundleLoader';
import { ViewBuilder } from './builders/ViewBuilder';

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

  // Execute ViewBuilder with combined timeline
  const timelineDescriptor = viewConfig.executeWithTimeline(combinedTimeline);
  const viewBuilder = { toDescriptor: () => timelineDescriptor } as any;

  // Create compare descriptor
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
