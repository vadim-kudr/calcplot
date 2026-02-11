/**
 * SVGManager - Handles SVG creation, sizing, and context management
 * Supports margins for proper axis label and tick positioning
 */

import * as d3 from 'd3';
import { RenderContext } from '../interfaces';
import { D3ScaleFactory, ChartDimensions, ChartMargins } from '../utils';

export interface SVGManagerOptions {
  width?: number;
  height?: number;
  defaultBounds?: { x: [number, number]; y: [number, number] };
  margins?: ChartMargins;
}

export class SVGManager {
  private svg?: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g?: d3.Selection<SVGGElement, unknown, null, undefined>;
  private scales?: {
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
      this.options.defaultBounds?.y || [0, 10],
      this.options.margins || D3ScaleFactory.DEFAULT_MARGINS
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
      this.options.margins || D3ScaleFactory.DEFAULT_MARGINS
    );

    // Then create SVG elements
    this.svg = this.createSVG();
    this.g = this.svg.append('g');
  }

  private createSVG(): d3.Selection<SVGSVGElement, unknown, null, undefined> {
    return d3
      .select(this.container)
      .append('svg')
      .attr('width', this.dimensions.width)
      .attr('height', this.dimensions.height);
  }

  getContext(params?: any): RenderContext {
    // Scales guaranteed to exist - return directly
    return {
      svg: this.svg!,
      g: this.g!,
      xScale: this.scales!.x, // Never undefined
      yScale: this.scales!.y, // Never undefined
      width: this.dimensions.width,
      height: this.dimensions.height,
      margins: this.dimensions.margins, // Use calculated margins
      params // Pass parameters to render context
    };
  }

  /**
   * Resize the SVG and update dimensions
   */
  resize(width: number, height: number): void {
    // Update SVG size
    this.svg!.attr('width', width).attr('height', height);

    // Update dimensions
    this.dimensions = D3ScaleFactory.calculateDimensions(width, height, this.options.margins || D3ScaleFactory.DEFAULT_MARGINS);

    // Update scale ranges with new dimensions
    this.updateScaleRanges();
  }

  /**
   * Update scale ranges based on current dimensions and aspect ratio
   */
  private updateScaleRanges(): void {
    D3ScaleFactory.updateScaleRanges(
      {
        xScale: this.scales!.x,
        yScale: this.scales!.y
      },
      this.dimensions.width,
      this.dimensions.height,
      this.dimensions.margins,
      this.aspectRatio
    );
  }

  updateDomains(xDomain: [number, number], yDomain: [number, number], aspectRatio?: string): void {
    // Update aspect ratio if provided
    if (aspectRatio !== undefined) {
      this.aspectRatio = aspectRatio;
    }

    // Update domains - scales guaranteed to exist
    this.scales!.x.domain(xDomain);
    this.scales!.y.domain(yDomain);

    // Update ranges with new aspect ratio
    this.updateScaleRanges();
  }

  clear(): void {
    this.g!.selectAll('*').remove();
  }

  getDimensions(): ChartDimensions {
    return this.dimensions;
  }

  destroy(): void {
    // Remove SVG from DOM
    const node = this.svg?.node();
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }

    // Clear references to prevent memory leaks
    this.svg = undefined;
    this.g = undefined;
    this.scales = undefined;
  }
}
