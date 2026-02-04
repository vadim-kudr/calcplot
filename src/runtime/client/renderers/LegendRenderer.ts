/**
 * LegendRenderer - Renders plot legends using D3
 */

import * as d3 from 'd3';
import { LayerRenderer } from '../interfaces';
import { RenderContext } from '../interfaces/RenderContext';
import { D3ScaleFactory } from '../utils/D3ScaleFactory';

export interface LegendItem {
  label: string;
  color: string;
  dash?: number[];
  lineWidth?: number;
}

export interface LegendOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  padding?: number;
  itemHeight?: number;
  itemWidth?: number;
  fontSize?: number;
  fontColor?: string;
  opacity?: number;
}

export class LegendRenderer implements LayerRenderer {
  render(layer: any, context: RenderContext): void {
    const options: LegendOptions = layer.options || {};
    const items: LegendItem[] = layer.items || [];
    
    if (items.length === 0) {
      return;
    }
    
    const position = options.position || 'top-right';
    const backgroundColor = options.backgroundColor || 'rgba(255, 255, 255, 0.9)';
    const borderColor = options.borderColor || '#ccc';
    const borderWidth = options.borderWidth || 1;
    const padding = options.padding || 10;
    const itemHeight = options.itemHeight || 20;
    const itemWidth = options.itemWidth || 30;
    const fontSize = options.fontSize || 12;
    const fontColor = options.fontColor || '#333';
    const opacity = options.opacity || 1;
    
    // Calculate legend dimensions based on actual text content
    const tempText = context.g.append('text')
      .style('font-size', `${fontSize}px`)
      .style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
      .style('visibility', 'hidden');
    
    let maxTextWidth = 0;
    items.forEach(item => {
      tempText.text(item.label);
      const textWidth = (tempText.node() as any)?.getBBox()?.width || 0;
      maxTextWidth = Math.max(maxTextWidth, textWidth);
    });
    
    tempText.remove();
    
    const legendWidth = itemWidth + padding * 2 + maxTextWidth + 10; // 10px extra space
    const legendHeight = items.length * itemHeight + padding * 2;
    
    // Calculate position
    const positionCoords = this.calculatePosition(position, legendWidth, legendHeight, context);
    
    // Create legend group
    const legendGroup = context.g.append('g')
      .attr('class', 'legend')
      .attr('opacity', opacity);
    
    // Draw background
    if (backgroundColor) {
      // Legend dimensions should always be positive
      // If calculations result in negative values, use minimum size
      const minLegendWidth = 100; // Minimum legend width
      const minLegendHeight = 30;  // Minimum legend height
      
      const finalLegendWidth = Math.max(minLegendWidth, legendWidth);
      const finalLegendHeight = Math.max(minLegendHeight, legendHeight);
      
      legendGroup.append('rect')
        .attr('class', 'legend-background')
        .attr('x', positionCoords.x)
        .attr('y', positionCoords.y)
        .attr('width', finalLegendWidth)
        .attr('height', finalLegendHeight)
        .attr('fill', backgroundColor)
        .attr('stroke', borderColor)
        .attr('stroke-width', borderWidth)
        .attr('rx', 4); // rounded corners
    }
    
    // Legend items
    const itemGroup = legendGroup.append('g')
      .attr('class', 'legend-items');
    
    items.forEach((item, index) => {
      const itemY = positionCoords.y + padding + index * itemHeight + itemHeight / 2;
      
      // Sample line
      const lineGroup = itemGroup.append('g')
        .attr('class', 'legend-item')
        .attr('transform', `translate(${positionCoords.x + padding}, ${itemY})`);
      
      lineGroup.append('line')
        .attr('x1', 0)
        .attr('x2', itemWidth)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', item.color)
        .attr('stroke-width', item.lineWidth || 2)
        .attr('stroke-dasharray', item.dash ? item.dash.join(',') : 'none');
      
      // Text label
      itemGroup.append('text')
        .attr('class', 'legend-label')
        .attr('x', positionCoords.x + padding + itemWidth + 5)
        .attr('y', itemY)
        .attr('dy', '0.35em') // vertical alignment
        .style('font-size', `${fontSize}px`)
        .style('fill', fontColor)
        .text(item.label);
    });
  }
  
  private calculatePosition(
    position: string, 
    width: number, 
    height: number, 
    context: RenderContext
  ): { x: number, y: number } {
    const margin = 10;
    
    // Use margins from context
    const margins = context.margins;
    
    // Position at plot area boundaries
    const plotLeft = margins.left;
    const plotRight = context.width - margins.right;
    const plotTop = margins.top;
    const plotBottom = context.height - margins.bottom;
    
    switch (position) {
      case 'top-left':
        return { x: plotLeft + margin, y: plotTop + margin };
      case 'top-right':
        return { x: plotRight - width - margin, y: plotTop + margin };
      case 'bottom-left':
        return { x: plotLeft + margin, y: plotBottom - height - margin };
      case 'bottom-right':
        return { x: plotRight - width - margin, y: plotBottom - height - margin };
      default:
        return { x: plotRight - width - margin, y: plotTop + margin };
    }
  }
}
