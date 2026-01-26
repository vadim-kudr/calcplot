import { Bounds, TickSet, PlotOptions, PlotArea } from './types';
import { MathUtils } from './MathUtils';

export class AxisRenderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private getBounds: () => Bounds,
    private toCanvas: (x: number, y: number) => [number, number],
    private getPlotArea: () => PlotArea
  ) {}
  
  drawGrid(options: PlotOptions = {}): void {
    const { showGrid = true, gridColor = '#e0e0e0', includeZeroInGrid = false } = options;
    
    if (!showGrid) return;
    
    const bounds = this.getBounds();
    const plotArea = this.getPlotArea();
    const { xTicks, yTicks } = this.calculateTicks();
    
    this.ctx.save();
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([2, 2]);
    
    // Vertical grid lines
    xTicks.values.forEach(tick => {
      if (!includeZeroInGrid && tick === 0) return;
      const [x, y1] = this.toCanvas(tick, bounds.y[0]);
      const [, y2] = this.toCanvas(tick, bounds.y[1]);
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, Math.max(y1, plotArea.top));
      this.ctx.lineTo(x, Math.min(y2, plotArea.bottom));
      this.ctx.stroke();
    });
    
    // Horizontal grid lines
    yTicks.values.forEach(tick => {
      if (!includeZeroInGrid && tick === 0) return;
      const [x1, y] = this.toCanvas(bounds.x[0], tick);
      const [x2] = this.toCanvas(bounds.x[1], tick);
      
      this.ctx.beginPath();
      this.ctx.moveTo(Math.max(x1, plotArea.left), y);
      this.ctx.lineTo(Math.min(x2, plotArea.right), y);
      this.ctx.stroke();
    });
    
    this.ctx.restore();
  }
  
  drawAxes(xLabel?: string, yLabel?: string, options: PlotOptions = {}): void {
    const { showTicks = true, showLabels = true, showSpines = true } = options;
    
    const { xTicks, yTicks } = this.calculateTicks();
    const plotArea = this.getPlotArea();
    
    // For calculating y-tick width we need context
    this.ctx.save();
    this.ctx.font = '12px sans-serif'; // Same font as for ticks
    
    // Calculate maximum y-tick width
    let maxYTickWidth = 0;
    if (showLabels) {
      yTicks.labels.forEach(label => {
        const textWidth = this.ctx.measureText(label).width;
        maxYTickWidth = Math.max(maxYTickWidth, textWidth);
      });
    }
    
    this.ctx.restore(); // Restore context
    
    this.ctx.save();
    this.ctx.strokeStyle = '#666';
    this.ctx.fillStyle = '#666';
    this.ctx.lineWidth = 2;
    this.ctx.font = '12px sans-serif';
    
    // Draw spines (matplotlib-style borders)
    if (showSpines) {
      this.ctx.beginPath();
      // Bottom spine
      this.ctx.moveTo(plotArea.left, plotArea.bottom);
      this.ctx.lineTo(plotArea.right, plotArea.bottom);
      // Left spine  
      this.ctx.moveTo(plotArea.left, plotArea.top);
      this.ctx.lineTo(plotArea.left, plotArea.bottom);
      // Right spine
      this.ctx.moveTo(plotArea.right, plotArea.top);
      this.ctx.lineTo(plotArea.right, plotArea.bottom);
      // Top spine
      this.ctx.moveTo(plotArea.left, plotArea.top);
      this.ctx.lineTo(plotArea.right, plotArea.top);
      this.ctx.stroke();
    }
    
    // X ticks and labels (on bottom border)
    if (showTicks || showLabels) {
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      
      xTicks.values.forEach(tick => {
        // Use bottom viewport border for label positioning
        const bounds = this.getBounds();
        const [x, yBottom] = this.toCanvas(tick, bounds.y[0]);
        const [_, yTop] = this.toCanvas(tick, bounds.y[1]);
        
        // Check that tick is within plot area
        const xInPlotArea = Math.max(plotArea.left, Math.min(x, plotArea.right));
        
        if (xInPlotArea >= plotArea.left && xInPlotArea <= plotArea.right) {
          // Tick
          if (showTicks) {
            this.ctx.beginPath();
            this.ctx.moveTo(xInPlotArea, plotArea.bottom);
            this.ctx.lineTo(xInPlotArea, plotArea.bottom + 5);
            this.ctx.stroke();
          }
          
          // Label
          if (showLabels) {
            // Format number for better display
            const label = MathUtils.formatNumberForDisplay(tick, xTicks.step);
            this.ctx.fillText(label, xInPlotArea, plotArea.bottom + 10);
          }
        }
      });
      
      // Y ticks and labels (on left border)
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      
      // Dynamically calculate padding for y-ticks based on maximum width
      const yTickPadding = Math.max(10, maxYTickWidth * 0.5); // Minimum 10px, but can be more
      
      yTicks.values.forEach(tick => {
        // Use left viewport border for label positioning
        const bounds = this.getBounds();
        const [xLeft, y] = this.toCanvas(bounds.x[0], tick);
        const [xRight] = this.toCanvas(bounds.x[1], tick);
        
        // Check that tick is within plot area
        const yInPlotArea = Math.max(plotArea.top, Math.min(y, plotArea.bottom));
        
        if (yInPlotArea >= plotArea.top && yInPlotArea <= plotArea.bottom) {
          // Tick
          if (showTicks) {
            this.ctx.beginPath();
            this.ctx.moveTo(plotArea.left, yInPlotArea);
            this.ctx.lineTo(plotArea.left - 5, yInPlotArea);
            this.ctx.stroke();
          }
          
          // Label
          if (showLabels) {
            const label = MathUtils.formatNumberForDisplay(tick, yTicks.step);
            // Use dynamic padding
            this.ctx.fillText(label, plotArea.left - yTickPadding, yInPlotArea);
          }
        }
      });
    }
    
    this.ctx.restore();
    
    // Draw axis labels
    if (xLabel || yLabel) {
      this.ctx.save();
      this.ctx.fillStyle = '#333';
      this.ctx.font = '14px sans-serif';
      
      // X label margin from plot area - increased to match Y label spacing
      const xLabelMargin = 35; // Increased from 25 to match Y label visual distance
      
      // Dynamically calculate padding for yLabel based on:
      // 1. Y-tick width (maxYTickWidth)
      // 2. Tick padding from axis (yTickPadding)
      // 3. Additional padding for axis label
      const yLabelMargin = Math.max(
        35, // Minimum padding
        maxYTickWidth + 20 // Tick width + additional padding
      );
      
      // X label - positioned below plot area
      if (xLabel) {
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(xLabel, plotArea.left + plotArea.width / 2, plotArea.bottom + xLabelMargin);
      }
      
      // Y label - positioned left of tick labels
      if (yLabel) {
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Calculate position: left border minus total padding
        const totalYOffset = yLabelMargin + 10; // +10 for additional space
        
        // Set transformation for vertical text
        this.ctx.translate(plotArea.left - totalYOffset, plotArea.top + plotArea.height / 2);
        this.ctx.rotate(-Math.PI / 2);
        
        this.ctx.fillText(yLabel, 0, 0);
        this.ctx.restore();
      }
      
      this.ctx.restore();
    }
  }
  
  private calculateTicks(): { xTicks: TickSet; yTicks: TickSet } {
    const bounds = this.getBounds();
    const xRange = bounds.x[1] - bounds.x[0];
    const yRange = bounds.y[1] - bounds.y[0];
    
    const xStep = MathUtils.calculateNiceStep(xRange, 6);
    const yStep = MathUtils.calculateNiceStep(yRange, 5);
    
    const xStart = Math.ceil(bounds.x[0] / xStep) * xStep;
    const yStart = Math.ceil(bounds.y[0] / yStep) * yStep;
    
    const xTicks: number[] = [];
    const yTicks: number[] = [];
    
    for (let x = xStart; x <= bounds.x[1]; x += xStep) {
      xTicks.push(x);
    }
    
    for (let y = yStart; y <= bounds.y[1]; y += yStep) {
      yTicks.push(y);
    }
    
    return {
      xTicks: {
        values: xTicks,
        labels: xTicks.map(tick => MathUtils.formatTickLabel(tick, xStep)),
        step: xStep
      },
      yTicks: {
        values: yTicks,
        labels: yTicks.map(tick => MathUtils.formatTickLabel(tick, yStep)),
        step: yStep
      }
    };
  }
}
