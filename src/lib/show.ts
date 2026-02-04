/**
 * show() - Quick visualization API
 * For fast viewing of simulation results
 */

import { Timeline } from '../core/ivp';
import { renderToHTML } from './utils/renderToHTML';
import { displayHTML } from './utils/displayHTML';
import { loadClientBundle } from './utils/bundleLoader';
import { ViewBuilder } from './builders/ViewBuilder';

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

  const views = viewConfigs.map((viewBuilder) => {
    // Execute ViewBuilder with timeline
    const timelineDescriptor = viewBuilder.executeWithTimeline(timeline);
    const descriptor = timelineDescriptor;

    return {
      type: 'show' as const,
      timeline: {
        times: timeline.times,
        states: timeline.states
      },
      layers: descriptor.layers,
      controls: [] // show mode doesn't have controls
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
