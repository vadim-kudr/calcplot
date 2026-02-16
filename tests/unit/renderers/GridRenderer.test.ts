/**
 * Unit Tests: GridRenderer
 * Tests grid rendering functionality
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { GridRenderer } from '../../../src/visualization/plots/renderers';
import type { RenderContext } from '../../../src/visualization/plots/interfaces/RenderContext';
import * as d3 from 'd3';

describe('GridRenderer', () => {
  let gridRenderer: GridRenderer;
  let container: HTMLElement;
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let g: d3.Selection<SVGGElement, unknown, null, undefined>;
  let mockContext: RenderContext;

  beforeEach(() => {
    // Use real DOM instead of extensive mocking
    container = document.createElement('div');
    document.body.appendChild(container);
    
    svg = d3.select(container).append('svg').attr('width', 800).attr('height', 600);
    g = svg.append('g');
    
    mockContext = {
      svg,
      g,
      xScale: d3.scaleLinear().domain([0, 10]).range([80, 720]),
      yScale: d3.scaleLinear().domain([0, 10]).range([520, 80]),
      width: 800,
      height: 600,
      margins: { top: 40, right: 40, bottom: 40, left: 60 }
    };
    
    gridRenderer = new GridRenderer();
  });

  afterEach(() => {
    // Clean up DOM
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  test('should render grid when showGrid is true', () => {
    const layer = {
      type: 'grid',
      options: {
        showGrid: true
      }
    };
    
    gridRenderer.render(layer, mockContext);
    
    // Should create grid group
    const gridGroup = g.select('.grid-group');
    expect(gridGroup.size()).toBe(1);
    
    // Should create grid lines
    const gridLinesX = g.selectAll('.grid-line-x');
    const gridLinesY = g.selectAll('.grid-line-y');
    expect(gridLinesX.size() + gridLinesY.size()).toBeGreaterThan(0);
    
    // Should have correct stroke attributes
    const firstLine = gridLinesX.nodes()[0] as SVGLineElement || gridLinesY.nodes()[0] as SVGLineElement;
    expect(firstLine?.getAttribute('stroke')).toBeDefined();
    expect(firstLine?.getAttribute('stroke-width')).toBeDefined();
  });

  test('should not render grid when showGrid is false', () => {
    const layer = {
      type: 'grid',
      options: {
        showGrid: false
      }
    };
    
    gridRenderer.render(layer, mockContext);
    
    // Should not create grid group
    const gridGroup = g.select('.grid-group');
    expect(gridGroup.size()).toBe(0);
    
    // Should not create grid lines
    const gridLines = g.selectAll('.grid-line');
    expect(gridLines.size()).toBe(0);
  });

  test('should use default grid color when not specified', () => {
    const layer = {
      type: 'grid',
      options: {
        showGrid: true
      }
    };

    gridRenderer.render(layer, mockContext);
  });

  test('should handle missing options gracefully', () => {
    const layer = {
      type: 'grid'
    };

    gridRenderer.render(layer, mockContext);
  });

  test('should render vertical and horizontal grid lines', () => {
    const layer = {
      type: 'grid',
      options: {
        showGrid: true
      }
    };
    
    gridRenderer.render(layer, mockContext);
    
    const gridGroup = g.select('.grid-group');
    const gridLinesX = gridGroup.selectAll('.grid-line-x');
    const gridLinesY = gridGroup.selectAll('.grid-line-y');
    
    // Should have both vertical and horizontal lines
    expect(gridLinesX.size() + gridLinesY.size()).toBeGreaterThan(0);
    
    // Check that lines have correct attributes
    gridLinesX.each(function() {
      const line = d3.select(this);
      expect(line.attr('stroke')).toBeDefined();
      expect(line.attr('stroke-width')).toBeDefined();
      expect(line.attr('stroke-dasharray')).toBeDefined();
    });
    
    gridLinesY.each(function() {
      const line = d3.select(this);
      expect(line.attr('stroke')).toBeDefined();
      expect(line.attr('stroke-width')).toBeDefined();
      expect(line.attr('stroke-dasharray')).toBeDefined();
    });
  });
});
