import { Bounds, PlotArea } from './types';
import { MathUtils } from './MathUtils';

export class BoundsManager {
  private dataBounds: Bounds = { x: [0, 1], y: [0, 1] };
  private viewBounds: Bounds = { x: [0, 1], y: [0, 1] };
  private plotArea: PlotArea;
  private originalViewBounds?: Bounds; // For tracking before applying equal
  
  constructor(
    private canvasWidth: number,
    private canvasHeight: number,
    private padding: number = 0.1
  ) {
    this.plotArea = this.calculateDefaultPlotArea();
    this.originalViewBounds = { ...this.viewBounds };
  }
  
  private calculateDefaultPlotArea(): PlotArea {
    const left = 80;
    const right = this.canvasWidth - 50;
    const top = 50;
    const bottom = this.canvasHeight - 80;
    
    return {
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top
    };
  }
  
  updateDataBounds(xData: number[], yData: number[]): void {
    if (xData.length === 0 || yData.length === 0) return;
    
    const xMin = Math.min(...xData);
    const xMax = Math.max(...xData);
    const yMin = Math.min(...yData);
    const yMax = Math.max(...yData);
    
    // If data is in one point, expand slightly
    if (xMin === xMax) {
      this.dataBounds.x = [xMin - 1, xMax + 1];
    } else {
      this.dataBounds.x = [xMin, xMax];
    }
    
    if (yMin === yMax) {
      this.dataBounds.y = [yMin - 1, yMax + 1];
    } else {
      this.dataBounds.y = [yMin, yMax];
    }
  }
  
  autoScale(): void {
    const [xMin, xMax] = this.dataBounds.x;
    const [yMin, yMax] = this.dataBounds.y;
    
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;
    
    // Save original bounds before equal
    this.originalViewBounds = {
      x: [xMin - xRange * this.padding, xMax + xRange * this.padding],
      y: [yMin - yRange * this.padding, yMax + yRange * this.padding]
    };
    
    this.viewBounds = { ...this.originalViewBounds };
  }
  
  adjustAspectRatio(mode: 'equal' | 'auto' = 'auto'): void {
    if (mode === 'auto') {
      // Return to original bounds
      if (this.originalViewBounds) {
        this.viewBounds = { ...this.originalViewBounds };
      }
      return;
    }
    
    // For 'equal' need to ensure same scale on axes
    const [xMin, xMax] = this.viewBounds.x;
    const [yMin, yMax] = this.viewBounds.y;
    
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    
    if (xRange === 0 || yRange === 0) return;
    
    // Calculate pixel per unit scales
    const pxPerUnitX = this.plotArea.width / xRange;
    const pxPerUnitY = this.plotArea.height / yRange;
    
    // Choose smaller scale for equality
    if (pxPerUnitX !== pxPerUnitY) {
      // Use matplotlib approach: expand range with smaller scale
      if (pxPerUnitX < pxPerUnitY) {
        // X has smaller scale, expand Y
        const desiredYRange = xRange * (this.plotArea.height / this.plotArea.width);
        const yCenter = (yMin + yMax) / 2;
        this.viewBounds.y = [
          yCenter - desiredYRange / 2,
          yCenter + desiredYRange / 2
        ];
      } else {
        // Y has smaller scale, expand X
        const desiredXRange = yRange * (this.plotArea.width / this.plotArea.height);
        const xCenter = (xMin + xMax) / 2;
        this.viewBounds.x = [
          xCenter - desiredXRange / 2,
          xCenter + desiredXRange / 2
        ];
      }
    }
  }
  
  toCanvas(x: number, y: number): [number, number] {
    const [xMin, xMax] = this.viewBounds.x;
    const [yMin, yMax] = this.viewBounds.y;
    
    // Protection against division by zero and invalid values
    const safeXMin = isFinite(xMin) ? xMin : 0;
    const safeXMax = isFinite(xMax) && xMax > safeXMin ? xMax : safeXMin + 1;
    const safeYMin = isFinite(yMin) ? yMin : 0;
    const safeYMax = isFinite(yMax) && yMax > safeYMin ? yMax : safeYMin + 1;
    
    const xRange = safeXMax - safeXMin || 1;
    const yRange = safeYMax - safeYMin || 1;
    
    // Clamp values to prevent overflow
    const clampedX = MathUtils.clampToReasonableRange(x);
    const clampedY = MathUtils.clampToReasonableRange(y);
    
    const sx = this.plotArea.left + 
      ((clampedX - safeXMin) / xRange) * this.plotArea.width;
    
    const sy = this.plotArea.bottom - 
      ((clampedY - safeYMin) / yRange) * this.plotArea.height;
    
    return [sx, sy];
  }
  
  getViewBounds(): Bounds {
    return { ...this.viewBounds };
  }
  
  getPlotArea(): PlotArea {
    return { ...this.plotArea };
  }
  
  setViewBounds(bounds: Bounds): void {
    this.viewBounds = { ...bounds };
    this.originalViewBounds = { ...bounds };
  }
  
  updatePlotArea(plotArea: Partial<PlotArea>): void {
    this.plotArea = {
      ...this.plotArea,
      ...plotArea,
      width: (plotArea.right ?? this.plotArea.right) - (plotArea.left ?? this.plotArea.left),
      height: (plotArea.bottom ?? this.plotArea.bottom) - (plotArea.top ?? this.plotArea.top)
    };
  }
  
  // Check if point is in plot area
  isInPlotArea(x: number, y: number): boolean {
    const [canvasX, canvasY] = this.toCanvas(x, y);
    return (
      canvasX >= this.plotArea.left &&
      canvasX <= this.plotArea.right &&
      canvasY >= this.plotArea.top &&
      canvasY <= this.plotArea.bottom
    );
  }
  
  // Get data center
  getDataCenter(): [number, number] {
    const [xMin, xMax] = this.dataBounds.x;
    const [yMin, yMax] = this.dataBounds.y;
    return [(xMin + xMax) / 2, (yMin + yMax) / 2];
  }
}