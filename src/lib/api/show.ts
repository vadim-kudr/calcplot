/**
 * show() - Quick visualization API
 * For fast viewing of simulation results
 */

import { Timeline } from '../../core/types';
import { render } from '../rendering';
import { ViewBuilder } from '../builders/ViewBuilder';
import { getTargetWithFallback } from './defaultTarget';

export interface ShowOptions {
  /** Container width */
  width?: number | string;
  /** Container height in pixels */
  height?: number | string;
  /** Target element or ID for rendering */
  target?: string | HTMLElement;
}

/**
 * Creates a quick visualization of simulation results.
 * 
 * @param timeline - Simulation results from simulate() function
 * @param viewConfig - Visualization configuration (single or multiple views)
 * @param options - Display options
 * 
 * @returns Promise that resolves when visualization is rendered
 * 
 * @example
 * ```javascript
 * // Multiple views in a grid
 * await show(timeline, [
 *   view().plot((s) => s.x).axis('Time', 'Position'),
 *   view().plot((s) => s.v).axis('Time', 'Velocity'),
 *   view().plot((s) => [s.x, s.v]).axis('Position', 'Velocity')
 * ]);
 * ```
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
      controls: {} // show mode doesn't have controls
    };
  });

  const descriptor = {
    type: 'show' as const,
    views: views,
    width: options.width,
    height: options.height
  };

  const finalTarget = getTargetWithFallback(options.target);
  await render(descriptor, { width: options.width, height: options.height, target: finalTarget });
}
