/**
 * compare() - Comparison API
 * For comparing multiple simulations side by side
 */

import type { Timeline } from '../../core/types';
import type { CompareDescriptor } from '../types';
import type { Layer } from '../../visualization/plots/interfaces';
import { renderToHTML } from '../utils/renderToHTML';
import { displayHTML } from '../utils/displayHTML';
import { loadClientBundle } from '../utils/bundleLoader';
import { ViewBuilder } from '../builders/ViewBuilder';

export interface CompareConfig {
  /** Labeled timelines for comparison */
  [label: string]: Timeline;
}

export interface CompareOptions {
  /** Container width (default: 'auto') */
  width?: number | string;
  /** Container height in pixels (default: auto) */
  height?: number | string;
  /** Target element or ID for rendering (default: creates new element) */
  target?: string | HTMLElement;
}

/**
 * Compares multiple simulations side by side.
 * 
 * @param timelines - Object mapping labels to simulation timelines
 * @param viewConfig - Visualization configuration applied to all timelines
 * @param options - Display options
 * 
 * @returns Promise that resolves when visualization is rendered
 * 
 * @example
 * ```javascript
 * // Compare different damping values
 * const noDrag = simulate(model).params({ damping: 0 }).run({ timeRange: [0, 10] });
 * const lightDrag = simulate(model).params({ damping: 0.1 }).run({ timeRange: [0, 10] });
 * const heavyDrag = simulate(model).params({ damping: 0.5 }).run({ timeRange: [0, 10] });
 * 
 * await compare({
 *   'No damping': noDrag,
 *   'Light damping': lightDrag,
 *   'Heavy damping': heavyDrag
 * }, view().plot((s) => s.x).axis('Time', 'Position'));
 * ```
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
  const viewBuilder = { toDescriptor: () => timelineDescriptor } as ViewBuilder;

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
interface CombinedTimeline {
  times: number[];
  states: Record<string, number[]>;
  labels: string[];
  at: (time: number) => Record<string, number>;
  serialize: () => string;
}

function createCombinedTimeline(timelines: CompareConfig): CombinedTimeline {
  const combinedTimeline: CombinedTimeline = {
    times: [] as number[],
    states: {} as Record<string, number[]>,
    labels: Object.keys(timelines),
    at: function(time: number): Record<string, number> {
      const result: Record<string, number> = {};
      for (const [key, values] of Object.entries(this.states)) {
        const index = Math.floor(time * (this.times.length - 1) / (Math.max(...this.times) - Math.min(...this.times)));
        result[key] = values[Math.min(index, values.length - 1)];
      }
      return result;
    },
    serialize: function(): string {
      return JSON.stringify({
        times: this.times,
        states: this.states,
        labels: this.labels
      });
    }
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
  combinedTimeline: CombinedTimeline,
  viewBuilder: ViewBuilder,
  options: { width?: number | string; height?: number | string }
): CompareDescriptor {
  // Extract all layers from view builder
  let layers: Layer[];
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
    timeline: {
      times: combinedTimeline.times,
      states: combinedTimeline.states
    },
    layers,
    labels: combinedTimeline.labels || [],
    width: options.width,
    height: options.height
  };
}
