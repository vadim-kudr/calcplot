
/**
 * GridRenderer - Renders grid lines using D3
 */

import * as d3 from 'd3';
import { LayerRenderer } from '../interfaces';
import { RenderContext } from '../interfaces/RenderContext';
import { TickCalculator } from '../utils/TickCalculator';

/**
 * Grid options interface
 */
export interface GridOptions {
  showGrid?: boolean;
  includeZeroInGrid?: boolean;
  gridColor?: string;
  gridOpacity?: number;
  gridWidth?: number;
  gridStyle?: 'solid' | 'dashed' | 'dotted';
  showMinorGrid?: boolean;
  minorGridColor?: string;
  minorGridOpacity?: number;
}

export class GridRenderer implements LayerRenderer {
  render(layer: any, context: RenderContext): void {
    const options: GridOptions = layer.options || {};
    const showGrid = options.showGrid !== false;
    const gridColor = options.gridColor || '#e0e0e0';
    const gridOpacity = options.gridOpacity || 0.3;
    const gridWidth = options.gridWidth || 1.0;
    const gridStyle = options.gridStyle || 'dashed';
    const showMinorGrid = options.showMinorGrid || false;
    const minorGridColor = options.minorGridColor || '#f0f0f0';
    const minorGridOpacity = options.minorGridOpacity || 0.3;
    
    if (!showGrid) return;
    
    // Create grid group for proper structure
    const gridGroup = context.g.append('g')
      .attr('class', 'grid-group');
    
    // Clear existing grid
    gridGroup.selectAll('.grid-line-x, .grid-line-y, .minor-grid-line-x, .minor-grid-line-y').remove();
    
    // Get ticks for major grid - use same calculation as axes
    const bounds = {
      x: [context.xScale.domain()[0], context.xScale.domain()[1]] as [number, number],
      y: [context.yScale.domain()[0], context.yScale.domain()[1]] as [number, number]
    };
    
    const { xTicks, yTicks } = TickCalculator.calculateTicks(bounds.x, bounds.y);
    
    let dashArray = '';
    switch (gridStyle) {
      case 'dashed':
        dashArray = '2,2';
        break;
      case 'dotted':
        dashArray = '1,1';
        break;
      default:
        dashArray = 'none';
    }
    
    // Render vertical grid lines
    if (xTicks && xTicks.values && xTicks.values.length > 0) {
      const margins = context.margins;
      
      gridGroup.selectAll('.grid-line-x')
        .data(xTicks.values)
        .enter()
        .append('line')
        .attr('class', 'grid-line-x')
        .attr('x1', d => context.xScale(d))
        .attr('y1', margins.top)  // Top margin
        .attr('x2', d => context.xScale(d))
        .attr('y2', context.height - margins.bottom)  // Bottom margin
        .attr('stroke', gridColor)
        .attr('stroke-opacity', gridOpacity)
        .attr('stroke-width', gridWidth)
        .attr('stroke-dasharray', dashArray)
        .attr('shape-rendering', 'crispEdges');
    }
    
    // Render horizontal grid lines
    if (yTicks && yTicks.values && yTicks.values.length > 0) {
      const margins = context.margins;
      
      gridGroup.selectAll('.grid-line-y')
        .data(yTicks.values)
        .enter()
        .append('line')
        .attr('class', 'grid-line-y')
        .attr('x1', margins.left)  // Left margin
        .attr('y1', d => context.yScale(d))
        .attr('x2', context.width - margins.right)  // Right margin
        .attr('y2', d => context.yScale(d))
        .attr('stroke', gridColor)
        .attr('stroke-opacity', gridOpacity)
        .attr('stroke-width', gridWidth)
        .attr('stroke-dasharray', dashArray)
        .attr('shape-rendering', 'crispEdges');
    }
    
    // Minor grid lines
    if (showMinorGrid) {
      const xMinorTicks = this.getMinorTicks(context.xScale);
      const yMinorTicks = this.getMinorTicks(context.yScale);
      
      // Vertical minor grid lines
      gridGroup.selectAll('.minor-grid-line-x')
        .data(xMinorTicks)
        .enter()
        .append('line')
        .attr('class', 'minor-grid-line-x')
        .attr('x1', d => context.xScale(d))
        .attr('y1', 0)
        .attr('x2', d => context.xScale(d))
        .attr('y2', context.height)
        .attr('stroke', minorGridColor)
        .attr('stroke-opacity', minorGridOpacity)
        .attr('stroke-width', gridWidth * 0.5)
        .attr('shape-rendering', 'crispEdges');
      
      // Horizontal minor grid lines
      gridGroup.selectAll('.minor-grid-line-y')
        .data(yMinorTicks)
        .enter()
        .append('line')
        .attr('class', 'minor-grid-line-y')
        .attr('x1', 0)
        .attr('y1', d => context.yScale(d))
        .attr('x2', context.width)
        .attr('y2', d => context.yScale(d))
        .attr('stroke', minorGridColor)
        .attr('stroke-opacity', minorGridOpacity)
        .attr('stroke-width', gridWidth * 0.5)
        .attr('shape-rendering', 'crispEdges');
    }
  }
  
  /**
   * Generate minor ticks between major ticks
   */
  private getMinorTicks(scale: d3.ScaleLinear<number, number>): number[] {
    const majorTicks = scale.ticks();
    if (majorTicks.length < 2) return [];
    
    const minorTicks: number[] = [];
    
    for (let i = 0; i < majorTicks.length - 1; i++) {
      const start = majorTicks[i];
      const end = majorTicks[i + 1];
      const step = (end - start) / 5; // 4 minor ticks between major ticks
      
      for (let j = 1; j < 5; j++) {
        minorTicks.push(start + j * step);
      }
    }
    
    return minorTicks;
  }
}