/**
 * LayerRendererFactory - Factory for creating and managing layer renderers
 */

import { LayerRenderer } from '../interfaces';
import { GridRenderer } from './GridRenderer';
import { AxisRenderer } from './AxisRenderer';
import { PlotRenderer } from './PlotRenderer';
import { VectorRenderer } from './VectorRenderer';
import { SceneRenderer } from './SceneRenderer';
import { LegendRenderer } from './LegendRenderer';
import { FillRenderer } from './FillRenderer';
import { RefLineRenderer } from './RefLineRenderer';
import { TitleRenderer } from './TitleRenderer';
import { VectorFieldRenderer } from './VectorFieldRenderer';
import { NullclineRenderer } from './NullclineRenderer';
import { PoincareRenderer } from './PoincareRenderer';

export class LayerRendererFactory {
  private renderers = new Map<string, LayerRenderer>();

  constructor() {
    this.registerDefaultRenderers();
  }

  /**
   * Register default layer renderers
   */
  private registerDefaultRenderers(): void {
    this.register('grid', new GridRenderer());
    this.register('axis', new AxisRenderer());
    this.register('plot', new PlotRenderer());
    this.register('vector', new VectorRenderer());
    this.register('scene', new SceneRenderer());
    this.register('legend', new LegendRenderer());
    this.register('fill', new FillRenderer());
    this.register('refline', new RefLineRenderer());
    this.register('title', new TitleRenderer());
    this.register('vectorField', new VectorFieldRenderer());
    this.register('nullcline', new NullclineRenderer());
    this.register('poincare', new PoincareRenderer());
  }

  /**
   * Register a new layer renderer
   */
  register(type: string, renderer: LayerRenderer): void {
    this.renderers.set(type, renderer);
  }

  /**
   * Get a layer renderer by type
   */
  getRenderer(type: string): LayerRenderer {
    const renderer = this.renderers.get(type);
    if (!renderer) {
      throw new Error(`No renderer registered for type: ${type}`);
    }
    return renderer;
  }

  /**
   * Check if a renderer type is registered
   */
  hasRenderer(type: string): boolean {
    return this.renderers.has(type);
  }

  /**
   * Get all registered renderer types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.renderers.keys());
  }

  /**
   * Unregister a renderer type
   */
  unregister(type: string): boolean {
    return this.renderers.delete(type);
  }

  /**
   * Clear all registered renderers
   */
  clear(): void {
    this.renderers.clear();
  }

  /**
   * Reset to default renderers
   */
  reset(): void {
    this.clear();
    this.registerDefaultRenderers();
  }
}
