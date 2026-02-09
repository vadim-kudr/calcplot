/**
 * Core interfaces for the modular ViewRenderer architecture
 */

export { BaseLayer } from './BaseLayer';
export { RenderContext } from './RenderContext';
export { LayerRenderer, Layer } from './LayerRenderer';

// Export all Options types from renderers
export type { PlotOptions } from '../renderers/PlotRenderer';
export type { AxisOptions } from '../renderers/AxisRenderer';
export type { GridOptions } from '../renderers/GridRenderer';
export type { VectorOptions } from '../renderers/VectorRenderer';
export type { FillOptions } from '../renderers/FillRenderer';
export type { RefLineOptions } from '../renderers/RefLineRenderer';
export type { LegendOptions } from '../renderers/LegendRenderer';
export type { TitleOptions } from '../renderers/TitleRenderer';
export type { VectorFieldOptions } from '../renderers/VectorFieldRenderer';
export type { NullclineOptions } from '../renderers/NullclineRenderer';
export type { PoincareOptions } from '../renderers/PoincareRenderer';
export type { SceneOptions } from '../renderers/SceneRenderer';
