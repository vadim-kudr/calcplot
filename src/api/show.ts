/**
 * show() - Quick visualization API
 * For fast viewing of simulation results
 */

import { Timeline } from '../core/ivp';
import { renderToHTML } from '../utils/renderToHTML';
import { displayHTML } from '../utils/displayHTML';
import { loadClientBundle } from '../utils/bundleLoader';
import { ViewBuilder } from '../ui/ViewBuilder';

export interface ShowOptions {
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
 * Quick visualization - one liner for simple viewing
 *
 * Usage:
 * show(timeline, view().plot(s => s.y));
 *
 * Multi-panel:
 * show(timeline, [
 *   view().plot(s => s.y),
 *   view().grid().axis().plot(s => s.vx)
 * ]);
 */
export async function show(
  timeline: Timeline,
  viewConfig: ViewBuilder | ViewBuilder[],
  options: ShowOptions = {}
): Promise<void> {
  // Handle single or multiple view configurations
  const viewConfigs = Array.isArray(viewConfig) ? viewConfig : [viewConfig];

  const views = viewConfigs.map((config) => {
    let viewBuilder;
    
    // Handle ViewBuilder
    if (config && typeof config === 'object' && 'executeWithTimeline' in config && typeof config.executeWithTimeline === 'function') {
      // New format: view().plot(...).grid(...) - execute with timeline
      const descriptor = config.executeWithTimeline(timeline);
      viewBuilder = { toDescriptor: () => descriptor } as any;
    } else if (config && typeof config === 'object' && 'toDescriptor' in config && typeof config.toDescriptor === 'function') {
      // Already a ViewBuilder with timeline
      viewBuilder = config;
    } else {
      throw new Error('Invalid view configuration: expected ViewBuilder');
    }

    const descriptor = viewBuilder.toDescriptor();

    return {
      type: 'show' as const,
      timeline: {
        times: timeline.times,
        states: timeline.states
      },
      layers: descriptor.layers,
      controls: descriptor.controls
    };
  });

  const descriptor = {
    type: 'show' as const,
    views: views,
    layout: options.layout || {
      columns: viewConfigs.length,
      rows: 1,
      gaps: 10
    },
    width: options.width,
    height: options.height
  };

  const clientBundle = await loadClientBundle();
  const html = renderToHTML(descriptor, clientBundle);
  await displayHTML(html, options.target);
}
