/**
 * View Renderer - handles D3-based SVG rendering with simple architecture
 */

import { SVGManager, ResizeManager } from '../services';
import { LayerRendererFactory } from './LayerRendererFactory';
import { BoundsCalculator, D3ScaleFactory } from '../utils';
import type { RenderContext } from '../interfaces';
import type { Bounds } from '../utils';

let isCalcplotStylesLoading = false;
let isCalcplotStylesLoaded = false;

export interface VisualizationData {
  type: 'view' | 'explore';
  timeline?: any;
  layers?: any;
  params?: any;
  viewDescriptor?: any;
  options?: any;
  width?: number;
  height?: number;
}

export class ViewRenderer {
  private container: HTMLElement;
  private svgManager: SVGManager;
  private resizeManager: ResizeManager;
  private layerRendererFactory: LayerRendererFactory;
  private boundsCalculator: typeof BoundsCalculator;
  private currentData?: VisualizationData;
  private log: (...args: any[]) => void;
  
  // Resize control mechanism
  private isResizing = false;
  private targetWidth: number;
  private targetHeight: number;
  private resizeTimeout?: number;

  constructor(
    container: HTMLElement,
    width: number = 800,
    height: number = 480,
    log: (...args: any[]) => void
  ) {
    this.container = container;
    this.log = log;
    this.targetWidth = width;
    this.targetHeight = height;

    // Apply Calcplot styles
    this.applyCalcplotStyles();

    // Initialize simple services
    this.svgManager = new SVGManager(container, {
      width,
      height,
      defaultBounds: { x: [0, 10], y: [0, 10] }
    });

    // Re-enable resize manager with proper control
    this.resizeManager = new ResizeManager(container, this.onResize.bind(this), { debounceMs: 16 });

    this.layerRendererFactory = new LayerRendererFactory();
    this.boundsCalculator = BoundsCalculator;
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
    if (isCalcplotStylesLoaded || isCalcplotStylesLoading) {
      return;
    }

    // Set loading flag
    isCalcplotStylesLoading = true;

    // Import CSS dynamically from dist path
    fetch('/dist/calcplot-client.css')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load CSS: ${response.status}`);
        }
        return response.text();
      })
      .then(cssText => {
      
      // Create style element and inject CSS
      const style = document.createElement('style');
      style.id = 'calcplot-styles';
      style.textContent = cssText;
      document.head.appendChild(style);
      
      // Set loaded flag
      isCalcplotStylesLoaded = true;
      isCalcplotStylesLoading = false;
    }).catch((error) => {
      console.warn('Failed to load calcplot styles:', error);
      isCalcplotStylesLoading = false;
    });
  }

  /**
   * Handle resize events with proper control mechanism
   */
  private onResize(width: number, height: number): void {
    // Only update if size actually changed and not already resizing
    if ((width !== this.targetWidth || height !== this.targetHeight) && !this.isResizing) {
      // Clear any pending resize
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      
      // Debounce resize to prevent infinite loops
      this.resizeTimeout = window.setTimeout(() => {
        this.updateSize(width, height);
      }, 16); // ~60fps
    }
  }

  /**
   * Update size with proper control mechanism
   */
  private updateSize(width: number, height: number): void {
    if (this.isResizing) {
      return;
    }
    
    this.isResizing = true;
    
    // Only update if there's a significant change (more than 1px)
    if (Math.abs(width - this.targetWidth) <= 1 && Math.abs(height - this.targetHeight) <= 1) {
      this.isResizing = false;
      return;
    }
    
    // Update target dimensions
    this.targetWidth = width;
    this.targetHeight = height;
    
    // Resize SVG manager
    this.svgManager.resize(width, height);
    
    // Re-render if we have current data
    if (this.currentData) {
      this.renderInternal(this.currentData);
    }
    
    // Reset flag after a short delay to allow DOM to settle
    setTimeout(() => {
      this.isResizing = false;
    }, 50);
  }

  /**
   * Extract layers from visualization data
   */
  private extractLayers(data: VisualizationData): any[] {
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
    const boundsLayer = layers.find((layer: any) => layer.type === 'bounds');

    if (boundsLayer && boundsLayer.bounds) {
      finalBounds = boundsLayer.bounds;
    } else {
      finalBounds = this.boundsCalculator.calculateBoundsFromTimeline(data.timeline, layers);
    }

    // Check bounds validity and ensure positive dimensions
    if (!this.boundsCalculator.areBoundsValid(finalBounds)) {
      this.log('Invalid bounds, using defaults');
      finalBounds = { x: [0, 10], y: [0, 10] };
    }

    // Ensure bounds are not negative or zero
    if (finalBounds.x[1] <= finalBounds.x[0] || finalBounds.y[1] <= finalBounds.y[0]) {
      this.log('Invalid bounds (negative or zero), using defaults');
      finalBounds = { x: [0, 10], y: [0, 10] };
    }

    // Update scales with new bounds
    // Extract aspectRatio from axis layer if present
    const axisLayer = layers.find((layer: any) => layer.type === 'axis');
    const aspectRatio = axisLayer?.options?.aspectRatio;
    
    this.svgManager.updateDomains(finalBounds.x, finalBounds.y, aspectRatio);

    // Get updated context with parameters
    const updatedContext = this.svgManager.getContext(data.params);
    
    // Add margins to context for all renderers
    updatedContext.margins = D3ScaleFactory.getProportionalMargins(updatedContext.width, updatedContext.height);

    // Render layers using strategy pattern
    this.renderLayers(layers, updatedContext, data.timeline);
  }

  private renderLayers(layers: any[], context: RenderContext, timeline?: any): void {
    // Group layers by type for batch processing
    const layersByType = new Map<string, any[]>();

    // Collect legend items from plot layers
    const legendItems: any[] = [];

    layers.forEach((layer) => {
      if (!layersByType.has(layer.type)) {
        layersByType.set(layer.type, []);
      }

      // Collect legend items from plot layers
      if (layer.type === 'plot' && layer.options?.label) {
        legendItems.push({
          label: layer.options.label,
          color: layer.options?.color || `hsl(${(layer.index || 0) * 60}, 70%, 50%)`,
          dash: layer.options?.dash || [],
          lineWidth: layer.options?.lineWidth || 2
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
        items: legendItems,
        options: {
          position: 'top-right',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#ccc',
          borderWidth: 1,
          padding: 10,
          fontSize: 12,
          fontColor: '#333'
        }
      });
    }

    // Define rendering order: title -> axis -> grid -> vectorField -> nullcline -> fill -> plot -> refline -> poincare -> legend
    // Title first, then axis/grid for layout, then data layers, finally overlays
    const renderOrder = ['title', 'axis', 'grid', 'vectorField', 'nullcline', 'fill', 'plot', 'refline', 'poincare', 'legend'];
    
    // Render each layer type in the correct order
    for (const layerType of renderOrder) {
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
        this.log(`No renderer found for layer type: ${layerType}`);
      }
    }
  }

  /**
   * Main rendering method
   */
  render(data: VisualizationData): void {
    if (!data.timeline) {
      this.log('No timeline in data!', data);
      return;
    }
    
    this.currentData = data;
    this.renderInternal(data);
  }

  /**
   * Render explore data
   */
  renderExplore(data: VisualizationData, timeline: any): void {
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
   * Get the SVG manager for advanced operations
   */
  getSVGManager(): SVGManager {
    return this.svgManager;
  }

  /**
   * Get current render context
   */
  getRenderContext(): RenderContext {
    return this.svgManager.getContext(this.currentData?.params);
  }

  /**
   * Force a resize check
   */
  checkResize(): void {
    this.resizeManager.checkResize();
  }

  /**
   * Destroy the renderer and clean up resources
   */
  destroy(): void {
    this.resizeManager.destroy();
    this.currentData = undefined;
  }
}
