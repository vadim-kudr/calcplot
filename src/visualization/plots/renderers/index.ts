/**
 * Layer renderers for the modular ViewRenderer architecture
 */

export { LayerRendererFactory } from './LayerRendererFactory';
export { GridRenderer } from './GridRenderer';
export { AxisRenderer } from './AxisRenderer';
export { PlotRenderer } from './PlotRenderer';
export { VectorRenderer } from './VectorRenderer';
export { SceneRenderer } from './SceneRenderer';
export { LegendRenderer } from './LegendRenderer';
export { FillRenderer } from './FillRenderer';
export { RefLineRenderer } from './RefLineRenderer';
export { TitleRenderer } from './TitleRenderer';
export { VectorFieldRenderer } from './VectorFieldRenderer';
export { NullclineRenderer } from './NullclineRenderer';
export { PoincareRenderer } from './PoincareRenderer';

// Export types that are not in BuilderInterfaces
export type { PlotOptions } from './PlotRenderer';
export type { VectorOptions } from './VectorRenderer';
export type { SceneOptions } from './SceneRenderer';
export type { LegendItem } from './LegendRenderer';
