import { PlotOptions, VectorOptions } from './types';
import { MathUtils } from './MathUtils';

export class DataRenderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private toCanvas: (x: number, y: number) => [number, number],
    private getPlotArea: () => any
  ) {}
  
  plot(
    xData: number[],
    yData: number[],
    options: PlotOptions = {}
  ): void {
    // Data validation
    if (!xData || !yData || xData.length === 0 || yData.length === 0) {
      console.warn('DataRenderer.plot: Empty or invalid data arrays');
      return;
    }
    
    if (xData.length !== yData.length) {
      console.error('DataRenderer.plot: xData and yData must have same length');
      return;
    }
    
    // Filter invalid values
    const validIndices = [];
    for (let i = 0; i < xData.length; i++) {
      if (isFinite(xData[i]) && isFinite(yData[i])) {
        validIndices.push(i);
      }
    }
    
    if (validIndices.length === 0) {
      console.warn('DataRenderer.plot: No valid data points');
      return;
    }
    
    // Use only valid data
    const filteredX = validIndices.map(i => xData[i]);
    const filteredY = validIndices.map(i => yData[i]);
    
    // Replace original data with filtered for the rest of the code
    xData = filteredX;
    yData = filteredY;
    
    const {
      lineColor = '#3b82f6',
      lineWidth = 2,
      marker = 'none',
      smooth = true
    } = options;
    
    this.ctx.save();
    
    // Apply clipping to plot area
    this.ctx.beginPath();
    this.ctx.rect(
      this.getPlotArea().left,
      this.getPlotArea().top,
      this.getPlotArea().width,
      this.getPlotArea().height
    );
    this.ctx.clip();
    
    this.ctx.strokeStyle = lineColor;
    this.ctx.fillStyle = lineColor;
    this.ctx.lineWidth = lineWidth;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    
    // Prepare data
    const points = smooth && xData.length > 2
      ? MathUtils.interpolateData(xData, yData)
      : { x: xData, y: yData };
    
    // Transform data points to canvas coordinates
    const canvasPoints = points.x.map((x, i) => {
      const [canvasX, canvasY] = this.toCanvas(x, points.y[i]);
      return { x: canvasX, y: canvasY };
    });
    
    // Draw line
    this.ctx.beginPath();
    for (let i = 0; i < points.x.length; i++) {
      const [x, y] = this.toCanvas(points.x[i], points.y[i]);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();
    
    // Draw markers
    if (marker !== 'none') {
      for (let i = 0; i < xData.length; i++) {
        const [x, y] = this.toCanvas(xData[i], yData[i]);
        
        if (marker === 'circle') {
          this.ctx.beginPath();
          this.ctx.arc(x, y, 3, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (marker === 'square') {
          this.ctx.fillRect(x - 3, y - 3, 6, 6);
        }
      }
    }
    
    this.ctx.restore();
  }
  
  drawVectors(
    xPositions: number[],
    yPositions: number[],
    vx: number[],
    vy: number[],
    options: VectorOptions = {}
  ): void {
    if (xPositions.length === 0 || yPositions.length === 0 || 
        vx.length === 0 || vy.length === 0) {
      console.warn('DataRenderer.drawVectors: Empty data arrays provided');
      return;
    }
    
    if (xPositions.length !== yPositions.length || 
        xPositions.length !== vx.length || 
        xPositions.length !== vy.length) {
      console.error('DataRenderer.drawVectors: All arrays must have same length');
      return;
    }
    const {
      scale = this.calculateAutoScale(vx, vy),
      color = '#10b981',
      headSize = 8,
      width = 2,
      arrowstyle = '->',
      pivot = 'tail',
      alpha = 1.0
    } = options;
    
    this.ctx.save();
    
    // Apply transparency
    this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    
    // Apply clipping to plot area
    this.ctx.beginPath();
    this.ctx.rect(
      this.getPlotArea().left,
      this.getPlotArea().top,
      this.getPlotArea().width,
      this.getPlotArea().height
    );
    this.ctx.clip();
    
    for (let i = 0; i < xPositions.length; i++) {
      // Handle array colors and widths
      const vectorColor = Array.isArray(color) ? color[i % color.length] : color;
      const vectorWidth = Array.isArray(width) ? width[i % width.length] : width;
      
      this.ctx.strokeStyle = vectorColor;
      this.ctx.fillStyle = vectorColor;
      this.ctx.lineWidth = vectorWidth;
      
      // Calculate start and end positions based on pivot
      let startX = xPositions[i];
      let startY = yPositions[i];
      let endX = xPositions[i] + vx[i] / (scale === 'auto' ? this.calculateAutoScale(vx, vy) : scale);
      let endY = yPositions[i] + vy[i] / (scale === 'auto' ? this.calculateAutoScale(vx, vy) : scale);
      
      if (pivot === 'tip') {
        startX = endX;
        startY = endY;
        endX = xPositions[i];
        endY = yPositions[i];
      } else if (pivot === 'middle') {
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        startX = midX - (endX - midX);
        startY = midY - (endY - midY);
      }
      
      const start = this.toCanvas(startX, startY);
      const end = this.toCanvas(endX, endY);
      
      // Vector line
      this.ctx.beginPath();
      this.ctx.moveTo(start[0], start[1]);
      this.ctx.lineTo(end[0], end[1]);
      this.ctx.stroke();
      
      // Arrowhead
      this.drawArrowhead(end[0], end[1], start, headSize, arrowstyle);
    }
    
    this.ctx.restore();
  }
  
  private calculateAutoScale(vx: number[], vy: number[]): number {
    const magnitudes = vx.map((v, i) => Math.sqrt(v * v + vy[i] * vy[i]));
    const maxMag = Math.max(...magnitudes);
    return maxMag > 0 ? maxMag / 30 : 1;
  }
  
  private drawArrowhead(
    x: number, y: number,
    start: [number, number],
    size: number,
    style: '->' | '-|>' | 'simple' | 'fancy' = '->'
  ): void {
    const angle = Math.atan2(y - start[1], x - start[0]);
    
    this.ctx.beginPath();
    
    switch (style) {
      case 'simple':
        // Simple V shape
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(
          x - size * Math.cos(angle - Math.PI / 6),
          y - size * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(
          x - size * Math.cos(angle + Math.PI / 6),
          y - size * Math.sin(angle + Math.PI / 6)
        );
        break;
        
      case '-|>':
        // Line with bar
        this.ctx.moveTo(x - size * Math.cos(angle), y - size * Math.sin(angle));
        this.ctx.lineTo(x, y);
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(
          x - size * Math.cos(angle - Math.PI / 6),
          y - size * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(
          x - size * Math.cos(angle + Math.PI / 6),
          y - size * Math.sin(angle + Math.PI / 6)
        );
        break;
        
      case 'fancy':
        // Filled triangle
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(
          x - size * 1.5 * Math.cos(angle - Math.PI / 6),
          y - size * 1.5 * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
          x - size * 1.5 * Math.cos(angle + Math.PI / 6),
          y - size * 1.5 * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fill();
        return;
        
      case '->':
      default:
        // Standard arrow
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(
          x - size * Math.cos(angle - Math.PI / 6),
          y - size * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
          x - size * Math.cos(angle + Math.PI / 6),
          y - size * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fill();
        return;
    }
    
    this.ctx.stroke();
  }
}
