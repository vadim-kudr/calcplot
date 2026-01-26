import { MathUtils } from './MathUtils';

export class LabelsRenderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private getPlotArea: () => any
  ) {}
  
  drawTitle(title: string): void {
    this.ctx.save();
    this.ctx.font = 'bold 16px sans-serif';
    this.ctx.fillStyle = '#333';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(title, this.getPlotArea().left + this.getPlotArea().width / 2, 25);
    this.ctx.restore();
  }
  
  drawLegend(
    items: Array<{label: string, color: string, lineStyle?: { width?: number; dash?: number[] } }>,
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right'
  ): void {
    if (items.length === 0) return;
    
    this.ctx.save();
    this.ctx.font = '12px sans-serif';
    
    const itemHeight = 20;
    const padding = 10;
    const swatchWidth = 30;
    
    const maxTextWidth = Math.max(...items.map(item => 
      this.ctx.measureText(item.label).width
    ));
    
    const legendWidth = maxTextWidth + swatchWidth + padding * 3;
    const legendHeight = items.length * itemHeight + padding * 2;
    
    // Position
    let x: number, y: number;
    const legendMargin = 10;
    
    switch (position) {
      case 'top-right':
        x = this.getPlotArea().right - legendWidth - legendMargin;
        y = this.getPlotArea().top + legendMargin;
        break;
      case 'top-left':
        x = this.getPlotArea().left + legendMargin;
        y = this.getPlotArea().top + legendMargin;
        break;
      case 'bottom-right':
        x = this.getPlotArea().right - legendWidth - legendMargin;
        y = this.getPlotArea().bottom - legendHeight - legendMargin;
        break;
      case 'bottom-left':
        x = this.getPlotArea().left + legendMargin;
        y = this.getPlotArea().bottom - legendHeight - legendMargin;
        break;
      default:
        x = this.getPlotArea().right - legendWidth - legendMargin;
        y = this.getPlotArea().top + legendMargin;
    }
    
    // Background
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    this.ctx.strokeStyle = '#ccc';
    this.ctx.lineWidth = 1;
    this.ctx.fillRect(x, y, legendWidth, legendHeight);
    this.ctx.strokeRect(x, y, legendWidth, legendHeight);
    
    // Items
    items.forEach((item, idx) => {
      const itemY = y + padding + idx * itemHeight + itemHeight / 2;
      
      // Color swatch
      this.ctx.strokeStyle = item.color;
      this.ctx.lineWidth = item.lineStyle?.width || 2;
      
      if (item.lineStyle?.dash) {
        this.ctx.setLineDash(item.lineStyle.dash);
      } else {
        this.ctx.setLineDash([]);
      }
      
      this.ctx.beginPath();
      this.ctx.moveTo(x + padding, itemY);
      this.ctx.lineTo(x + padding + swatchWidth, itemY);
      this.ctx.stroke();
      
      // Text
      this.ctx.fillStyle = '#333';
      this.ctx.setLineDash([]);
      this.ctx.fillText(
        item.label,
        x + padding + swatchWidth + 10,
        itemY + 4
      );
    });
    
    this.ctx.restore();
  }
}
