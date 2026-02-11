/**
 * D3ScaleFactory - Factory for creating D3 scales with consistent configuration
 * Supports margins for proper axis label and tick positioning
 */

import * as d3 from 'd3';

export interface ChartMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  margins: ChartMargins;
  plotWidth: number;
  plotHeight: number;
}

export class D3ScaleFactory {
  /**
   * Default margins for calcplot-style charts
   * Increased to prevent label/tick clipping
   */
  static readonly DEFAULT_MARGINS: ChartMargins = {
    top: 50,
    right: 20,
    bottom: 55,
    left: 75
  };

  /**
   * Get proportional margins for small contexts
   */
  static getProportionalMargins(width: number, height: number): ChartMargins {
    // For small contexts, use proportional margins but with minimum values
    if (width < 600 || height < 400) {
      const scaleFactor = Math.min(width / 800, height / 600);
      return {
        top: Math.max(30, Math.round(50 * scaleFactor)),
        right: Math.max(40, Math.round(50 * scaleFactor)),
        bottom: Math.max(60, Math.round(80 * scaleFactor)),
        left: Math.max(70, Math.round(100 * scaleFactor))
      };
    }
    
    return this.DEFAULT_MARGINS;
  }

  /**
   * Calculate plot dimensions from total dimensions and margins
   */
  static calculateDimensions(width: number, height: number, margins: ChartMargins = this.DEFAULT_MARGINS): ChartDimensions {
    return {
      width,
      height,
      margins,
      plotWidth: width - margins.left - margins.right,
      plotHeight: height - margins.top - margins.bottom
    };
  }

  /**
   * Create a linear scale for x-axis with plot area margins
   */
  static createXScale(width: number, domain: [number, number] = [0, 10], margins: ChartMargins = this.DEFAULT_MARGINS): d3.ScaleLinear<number, number> {
    return d3.scaleLinear()
      .domain(domain)
      .range([margins.left, width - margins.right]);
  }

  /**
   * Create a linear scale for y-axis with plot area margins
   */
  static createYScale(height: number, domain: [number, number] = [0, 10], margins: ChartMargins = this.DEFAULT_MARGINS): d3.ScaleLinear<number, number> {
    return d3.scaleLinear()
      .domain(domain)
      .range([height - margins.bottom, margins.top]);
  }

  /**
   * Create both x and y scales (full SVG dimensions)
   */
  static createScales(width: number, height: number, xDomain: [number, number] = [0, 10], yDomain: [number, number] = [0, 10], margins: ChartMargins = this.DEFAULT_MARGINS) {
    const xScale = this.createXScale(width, xDomain, margins);
    const yScale = this.createYScale(height, yDomain, margins);
    return { xScale, yScale };
  }

  /**
   * Update scale domains
   */
  static updateScaleDomains(scales: {
    xScale: d3.ScaleLinear<number, number>;
    yScale: d3.ScaleLinear<number, number>;
  }, xDomain: [number, number], yDomain: [number, number]): void {
    scales.xScale.domain(xDomain);
    scales.yScale.domain(yDomain);
  }

  /**
   * Update scale ranges with plot area margins and aspect ratio support
   */
  static updateScaleRanges(scales: {
    xScale: d3.ScaleLinear<number, number>;
    yScale: d3.ScaleLinear<number, number>;
  }, width: number, height: number, margins: ChartMargins = this.DEFAULT_MARGINS, aspectRatio?: string): void {
    
    if (aspectRatio === 'equal') {
      // Calculate plot dimensions
      const plotWidth = width - margins.left - margins.right;
      const plotHeight = height - margins.top - margins.bottom;
      
      // Use the smaller dimension for both to maintain aspect ratio
      const size = Math.min(plotWidth, plotHeight);
      
      // Center the plot area
      const xPadding = (plotWidth - size) / 2;
      const yPadding = (plotHeight - size) / 2;
      
      scales.xScale.range([margins.left + xPadding, width - margins.right - xPadding]);
      scales.yScale.range([height - margins.bottom - yPadding, margins.top + yPadding]);
    } else {
      scales.xScale.range([margins.left, width - margins.right]);
      scales.yScale.range([height - margins.bottom, margins.top]);
    }
  }
}
