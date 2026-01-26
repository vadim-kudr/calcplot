/**
 * View Renderer - handles canvas creation and rendering
 */

import { Bounds, CanvasRenderer } from '../../ui/CanvasRenderer/CanvasRenderer';
import { FunctionSerializer } from '../serialization';

export interface VisualizationData {
  type: 'view' | 'explore';
  timeline?: any;
  layers?: any;
  params?: any;
  viewDescriptor?: any; // Add viewDescriptor with layers
  options?: any;
  width?: number;
  height?: number;
}

export class ViewRenderer {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private log: (...args: any[]) => void;
  private resizeObserver?: ResizeObserver;
  private targetWidth: number;
  private targetHeight: number;
  private currentData?: VisualizationData;
  private currentTimeline?: any;
  private resizeTimeout?: number;
  private isResizing = false;

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
    this.canvas = this.createCanvas(width, height);
    this.renderer = new CanvasRenderer(
      this.canvas.getContext('2d')!,
      this.canvas.width,
      this.canvas.height,
      this.canvas
    );
    this.setupResizeObserver();
  }

  /**
   * Create and append canvas to container
   */
  private createCanvas(width: number, height: number): HTMLCanvasElement {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `<canvas width="${width}" height="${height}"></canvas>`;
    const canvas = tempDiv.firstChild as HTMLCanvasElement;

    // Make canvas responsive - check if style exists (for test environments)
    if (canvas.style) {
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
    }

    this.container.appendChild(canvas);

    return canvas;
  }

  /**
   * Setup ResizeObserver to handle container size changes
   */
  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          

          // Only update if size actually changed and not already resizing
          if ((width !== this.targetWidth || height !== this.targetHeight) && !this.isResizing) {
            // Clear any pending resize
            if (this.resizeTimeout) {
              clearTimeout(this.resizeTimeout);
            }
            
            // Debounce resize to prevent infinite loops
            this.resizeTimeout = window.setTimeout(() => {
              this.updateCanvasSize(width, height);
            }, 16); // ~60fps
          } else if (this.isResizing) {
            this.log('Skipping update - already resizing');
          } else {
            this.log('Skipping update - size unchanged');
          }
        }
      });
      
      
      this.resizeObserver.observe(this.container);
    } else {
      this.log('ResizeObserver not supported');
    }
  }

  /**
   * Update canvas size based on container dimensions
   */
  private updateCanvasSize(containerWidth: number, containerHeight: number): void {
    if (this.isResizing) {
      this.log('updateCanvasSize called but already resizing - skipping');
      return;
    }
    
    this.isResizing = true;
    
    
    // Use actual container dimensions instead of target dimensions
    const newWidth = Math.floor(containerWidth);
    const newHeight = Math.floor(containerHeight);
    
    // Only update if there's a significant change (more than 1px)
    if (Math.abs(newWidth - this.targetWidth) <= 1 && Math.abs(newHeight - this.targetHeight) <= 1) {
      this.log('Size change too small, skipping update');
      this.isResizing = false;
      return;
    }
    
    // Debug canvas element before changes
    
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;
    this.targetWidth = newWidth;
    this.targetHeight = newHeight;
    
    // Save data from old renderer before creating new one
    const oldDatasets = this.renderer?.['currentDatasets'];
    const oldOptions = this.renderer?.['currentOptions'];
    
    this.renderer = new CanvasRenderer(
      this.canvas.getContext("2d")!,
      this.canvas.width,
      this.canvas.height,
      this.canvas
    );
    
    // Restore data to new renderer
    if (oldDatasets && oldOptions) {
      this.renderer['currentDatasets'] = oldDatasets;
      this.renderer['currentOptions'] = oldOptions;
    }
    
    // Debug canvas element after changes
    
    if (this.currentData) {
      this.renderInternal(this.currentData);
    }
    
    // Reset flag after a short delay to allow DOM to settle
    setTimeout(() => {
      this.isResizing = false;
      this.log('Resize completed, flag reset');
    }, 50);
  }

  /**
   * Internal render method without saving data
   */
  private renderInternal(data: VisualizationData): void {
    
    // Clear canvas
    this.renderer.clear();
    
    // Get layers
    let layers = data.layers || [];
    if (data.viewDescriptor && data.viewDescriptor.layers) {
      layers = data.viewDescriptor.layers;
    }
    
    
    // 1. Определяем bounds
    let finalBounds: Bounds;
    const boundsLayer = layers.find((layer: any) => layer.type === 'bounds');
    
    if (boundsLayer && boundsLayer.bounds) {
      finalBounds = boundsLayer.bounds;
    } else {
      finalBounds = this.calculateBoundsFromTimeline(data.timeline, layers);
    }
    
    // Check bounds validity
    if (!this.areBoundsValid(finalBounds)) {
      this.log('Invalid bounds, using defaults');
      finalBounds = { x: [0, 10], y: [0, 10] };
    }
    
    
    // Set bounds in renderer
    this.renderer.setBounds(finalBounds);

    // 2. Рендерим grid и axes
    const gridLayer = layers.find((layer: any) => layer.type === 'grid');
    if (gridLayer) {
      this.renderer.drawGrid(gridLayer.options || {});
    }
    
    const axisLayer = layers.find((layer: any) => layer.type === 'axis');
    if (axisLayer) {
      this.renderer.drawAxis(axisLayer.options || {});
    }
    
    // 3. Собираем данные для plot
    const plotLayers = layers.filter((layer: any) => layer.type === 'plot');
    const plotDatasets: Array<{x: number[], y: number[], color?: string}> = [];
    const legendItems: Array<{label: string, color: string}> = [];
    
    plotLayers.forEach((layer: any, index: number) => {
      const plotData = this.extractPlotData(data.timeline, layer);
      if (plotData) {
        // Filter valid data
        const validData = this.filterValidData(plotData.xValues, plotData.yValues);
        
        if (validData.xValues.length > 0) {
          plotDatasets.push({
            x: validData.xValues,
            y: validData.yValues,
            color: layer.options?.color
          });
          
          if (layer.options?.label) {
            legendItems.push({
              label: layer.options.label,
              color: layer.options.color || `hsl(${index * 60}, 70%, 50%)` 
            });
          }
        } else {
          this.log('No valid data points for layer', index);
        }
      }
    });
    
    // 4. Рендерим графики (только если есть валидные данные)
    if (plotDatasets.length > 0 && plotDatasets.some(d => d.x.length > 0)) {
      
      // Collect options for plotMultiple
      const plotOptions: any = {
        aspectRatio: axisLayer?.options?.aspectRatio || 'auto',
        autoScale: false, // Important: disable autoScale when bounds are set manually
        showGrid: gridLayer?.options?.showGrid !== false,
        includeZeroInGrid: gridLayer?.options?.includeZeroInGrid !== false, // Include zero in grid by default
        showTicks: axisLayer?.options?.showTicks !== false,
        showLabels: axisLayer?.options?.showLabels !== false
      };
      
      // Add axis labels if present
      if (axisLayer?.options) {
        if (axisLayer.options.xLabel) plotOptions.xLabel = axisLayer.options.xLabel;
        if (axisLayer.options.yLabel) plotOptions.yLabel = axisLayer.options.yLabel;
      }
      
      // Render all plots
      if (legendItems.length > 0) {
        plotOptions.legend = {
          items: legendItems,
          position: 'top-right'
        };
      }
      
      this.renderer.plotMultiple(plotDatasets, plotOptions);
    } else {
      this.log('No valid data to plot');
    }
    
    // 5. Рендерим scene layers
    const sceneLayers = layers.filter((layer: any) => layer.type === 'scene');
    sceneLayers.forEach((layer: any, index: number) => {
      if (layer.draw) {
        this.renderScene(data.timeline, layer);
      }
    });
    
    // 6. Рендерим vector layers
    const vectorLayers = layers.filter((layer: any) => layer.type === 'vector');
    vectorLayers.forEach((layer: any, index: number) => {
      if (layer.at && layer.dir) {
        this.renderVectors(data.timeline, layer);
      }
    });
  }

  /**
   * Main rendering method
   */
  render(data: VisualizationData): void {
    if (!data.timeline) {
      return;
    }

    // Save current data for resize handling
    this.currentData = data;

    // Use internal render method
    this.renderInternal(data);
  }

  // Add method to filter valid data
  private filterValidData(xValues: number[], yValues: number[]): { xValues: number[], yValues: number[] } {
    const validX: number[] = [];
    const validY: number[] = [];
    
    for (let i = 0; i < xValues.length; i++) {
      if (
        xValues[i] !== null && xValues[i] !== undefined && 
        yValues[i] !== null && yValues[i] !== undefined &&
        isFinite(xValues[i]) && isFinite(yValues[i])
      ) {
        validX.push(xValues[i]);
        validY.push(yValues[i]);
      }
    }
    
    return { xValues: validX, yValues: validY };
  }

  private extractPlotData(timeline: any, layer: any): { xValues: number[], yValues: number[] } | null {
    const { selector } = layer;

    // Determine if this is a parametric plot by checking the selector
    let isParametric = false;
    try {
      const testState = { x: 0, y: 0 };
      const result = FunctionSerializer.parseAndCreateFunction(['s'], selector)(testState);
      isParametric = Array.isArray(result) && result.length === 2;
    } catch (e) {
      isParametric = false;
      this.log('Parametric check failed:', e);
    }

    // Create function from selector string
    let selectFn: (s: any) => any;
    try {
      selectFn = FunctionSerializer.parseAndCreateFunction(['s'], selector) as (s: any) => any;
    } catch (e) {
      this.log('Failed to compile selector:', e);
      return null;
    }

    if (isParametric) {
      // Extract x,y pairs for parametric plot
      const points = timeline.times.map((_: any, i: number) => {
        const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
          acc[key] = timeline.states[key][i];
          return acc;
        }, {});
        const result = selectFn(state);
        return result;
      });

      const validPoints = points.filter(
        (p: any) =>
          Array.isArray(p) && p.length === 2 && typeof p[0] === 'number' && typeof p[1] === 'number'
      );

      const xValues = validPoints.map((p: any) => p[0]);
      const yValues = validPoints.map((p: any) => p[1]);

      return { xValues, yValues };
    } else {
      // Extract y values for regular plot
      const yValues = timeline.times.map((_: any, i: number) => {
        const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
          acc[key] = timeline.states[key][i];
          return acc;
        }, {});
        const result = selectFn(state);
        return result;
      });

      const xValues = timeline.times;

      // Filter valid data
      const filteredData = this.filterValidData(xValues, yValues);

      return filteredData;
    }
  }

  private renderPlot(timeline: any, layer: any): void {
    const { selector, options = {} } = layer;

    // Determine if this is a parametric plot by checking the selector
    let isParametric = false;
    try {
      const testState = { x: 0, y: 0 };
      const result = FunctionSerializer.parseAndCreateFunction(['s'], selector)(testState);
      isParametric = Array.isArray(result) && result.length === 2;
    } catch (e) {
      isParametric = false;
    }

    // Create function from selector string
    let selectFn: (s: any) => any;
    try {
      selectFn = FunctionSerializer.parseAndCreateFunction(['s'], selector) as (s: any) => any;
    } catch (e) {
      this.log('Failed to compile selector:', e);
      selectFn = (s: any) => 0;
    }

    if (isParametric) {
      // Extract x,y pairs for parametric plot
      const points = timeline.times.map((_: any, i: number) => {
        const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
          acc[key] = timeline.states[key][i];
          return acc;
        }, {});
        return selectFn(state);
      });

      const validPoints = points.filter(
        (p: any) =>
          Array.isArray(p) && p.length === 2 && typeof p[0] === 'number' && typeof p[1] === 'number'
      );

      const xValues = validPoints.map((p: any) => p[0]);
      const yValues = validPoints.map((p: any) => p[1]);

      this.renderer.plot(xValues, yValues, options);
    } else {
      // Extract y values for regular plot
      const yValues = timeline.times.map((_: any, i: number) => {
        const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
          acc[key] = timeline.states[key][i];
          return acc;
        }, {});
        return selectFn(state);
      });

      this.renderer.plot(timeline.times, yValues, options);
    }
  }

  private renderVectors(timeline: any, layer: any): void {
    const { at, dir, options = {} } = layer;

    if (!at || !dir) {
      return;
    }

    let atFn: (s: any) => any;
    let dirFn: (s: any) => any;
    try {
      atFn = FunctionSerializer.parseAndCreateFunction(['s'], at) as (s: any) => any;
      dirFn = FunctionSerializer.parseAndCreateFunction(['s'], dir) as (s: any) => any;
    } catch (e) {
      this.log('Failed to compile vector functions:', e);
      return;
    }

    const xPositions: number[] = [];
    const yPositions: number[] = [];
    const vx: number[] = [];
    const vy: number[] = [];

    timeline.times.forEach((_: any, i: number) => {
      const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
        acc[key] = timeline.states[key][i];
        return acc;
      }, {});

      try {
        const position = atFn(state);
        const direction = dirFn(state);
        
        if (Array.isArray(position) && position.length === 2 && 
            Array.isArray(direction) && direction.length === 2) {
          xPositions.push(position[0]);
          yPositions.push(position[1]);
          vx.push(direction[0]);
          vy.push(direction[1]);
        }
      } catch (e) {
        this.log('Error in vector functions:', e);
      }
    });

    if (xPositions.length > 0) {
      this.renderer.drawVectors(xPositions, yPositions, vx, vy, options);
    }
  }

  renderScene(timeline: any, layer: any): void {
    const { draw } = layer;

    if (!draw) {
      return;
    }

    let drawFn: (ctx: any, state: any) => void;
    try {
      drawFn = FunctionSerializer.parseAndCreateFunction(['ctx', 'state'], draw) as (
        ctx: any,
        state: any
      ) => void;
    } catch (e) {
      this.log('Failed to compile scene function:', e);
      return;
    }

    timeline.times.forEach((_: any, i: number) => {
      const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
        acc[key] = timeline.states[key][i];
        return acc;
      }, {});

      try {
        drawFn(this.renderer.createDrawContext(), state);
      } catch (e) {
        this.log('Error in scene function:', e);
      }
    });
  }

  renderExplore(data: VisualizationData, timeline: any): void {
    // Save timeline for resize handling
    this.currentTimeline = timeline;

    this.render({
      type: 'view',
      timeline: timeline,
      layers: data.layers,
      options: data.options,
      viewDescriptor: data.viewDescriptor
    });
  }

  /**
   * Calculate bounds from timeline data
   */
  private calculateBoundsFromTimeline(timeline: any, layers?: any[]): Bounds {
    let xMin = Infinity,
      xMax = -Infinity;
    let yMin = Infinity,
      yMax = -Infinity;

    // First try to find bounds from selectors in plot layers
    if (layers) {
      const plotLayers = layers.filter(layer => layer.type === 'plot' && layer.selector);
      
      for (const layer of plotLayers) {
        try {
          const selectFn = FunctionSerializer.parseAndCreateFunction(['s'], layer.selector);
          
          // Test if selector is parametric
          const testState = { x: 0, y: 0 };
          const result = selectFn(testState);
          const isParametric = Array.isArray(result) && result.length === 2;
          
          if (isParametric) {
            // Extract all points from timeline
            const points = timeline.times.map((_: any, i: number) => {
              const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
                acc[key] = timeline.states[key][i];
                return acc;
              }, {});
              return selectFn(state);
            }).filter((p: any) => Array.isArray(p) && p.length === 2 && typeof p[0] === 'number' && typeof p[1] === 'number');
            
            // Update bounds from points
            for (const point of points) {
              xMin = Math.min(xMin, point[0]);
              xMax = Math.max(xMax, point[0]);
              yMin = Math.min(yMin, point[1]);
              yMax = Math.max(yMax, point[1]);
            }
          } else {
            // For non-parametric plots, use time as x and selector result as y
            const yValues = timeline.times.map((_: any, i: number) => {
              const state = Object.keys(timeline.states).reduce((acc: any, key: string) => {
                acc[key] = timeline.states[key][i];
                return acc;
              }, {});
              return selectFn(state);
            }).filter((v: any) => typeof v === 'number');
            
            xMin = Math.min(xMin, ...timeline.times);
            xMax = Math.max(xMax, ...timeline.times);
            yMin = Math.min(yMin, ...yValues);
            yMax = Math.max(yMax, ...yValues);
          }
        } catch (e) {
          this.log('Failed to analyze selector for bounds:', e);
        }
      }
    }
    
    // Fallback: use time for x-axis if bounds not found from selectors
    if (xMin === Infinity && timeline.times) {
      xMin = Math.min(...timeline.times);
      xMax = Math.max(...timeline.times);
    }

    // Default values if still not found
    if (xMin === Infinity) xMin = 0;
    if (xMax === -Infinity) xMax = 10;
    if (yMin === Infinity) yMin = -10;
    if (yMax === -Infinity) yMax = 10;

    const xPadding = (xMax - xMin) * 0.1 || 1;
    const yPadding = (yMax - yMin) * 0.1 || 1;

    return {
      x: [xMin - xPadding, xMax + xPadding],
      y: [yMin - yPadding, yMax + yPadding]
    };
  }

  // Helper method to check bounds
  private areBoundsValid(bounds: Bounds): boolean {
    return (
      bounds &&
      Array.isArray(bounds.x) && bounds.x.length === 2 &&
      Array.isArray(bounds.y) && bounds.y.length === 2 &&
      typeof bounds.x[0] === 'number' && typeof bounds.x[1] === 'number' &&
      typeof bounds.y[0] === 'number' && typeof bounds.y[1] === 'number' &&
      bounds.x[0] < bounds.x[1] &&
      bounds.y[0] < bounds.y[1]
    );
  }
}
