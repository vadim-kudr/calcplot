/**
 * SVGManager - Handles SVG creation, sizing, and context management
 * Supports margins for proper axis label and tick positioning
 */

import * as d3 from 'd3';
import { RenderContext } from '../interfaces';
import { D3ScaleFactory, ChartDimensions, ChartMargins } from '../utils';
import type { ResizeManagerOptions } from './ResizeManager';

export interface SVGManagerOptions {
  width?: number;
  height?: number;
  defaultBounds?: { x: [number, number]; y: [number, number] };
  margins?: ChartMargins;
}

export { ResizeManagerOptions };

export class SVGManager {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private scales: {
    x: d3.ScaleLinear<number, number>;
    y: d3.ScaleLinear<number, number>;
  }; // Never undefined after constructor
  private dimensions: ChartDimensions;
  private aspectRatio?: string;

  constructor(
    private container: HTMLElement,
    private options: SVGManagerOptions = {}
  ) {
    // Use actual dimensions for scale creation
    const actualWidth = this.options.width || 800;
    const actualHeight = this.options.height || 600;
    
    // Initialize scales FIRST - guaranteed to exist
    const scalesResult = D3ScaleFactory.createScales(
      actualWidth,
      actualHeight,
      this.options.defaultBounds?.x || [0, 10],
      this.options.defaultBounds?.y || [0, 10]
    );
    
    // Extract scales from result object
    this.scales = {
      x: scalesResult.xScale,
      y: scalesResult.yScale
    };
    
    // Then calculate dimensions
    this.dimensions = D3ScaleFactory.calculateDimensions(
      actualWidth,
      actualHeight,
      this.options.margins
    );
    
    // Then create SVG elements
    this.svg = this.createSVG();
    this.g = this.svg.append('g');
  }

  private createSVG(): d3.Selection<SVGSVGElement, unknown, null, undefined> {
    return d3.select(this.container)
      .append('svg')
      .attr('width', this.dimensions.width)
      .attr('height', this.dimensions.height);
  }

  getContext(): RenderContext {
    // Scales guaranteed to exist - return directly
    return {
      svg: this.svg,
      g: this.g,
      xScale: this.scales.x, // Never undefined
      yScale: this.scales.y, // Never undefined
      width: this.dimensions.width,
      height: this.dimensions.height,
      margins: {
        top: 20,
        right: 20,
        bottom: 40,
        left: 60
      }
    };
  }

  /**
   * Resize the SVG and update dimensions
   */
  resize(width: number, height: number): void {
    // Update SVG size
    this.svg.attr('width', width).attr('height', height);
    
    // Update dimensions
    this.dimensions = D3ScaleFactory.calculateDimensions(
      width,
      height,
      this.options.margins
    );
    
    // Update scale ranges with new dimensions
    this.updateScaleRanges();
  }

  /**
   * Update scale ranges based on current dimensions and aspect ratio
   */
  private updateScaleRanges(): void {
    const leftMargin = 80;
    const rightMargin = 50;
    const topMargin = 50;
    const bottomMargin = 80;
    
    if (this.aspectRatio === 'equal') {
      // Calculate plot dimensions
      const plotWidth = this.dimensions.width - leftMargin - rightMargin;
      const plotHeight = this.dimensions.height - topMargin - bottomMargin;
      
      // Use the smaller dimension for both to maintain aspect ratio
      const size = Math.min(plotWidth, plotHeight);
      
      // Center the plot area
      const xPadding = (plotWidth - size) / 2;
      const yPadding = (plotHeight - size) / 2;
      
      this.scales.x.range([leftMargin + xPadding, this.dimensions.width - rightMargin - xPadding]);
      this.scales.y.range([this.dimensions.height - bottomMargin - yPadding, topMargin + yPadding]);
    } else {
      this.scales.x.range([leftMargin, this.dimensions.width - rightMargin]);
      this.scales.y.range([this.dimensions.height - bottomMargin, topMargin]);
    }
  }

  updateDomains(xDomain: [number, number], yDomain: [number, number], aspectRatio?: string): void {
    // Update aspect ratio if provided
    if (aspectRatio !== undefined) {
      this.aspectRatio = aspectRatio;
    }
    
    // Update domains - scales guaranteed to exist
    this.scales.x.domain(xDomain);
    this.scales.y.domain(yDomain);
    
    // Update ranges with new aspect ratio
    this.updateScaleRanges();
  }

  clear(): void {
    this.g.selectAll('*').remove();
  }

  getDimensions(): ChartDimensions {
    return this.dimensions;
  }

  destroy(): void {
    this.svg.remove();
  }
}
