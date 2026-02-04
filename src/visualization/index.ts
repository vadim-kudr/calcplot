/**
 * Visualization Module - All visualization components
 */

// Controls
export { slider, checkbox } from '../lib/controls';
export type { Control, SliderControl, CheckboxControl } from '../lib/controls';

// Plots - renderers and services
export { ViewRenderer } from './plots/renderers/ViewRenderer';
export { SVGManager } from './plots/services/SVGManager';
export { ResizeManager } from './plots/services/ResizeManager';
export { LayerRendererFactory } from './plots/renderers';

// Plot utilities
export { BoundsCalculator, DataFilter, D3ScaleFactory, TickCalculator } from './plots/utils';
export type { Bounds, ChartMargins, ChartDimensions, TickSet } from './plots/utils';

// Plot interfaces
export type { RenderContext } from './plots/interfaces/RenderContext';
