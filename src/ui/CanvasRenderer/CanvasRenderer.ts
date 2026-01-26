import { BoundsManager } from './BoundsManager';
import { AxisRenderer } from './AxisRenderer';
import { DataRenderer } from './DataRenderer';
import { LabelsRenderer } from './LabelsRenderer';
import { ViewportManager } from './ViewportManager';
import { PlotOptions, VectorOptions, AxisOptions, DrawContext } from './types';
import { MathUtils } from './MathUtils';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private canvas?: HTMLCanvasElement;
  private bounds: BoundsManager;
  private axisRenderer: AxisRenderer;
  private data: DataRenderer;
  private labels: LabelsRenderer;
  private viewportManager?: ViewportManager;
  
  // Data persistence for redraw
  private currentDatasets?: Array<{x: number[], y: number[], color?: string}>;
  private currentOptions?: PlotOptions;
  private currentLegendItems?: Array<{ label: string; color: string; lineStyle?: { width?: number; dash?: number[] } }>;
  private currentLegendPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  
  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    canvas?: HTMLCanvasElement
  ) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.canvas = canvas;
    
    this.bounds = new BoundsManager(width, height);
    this.axisRenderer = new AxisRenderer(
      ctx,
      () => this.bounds.getViewBounds(),
      (x, y) => this.bounds.toCanvas(x, y),
      () => this.bounds.getPlotArea()
    );
    this.data = new DataRenderer(
      ctx,
      (x, y) => this.bounds.toCanvas(x, y),
      () => this.bounds.getPlotArea()
    );
    this.labels = new LabelsRenderer(ctx, () => this.bounds.getPlotArea());
    
    // Initialize viewport manager for pan/zoom if canvas is provided
    if (canvas) {
      this.viewportManager = new ViewportManager(
        canvas,
        (bounds) => {
          this.bounds.setViewBounds(bounds);
          this.redrawWithCurrentData();
        }
      );
    }
  }
  
  // New method for redrawing with current data
  private redrawWithCurrentData(): void {
    if (!this.currentDatasets || !this.currentOptions) {
      console.warn('No data to redraw');
      return;
    }
    
    this.clear();
    this.drawEverything(this.currentDatasets, this.currentOptions);
  }
  
  // New method for drawing everything
  private drawEverything(
    datasets: Array<{x: number[], y: number[], color?: string}>,
    options: PlotOptions
  ): void {
    // Draw grid and axes first
    this.axisRenderer.drawGrid(options);
    
    this.axisRenderer.drawAxes(options.xLabel, options.yLabel, options);
    
    // Then draw each dataset
    datasets.forEach((dataset, idx) => {
      this.data.plot(dataset.x, dataset.y, {
        ...options,
        lineColor: dataset.color || MathUtils.getColorByIndex(idx)
      });
    });
    
    // Labels
    if (options.title) {
      this.labels.drawTitle(options.title);
    }
    
    // Draw legend if we have legend items
    if (this.currentLegendItems && this.currentLegendItems.length > 0) {
      this.labels.drawLegend(this.currentLegendItems, this.currentLegendPosition || 'top-right');
    }
  }
  
  plot(
    xData: number[],
    yData: number[],
    options: PlotOptions = {}
  ): this {
    // Save data for redraw
    this.currentDatasets = [{x: xData, y: yData}];
    this.currentOptions = options;
    
    // Clear
    this.clear();
    
    // Update bounds with actual data
    this.bounds.updateDataBounds(xData, yData);
    
    if (options.autoScale !== false) {
      this.bounds.autoScale();
    }
    
    // Apply aspect ratio BEFORE drawing anything
    if (options.aspectRatio === 'equal') {
      this.bounds.adjustAspectRatio('equal');
    } else {
      this.bounds.adjustAspectRatio('auto');
    }
    
    // Set bounds in ViewportManager
    if (this.viewportManager) {
      const finalBounds = this.bounds.getViewBounds();
      this.viewportManager.setOriginalBounds(finalBounds);
    }
    
    // Draw everything
    this.drawEverything(this.currentDatasets, options);
    
    return this;
  }
  
  plotMultiple(
    datasets: Array<{x: number[], y: number[], color?: string}>,
    options: PlotOptions = {}
  ): this {
    // Save data for redraw
    this.currentDatasets = datasets;
    this.currentOptions = options;
    
    // Clear first
    this.clear();
    
    // Collect all data
    const allX: number[] = [];
    const allY: number[] = [];
    
    datasets.forEach(dataset => {
      allX.push(...dataset.x);
      allY.push(...dataset.y);
    });
    
    // Update bounds with all data
    this.bounds.updateDataBounds(allX, allY);
    
    if (options.autoScale !== false) {
      this.bounds.autoScale();
    }
    
    // Apply aspect ratio
    if (options.aspectRatio === 'equal') {
      this.bounds.adjustAspectRatio('equal');
    } else {
      this.bounds.adjustAspectRatio('auto');
    }
    
    // Set bounds in ViewportManager
    if (this.viewportManager) {
      const finalBounds = this.bounds.getViewBounds();
      this.viewportManager.setOriginalBounds(finalBounds);
    }
    
    // Save legend data if provided in options
    if (options.legend) {
      this.currentLegendItems = options.legend.items;
      this.currentLegendPosition = options.legend.position || 'top-right';
    }
    
    // Draw everything
    this.drawEverything(datasets, options);
    
    return this;
  }
  
  drawVectors(
    xPositions: number[],
    yPositions: number[],
    vx: number[],
    vy: number[],
    options: VectorOptions = {}
  ): this {
    this.data.drawVectors(xPositions, yPositions, vx, vy, options);
    return this;
  }
  
  addLegend(items: Array<{ label: string; color: string; lineStyle?: { width?: number; dash?: number[] } }>, position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right'): void {
    // Save legend data for redraw
    this.currentLegendItems = items;
    this.currentLegendPosition = position;
    
    // Draw legend immediately
    this.labels.drawLegend(items, position);
  }
  
  clear(): void {
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  
  redraw(): void {
    this.redrawWithCurrentData();
  }
  
  setBounds(bounds: { x: [number, number]; y: [number, number] }): void {
    this.bounds.setViewBounds(bounds);
    
    // If we have ViewportManager, update its bounds
    if (this.viewportManager) {
      this.viewportManager.setOriginalBounds(bounds);
    }
    
    // Redraw if we have data
    if (this.currentDatasets && this.currentOptions) {
      this.redrawWithCurrentData();
    }
  }
  
  getPlotArea(): any {
    return this.bounds.getPlotArea();
  }
  
  // Additional methods for ViewRenderer
  drawGrid(options: any = {}): void {
    this.axisRenderer.drawGrid(options);
  }
  
  drawAxis(options: any = {}): void {
    // Support both { x, y } and { xLabel, yLabel } formats
    const xLabel = options.xLabel || options.x;
    const yLabel = options.yLabel || options.y;
    this.axisRenderer.drawAxes(xLabel, yLabel, options);
  }
  
  setBoundsWithAuto(bounds: any, dataBounds?: any): void {
    if (bounds.x && Array.isArray(bounds.x)) {
      this.setBounds(bounds);
    } else if (dataBounds) {
      this.setBounds(dataBounds);
    }
  }
  
  setBoundsWithAutoAndAspectRatio(bounds: any, dataBounds?: any): void {
    if (bounds.x && Array.isArray(bounds.x)) {
      this.setBounds(bounds);
    } else if (dataBounds) {
      this.setBounds(dataBounds);
      this.bounds.adjustAspectRatio('equal');
    }
  }
  
  createDrawContext(): DrawContext {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return {
      plot: (xValues: number[], yValues: number[], options = {}) => {
        self.data.plot(xValues, yValues, options);
      },
      line: (from: [number, number], to: [number, number], options = {}) => {
        const [x1, y1] = self.bounds.toCanvas(from[0], from[1]);
        const [x2, y2] = self.bounds.toCanvas(to[0], to[1]);
        self.ctx.beginPath();
        self.ctx.moveTo(x1, y1);
        self.ctx.lineTo(x2, y2);
        self.ctx.strokeStyle = options.color || '#2563eb';
        self.ctx.lineWidth = options.width || 1;
        if (options.dash) {
          self.ctx.setLineDash(options.dash);
        } else {
          self.ctx.setLineDash([]);
        }
        self.ctx.stroke();
      },
      circle: (center: [number, number], radius: number, options = {}) => {
        const [cx, cy] = self.bounds.toCanvas(center[0], center[1]);
        // Calculate radius in pixels considering current scale
        const viewBounds = self.bounds.getViewBounds();
        const plotArea = self.bounds.getPlotArea();
        const xRange = viewBounds.x[1] - viewBounds.x[0];
        const pixelPerUnit = plotArea.width / xRange;
        const r = radius * pixelPerUnit;
        
        self.ctx.beginPath();
        self.ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        if (options.fill) {
          self.ctx.fillStyle = options.fill;
          self.ctx.fill();
        }
        if (options.stroke) {
          self.ctx.strokeStyle = options.stroke;
          self.ctx.lineWidth = options.width || 1;
          self.ctx.stroke();
        }
      },
      arrow: (from: [number, number], to: [number, number], options = {}) => {
        const [x1, y1] = self.bounds.toCanvas(from[0], from[1]);
        const [x2, y2] = self.bounds.toCanvas(to[0], to[1]);
        const headSize = options.headSize || 10;
        self.ctx.beginPath();
        self.ctx.moveTo(x1, y1);
        self.ctx.lineTo(x2, y2);
        self.ctx.strokeStyle = options.color || '#2563eb';
        self.ctx.lineWidth = options.width || 2;
        self.ctx.stroke();
        const angle = Math.atan2(y2 - y1, x2 - x1);
        self.ctx.beginPath();
        self.ctx.moveTo(x2, y2);
        self.ctx.lineTo(
          x2 - headSize * Math.cos(angle - Math.PI / 6),
          y2 - headSize * Math.sin(angle - Math.PI / 6)
        );
        self.ctx.moveTo(x2, y2);
        self.ctx.lineTo(
          x2 - headSize * Math.cos(angle + Math.PI / 6),
          y2 - headSize * Math.sin(angle + Math.PI / 6)
        );
        self.ctx.stroke();
      },
      text: (pos: [number, number], text: string, options = {}) => {
        const [x, y] = self.bounds.toCanvas(pos[0], pos[1]);
        self.ctx.font = `${options.size || 14}px ${options.font || 'system-ui'}`;
        self.ctx.fillStyle = options.color || '#1f2937';
        self.ctx.fillText(text, x, y);
      }
    };
  }
  
  // Methods for debugging
  debugInfo(): {
    viewBounds: Bounds;
    plotArea: any;
    dataBounds: Bounds;
  } {
    return {
      viewBounds: this.bounds.getViewBounds(),
      plotArea: this.bounds.getPlotArea(),
      dataBounds: this.bounds['dataBounds'] // Careful: accessing private field
    };
  }
  
  // ViewportManager methods
  enablePanZoom(): void {
    if (this.viewportManager) {
      this.viewportManager.setOriginalBounds(this.bounds.getViewBounds());
    }
  }
  
  resetView(): void {
    if (this.viewportManager) {
      this.viewportManager.resetView();
    }
  }
  
  getViewportInfo(): { scale: number; offset: { x: number; y: number } } | null {
    if (!this.viewportManager) return null;
    return {
      scale: this.viewportManager.getScale(),
      offset: this.viewportManager.getOffset()
    };
  }
}

// Export types and utilities
export * from './types';
export * from './MathUtils';