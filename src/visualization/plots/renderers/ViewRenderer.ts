/**
 * View Renderer - handles D3-based SVG rendering with simple architecture
 */

import { SVGManager } from '../services';
import { LayerRendererFactory } from './LayerRendererFactory';
import { BoundsCalculator, D3ScaleFactory } from '../utils';
import type { RenderContext } from '../interfaces';
import type { Bounds } from '../utils';
import type { Layer } from '../interfaces';
import type { PlotOptions } from '../renderers/PlotRenderer';
import type { AxisOptions } from '../renderers/AxisRenderer';
import type { Timeline, State, Params } from '../../../core/types';

export interface VisualizationData {
  type: 'view' | 'explore';
  timeline?: Timeline;
  layers?: Layer[];
  params?: Params;
  viewDescriptor?: {
    layers?: Layer[];
    controls?: Record<string, unknown>;
  };
  options?: Record<string, unknown>;
  width?: number;
  height?: number;
}

export class ViewRenderer {
  private static isCalcplotStylesLoading = false;
  private static isCalcplotStylesLoaded = false;
  private static readonly renderOrder = [
    'title',
    'axis',
    'grid',
    'vectorField',
    'nullcline',
    'fill',
    'plot',
    'refline',
    'poincare',
    'legend'
  ] as const;

  private container: HTMLElement;
  private svgManager: SVGManager;
  private layerRendererFactory: LayerRendererFactory;
  private boundsCalculator: typeof BoundsCalculator;
  private currentData?: VisualizationData;

  constructor(container: HTMLElement, width?: number, height?: number) {
    this.container = container;
    this.svgManager = new SVGManager(container, { width, height });
    this.layerRendererFactory = new LayerRendererFactory();
    this.boundsCalculator = BoundsCalculator;
    this.applyCalcplotStyles();
  }

  // Public getter for SVGManager to access margins
  getSVGManager(): SVGManager {
    return this.svgManager;
  }

