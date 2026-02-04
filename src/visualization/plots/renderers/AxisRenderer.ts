/**
 * AxisRenderer - Renders axes manually
 * Uses TickCalculator for smart tick calculation
 */

import { LayerRenderer } from '../interfaces';
import { RenderContext } from '../interfaces/RenderContext';
import { D3ScaleFactory } from '../utils/D3ScaleFactory';
import { TickCalculator } from '../utils/TickCalculator';

/**
 * Axis options interface
 */
export interface AxisOptions {
  showTicks?: boolean;
  showLabels?: boolean;
  showSpine?: boolean;
  tickSize?: number;
  tickPadding?: number;
  labelPadding?: number;
  fontSize?: number;
  fontColor?: string;
  tickColor?: string;
  labelColor?: string;
  axisColor?: string;
  axisWidth?: number;
  xLabel?: string;
  yLabel?: string;
}

export class AxisRenderer implements LayerRenderer {
  render(layer: any, context: RenderContext): void {
    const options: AxisOptions = layer.options || {};
    const showTicks = options.showTicks !== false;
    const showLabels = options.showLabels !== false;
    const xLabel = options.xLabel;
    const yLabel = options.yLabel;
    const tickSize = options.tickSize || 5;
    const tickPadding = options.tickPadding || 8;
    const labelPadding = options.labelPadding || 32;
    const fontSize = options.fontSize || 12;
    const tickColor = options.tickColor || '#666'; 
    const labelColor = options.labelColor || '#333'; 
    const axisColor = options.axisColor || '#666';
    const axisWidth = options.axisWidth || 2;
    const showSpine = options.showSpine !== false;
    
    context.g.selectAll('.plot-frame, .x-label, .y-label').remove();
    
    const bounds = {
      x: [context.xScale.domain()[0], context.xScale.domain()[1]] as [number, number],
      y: [context.yScale.domain()[0], context.yScale.domain()[1]] as [number, number]
    };
    
    const { xTicks, yTicks } = TickCalculator.calculateTicks(bounds.x, bounds.y);
    
    if (showSpine) {
      // Use margins from context
      const margins = context.margins;
      
      const frameWidth = Math.max(0, context.width - margins.left - margins.right);
      const frameHeight = Math.max(0, context.height - margins.top - margins.bottom);
      
      if (frameWidth > 0 && frameHeight > 0) {
        context.g.append('rect')
          .attr('class', 'plot-frame calcplot-frame')
          .attr('x', margins.left)
          .attr('y', margins.top)
          .attr('width', frameWidth)
          .attr('height', frameHeight)
          .attr('fill', 'none')
          .attr('stroke', axisColor)
          .attr('stroke-width', axisWidth)
          .attr('rx', 2)
          .attr('ry', 2);
      }
    }
    
    // Render X axis ticks and labels manually
    if (showTicks || showLabels) {
      // Create ticks group
      const ticksGroup = context.g.append('g')
        .attr('class', 'ticks-group');
      
      const margins = context.margins;
      const yPosition = context.height - margins.bottom; // Bottom margin
      
      xTicks.values.forEach(tick => {
        const xPosition = context.xScale(tick);
        
        // Draw tick
        if (showTicks) {
          ticksGroup.append('line')
            .attr('class', 'calcplot-tick-line')
            .attr('x1', xPosition)
            .attr('y1', yPosition)
            .attr('x2', xPosition)
            .attr('y2', yPosition + tickSize)
            .attr('stroke', axisColor)
            .attr('stroke-width', axisWidth);
        }
        
        // Draw label
        if (showLabels) {
          ticksGroup.append('text')
            .attr('class', 'calcplot-tick-text')
            .attr('x', xPosition)
            .attr('y', yPosition + tickSize + tickPadding)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .style('font-size', `${fontSize}px`)
            .style('fill', tickColor)
            .text(TickCalculator.formatTickLabel(tick, xTicks.step));
        }
      });
    }
    
    // Render Y axis ticks and labels manually
    if (showTicks || showLabels) {
      // Create ticks group
      const ticksGroup = context.g.append('g')
        .attr('class', 'y-ticks-group');
      
      const margins = context.margins;
      const xPosition = margins.left; // Left margin
      
      yTicks.values.forEach(tick => {
        const yPosition = context.yScale(tick);
        
        // Draw tick
        if (showTicks) {
          ticksGroup.append('line')
            .attr('class', 'calcplot-tick-line')
            .attr('x1', xPosition)
            .attr('y1', yPosition)
            .attr('x2', xPosition - tickSize)
            .attr('y2', yPosition)
            .attr('stroke', axisColor)
            .attr('stroke-width', axisWidth);
        }
        
        // Draw label
        if (showLabels) {
          ticksGroup.append('text')
            .attr('class', 'calcplot-tick-text')
            .attr('x', xPosition - tickSize - tickPadding)
            .attr('y', yPosition)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .style('font-size', `${fontSize}px`)
            .style('fill', tickColor)
            .text(TickCalculator.formatTickLabel(tick, yTicks.step));
        }
      });
    }
    
    // Create labels group for axis labels with consistent spacing
    if (xLabel || yLabel) {
      const labelsGroup = context.g.append('g')
        .attr('class', 'labels-group');
      
      // Calculate offset from tick boundaries
      const xLabelOffset = tickSize + tickPadding + labelPadding;
      const yLabelOffset = tickSize + tickPadding + labelPadding;

      if (xLabel && showLabels) {
        const margins = context.margins;
        
        labelsGroup.append('text')
          .attr('class', 'x-label calcplot-axis-label')
          .attr('x', context.width / 2)
          .attr('y', context.height - margins.bottom + xLabelOffset) // From plot area bottom + offset
          .style('font-weight', 'bold')
          .style('font-size', '14px')
          .style('fill', labelColor)
          .text(xLabel);
      }
      
      if (yLabel && showLabels) {
        const margins = context.margins;
        
        const centerY = (context.height - margins.bottom + margins.top) / 2;
        labelsGroup.append('text')
          .attr('class', 'y-label calcplot-axis-label')
          .attr('transform', `translate(${margins.left - yLabelOffset}, ${centerY}) rotate(-90)`) // From plot area left - offset
          .attr('text-anchor', 'middle')
          .style('font-weight', 'bold')
          .style('font-size', '14px')
          .style('fill', labelColor)
          .text(yLabel);
      }
    }
  }
}