/**
 * RefLineRenderer - Renders horizontal and vertical reference lines
 */

import { LayerRenderer, RenderContext } from '../interfaces';
import { CachedLayerRenderer, CachedLayer } from './CachedLayerRenderer';

export interface RefLineOptions {
  orientation?: 'horizontal' | 'vertical';
  value?: number;
  color?: string;
  linestyle?: 'solid' | 'dashed' | 'dotted';
  linewidth?: number;
  label?: string;
  labelPosition?: 'left' | 'right' | 'top' | 'bottom' | 'auto';
  labelOffset?: number;
}

export type RefLineLayer = CachedLayer<'refline', RefLineOptions>;

export class RefLineRenderer extends CachedLayerRenderer<RefLineLayer> implements LayerRenderer {
  render(layer: RefLineLayer, context: RenderContext): void {
    const { g, xScale, yScale } = context;
    const { options } = layer;

    if (!options) return;

    const refLineOptions = options as RefLineOptions;
    const { 
      orientation, 
      value, 
      color = 'gray', 
      linestyle = 'solid', 
      linewidth = 1, 
      label,
      labelPosition = 'auto',
      labelOffset = 8
    } = refLineOptions;

    if (!orientation || value === undefined) return;

    // Calculate actual plot area bounds (inside the axis frame)
    const axisWidth = 2; // Match axisWidth from AxisRenderer
    const plotBounds = {
      left: (context.margins?.left || 60) + axisWidth,
      right: context.width - (context.margins?.right || 40) - axisWidth,
      top: (context.margins?.top || 40) + axisWidth,
      bottom: context.height - (context.margins?.bottom || 40) - axisWidth
    };

    // Get axis ranges to check if reference line is visible
    const xDomain = xScale.domain();
    const yDomain = yScale.domain();

    // Create refline group for proper structure
    const reflineGroup = g.append('g')
      .attr('class', 'refline-group');
    
    if (orientation === 'horizontal') {
      // Only render if value is within y-axis range
      if (value >= yDomain[0] && value <= yDomain[1]) {
        const y = yScale(value);
        
        // Create line using D3
        reflineGroup.append('line')
          .attr('class', 'refline')
          .attr('x1', plotBounds.left)
          .attr('x2', plotBounds.right)
          .attr('y1', y)
          .attr('y2', y)
          .attr('stroke', color)
          .attr('stroke-width', linewidth)
          .attr('stroke-dasharray', linestyle === 'dashed' ? '5, 5' : linestyle === 'dotted' ? '2, 2' : null);
          
        // Add label if provided
        if (label) {
          this.renderLabel(g, orientation, value, label, color, plotBounds, labelPosition, labelOffset, xScale, yScale);
        }
      }
    } else if (orientation === 'vertical') {
      // Only render if value is within x-axis range
      if (value >= xDomain[0] && value <= xDomain[1]) {
        const x = xScale(value);
        
        // Create line using D3
        reflineGroup.append('line')
          .attr('class', 'refline')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', plotBounds.top)
          .attr('y2', plotBounds.bottom)
          .attr('stroke', color)
          .attr('stroke-width', linewidth)
          .attr('stroke-dasharray', linestyle === 'dashed' ? '5, 5' : linestyle === 'dotted' ? '2, 2' : null);
          
        // Add label if provided
        if (label) {
          this.renderLabel(g, orientation, value, label, color, plotBounds, labelPosition, labelOffset, xScale, yScale);
        }
      }
    }
  }

  private renderLabel(
    g: any,
    orientation: string,
    value: number,
    label: string,
    color: string,
    plotBounds: { left: number; right: number; top: number; bottom: number },
    labelPosition: string,
    labelOffset: number,
    xScale: any,
    yScale: any
  ): void {
    // Remove any existing labels to prevent duplication
    g.selectAll('.refline-label').remove();
    
    let position = labelPosition;
    
    // Auto-determine best position
    if (position === 'auto') {
      position = this.findBestLabelPosition(orientation, value, plotBounds, xScale, yScale);
    }

    // Position label based on orientation and position
    if (orientation === 'horizontal') {
      const y = yScale(value);
      
      let labelX, labelY, textAnchor, dominantBaseline;
      
      switch (position) {
        case 'left':
          labelX = plotBounds.left + labelOffset;
          labelY = y - labelOffset/2;
          textAnchor = 'start';
          dominantBaseline = 'bottom';
          break;
        case 'right':
          labelX = plotBounds.right - labelOffset;
          labelY = y - labelOffset/2;
          textAnchor = 'end';
          dominantBaseline = 'bottom';
          break;
        case 'top':
          labelX = plotBounds.left + labelOffset;
          labelY = y - labelOffset;
          textAnchor = 'start';
          dominantBaseline = 'bottom';
          break;
        case 'bottom':
          labelX = plotBounds.left + labelOffset;
          labelY = y + labelOffset;
          textAnchor = 'start';
          dominantBaseline = 'hanging';
          break;
        default:
          labelX = plotBounds.left + labelOffset;
          labelY = y - labelOffset;
          textAnchor = 'start';
          dominantBaseline = 'bottom';
      }
      
      g.append('text')
        .attr('class', 'refline-label')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', textAnchor)
        .attr('dominant-baseline', dominantBaseline)
        .attr('fill', color)
        .attr('font-size', '11')
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-style', 'italic')
        .text(label);
        
    } else if (orientation === 'vertical') {
      const x = xScale(value);
      
      let labelX, labelY, textAnchor, dominantBaseline;
      
      switch (position) {
        case 'top':
          labelX = x + labelOffset/2;
          labelY = plotBounds.top + labelOffset;
          textAnchor = 'start';
          dominantBaseline = 'hanging';
          break;
        case 'bottom':
          labelX = x + labelOffset/2;
          labelY = plotBounds.bottom - labelOffset;
          textAnchor = 'start';
          dominantBaseline = 'bottom';
          break;
        case 'left':
          labelX = x - labelOffset;
          labelY = plotBounds.top + labelOffset;
          textAnchor = 'end';
          dominantBaseline = 'hanging';
          break;
        case 'right':
          labelX = x + labelOffset;
          labelY = plotBounds.top + labelOffset;
          textAnchor = 'start';
          dominantBaseline = 'hanging';
          break;
        default:
          labelX = x + labelOffset;
          labelY = plotBounds.top + labelOffset;
          textAnchor = 'start';
          dominantBaseline = 'hanging';
      }
      
      g.append('text')
        .attr('class', 'refline-label')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', textAnchor)
        .attr('dominant-baseline', dominantBaseline)
        .attr('fill', color)
        .attr('font-size', '11')
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-style', 'italic')
        .text(label);
    }
  }

  private findBestLabelPosition(
    orientation: string,
    value: number,
    plotBounds: { left: number; right: number; top: number; bottom: number },
    xScale: any,
    yScale: any
  ): string {
    if (orientation === 'horizontal') {
      const y = yScale(value);
      const verticalCenter = (plotBounds.top + plotBounds.bottom) / 2;
      
      // If line is in upper half, place label below
      if (y < verticalCenter) {
        return 'bottom';
      } else {
        return 'top';
      }
    } else {
      const x = xScale(value);
      const horizontalCenter = (plotBounds.left + plotBounds.right) / 2;
      
      // If line is in left half, place label to the right
      if (x < horizontalCenter) {
        return 'right';
      } else {
        return 'left';
      }
    }
  }
}