  /**
   * Apply Calcplot CSS styles
   */
  private applyCalcplotStyles(): void {
    // Always add classes to container (but check if already present)
    if (!this.container.classList.contains('calcplot-style')) {
      this.container.classList.add('calcplot-style', 'calcplot-view');
    }

    // Check if styles are already loaded or loading
    if (ViewRenderer.isCalcplotStylesLoaded || ViewRenderer.isCalcplotStylesLoading) {
      return;
    }

    // Set loading flag
    ViewRenderer.isCalcplotStylesLoading = true;

    // Import CSS dynamically from dist path
    fetch('/dist/calcplot-client.css')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load CSS: ${response.status}`);
        }
        return response.text();
      })
      .then((cssText) => {
        // Create style element and inject CSS
        const style = document.createElement('style');
        style.id = 'calcplot-styles';
        style.textContent = cssText;
        document.head.appendChild(style);

        // Set loaded flag
        ViewRenderer.isCalcplotStylesLoaded = true;
        ViewRenderer.isCalcplotStylesLoading = false;
      })
      .catch((error) => {
        console.warn('Failed to load calcplot styles:', error);
        ViewRenderer.isCalcplotStylesLoading = false;
      });
  }

  /**
   * Update size with proper control mechanism
   */
  public updateSize(width: number, height: number): void {
    // Resize SVG manager
    this.svgManager.resize(width, height);

    // Re-render if we have current data
    if (this.currentData) {
      this.renderInternal(this.currentData);
    }
  }

  /**
   * Extract layers from visualization data
   */
  private extractLayers(data: VisualizationData): Layer[] {
    let layers = data.layers || [];

    if (data.viewDescriptor && data.viewDescriptor.layers) {
      layers = data.viewDescriptor.layers;
    }
    return layers;
  }

  /**
   * Internal render method with simple approach
   */
  private renderInternal(data: VisualizationData): void {
    // Clear previous content
    const context = this.svgManager.getContext();
    context.g.selectAll('*').remove();

    // Get layers
    const layers = this.extractLayers(data);

    // Calculate bounds
    let finalBounds: Bounds;
    const boundsLayer = layers.find((layer: Layer) => layer.type === 'bounds');

    if (
      boundsLayer &&
      boundsLayer.bounds &&
      typeof boundsLayer.bounds.x !== 'string' &&
      typeof boundsLayer.bounds.y !== 'string'
    ) {
      finalBounds = boundsLayer.bounds as Bounds;
    } else {
      finalBounds = this.boundsCalculator.calculateBoundsFromTimeline(
        data.timeline || ({ times: [], states: {} } as unknown as Timeline),
        layers
      );
    }

    // Check bounds validity and ensure positive dimensions
    if (!this.boundsCalculator.areBoundsValid(finalBounds)) {
      console.warn('Invalid bounds, using defaults');
      finalBounds = { x: [0, 10], y: [0, 10] };
    }

    // Ensure bounds are not negative or zero
    if (finalBounds.x[1] <= finalBounds.x[0] || finalBounds.y[1] <= finalBounds.y[0]) {
      console.warn('Invalid bounds (negative or zero), using defaults');
      finalBounds = { x: [0, 10], y: [0, 10] };
    }

    // Update scales with new bounds
    // Extract aspectRatio from axis layer if present
    const axisLayer = layers.find((layer: Layer) => layer.type === 'axis');
    const aspectRatio = (axisLayer?.options as AxisOptions)?.aspectRatio?.toString();

    this.svgManager.updateDomains(finalBounds.x, finalBounds.y, aspectRatio);

    // Get updated context with parameters
    const updatedContext = this.svgManager.getContext(data.params as any);

    // Render layers using strategy pattern
    this.renderLayers(layers, updatedContext, data.timeline);
  }

  private renderLayers(layers: Layer[], context: RenderContext, timeline?: Timeline): void {
    // Group layers by type for batch processing
    const layersByType = new Map<string, Layer[]>();

    // Collect legend items from plot layers
    const legendItems: Array<{
      label: string;
      color: string;
      dash: number[];
      lineWidth: number;
    }> = [];

    layers.forEach((layer) => {
      if (!layersByType.has(layer.type)) {
        layersByType.set(layer.type, []);
      }

      // Collect legend items from plot layers
      if (
        layer.type === 'plot' &&
        layer.options &&
        'label' in layer.options &&
        layer.options.label
      ) {
        const plotOptions = layer.options as PlotOptions;
        const layerWithIndex = layer as Layer & { index?: number };
        legendItems.push({
          label: plotOptions.label!,
          color: plotOptions.color || `hsl(${(layerWithIndex.index || 0) * 60}, 70%, 50%)`,
          dash: plotOptions.dash || [],
          lineWidth: plotOptions.lineWidth || 2
        });
      }

      layersByType.get(layer.type)!.push(layer);
    });

    // Add legend layer
    if (legendItems.length > 0) {
      if (!layersByType.has('legend')) {
        layersByType.set('legend', []);
      }
      layersByType.get('legend')!.push({
        type: 'legend',
        options: {
          items: legendItems,
          position: 'top-right',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#ccc',
          borderWidth: 1,
          padding: 10,
          fontSize: 12,
          fontColor: '#333'
        }
      } as Layer & { options: { items: typeof legendItems } & Record<string, unknown> });
    }

    // Define rendering order: title -> axis -> grid -> vectorField -> nullcline -> fill -> plot -> refline -> poincare -> legend
    // Title first, then axis/grid for layout, then data layers, finally overlays

    // Render each layer type in the correct order
    for (const layerType of ViewRenderer.renderOrder) {
      if (!layersByType.has(layerType)) {
        continue; // Skip if no layers of this type
      }

      const layerList = layersByType.get(layerType)!;

      if (this.layerRendererFactory.hasRenderer(layerType)) {
        const renderer = this.layerRendererFactory.getRenderer(layerType);

        if (layerType === 'plot') {
          // Special handling for plot layers to include index
          layerList.forEach((layer, index) => {
            const layerWithIndex = { ...layer, index };
            renderer.render(layerWithIndex, context, timeline);
          });
        } else {
          // Render other layer types
          layerList.forEach((layer) => {
            renderer.render(layer, context, timeline);
          });
        }
      } else {
        console.warn(`No renderer found for layer type: ${layerType}`);
      }
    }
  }

  /**
   * Main rendering method
   */
  render(data: VisualizationData): void {
    if (!data.timeline) {
      console.warn('No timeline in data!', data);
      return;
    }

    this.currentData = data;
    this.renderInternal(data);
  }

  /**
   * Render explore data
   */
  renderExplore(data: VisualizationData, timeline: Timeline): void {
    this.render({
      type: 'view',
      timeline: timeline,
      layers: data.layers,
      options: data.options,
      viewDescriptor: data.viewDescriptor
    });
  }

  /**
   * Get the layer renderer factory for custom renderer registration
   */
  getLayerRendererFactory(): LayerRendererFactory {
    return this.layerRendererFactory;
  }

  /**
   * Get current render context
   */
  getRenderContext(): RenderContext {
    return this.svgManager.getContext(this.currentData?.params);
  }

  /**
   * Destroy the renderer and clean up resources
   */
  destroy(): void {
    this.svgManager.destroy();
    this.currentData = undefined;
  }
}
