/**
 * LayerRenderer - Strategy interface for different layer rendering types
 */

import { RenderContext } from './RenderContext';
import { State, Params } from '../../../core/types';
import { SelectorFunction } from '../../../lib/builders/BuilderInterfaces';
import { BaseLayer } from './BaseLayer';

// Import all layer types from renderers
import type { AxisLayer } from '../renderers/AxisRenderer';
import type { GridLayer } from '../renderers/GridRenderer';
import type { PlotLayer } from '../renderers/PlotRenderer';
import type { VectorLayer } from '../renderers/VectorRenderer';
import type { VectorFieldLayer } from '../renderers/VectorFieldRenderer';
import type { FillLayer } from '../renderers/FillRenderer';
import type { RefLineLayer } from '../renderers/RefLineRenderer';
import type { TitleLayer } from '../renderers/TitleRenderer';
import type { LegendLayer } from '../renderers/LegendRenderer';
import type { NullclineLayer } from '../renderers/NullclineRenderer';
import type { PoincareLayer } from '../renderers/PoincareRenderer';
import { SceneLayer } from '../../../lib/builders/BuilderInterfaces';
import type { Bounds } from '../utils';

// Define BoundsLayer interface
export interface BoundsLayer {
  type: 'bounds';
  bounds?: Bounds;
  index?: number;
  options?: any;
}

// Union type for all layers
export type Layer = 
  | AxisLayer
  | GridLayer 
  | PlotLayer 
  | VectorLayer 
  | BoundsLayer 
  | SceneLayer
  | FillLayer 
  | RefLineLayer 
  | TitleLayer 
  | LegendLayer 
  | VectorFieldLayer 
  | NullclineLayer 
  | PoincareLayer;

export interface LayerRenderer {
  render(layer: Layer, context: RenderContext, timeline?: any): void;
}

// Helper functions for type checking
export const isPlotLayer = (layer: Layer): layer is PlotLayer => layer.type === 'plot';
export const isVectorLayer = (layer: Layer): layer is VectorLayer => layer.type === 'vector';
export const isFillLayer = (layer: Layer): layer is FillLayer => layer.type === 'fill';
export const isVectorFieldLayer = (layer: Layer): layer is VectorFieldLayer => layer.type === 'vectorField';
export const isNullclineLayer = (layer: Layer): layer is NullclineLayer => layer.type === 'nullcline';
export const isPoincareLayer = (layer: Layer): layer is PoincareLayer => layer.type === 'poincare';
export const isSceneLayer = (layer: Layer): layer is SceneLayer => layer.type === 'scene';
