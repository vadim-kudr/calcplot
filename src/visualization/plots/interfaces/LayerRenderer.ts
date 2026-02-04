/**
 * LayerRenderer - Strategy interface for different layer rendering types
 */

import { RenderContext } from './RenderContext';

export interface LayerRenderer {
  render(layer: any, context: RenderContext, timeline?: any): void;
}
