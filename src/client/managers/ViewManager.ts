/**
 * View Manager
 * Single source of truth for sizing
 *
 * Key changes:
 * - Explicit cell heights (no auto-expansion)
 * - Debounced ResizeObserver (50ms)
 * - Integer dimensions only
 * - Loop prevention flag
 */
import { ViewRenderer } from '../../visualization/plots/renderers/ViewRenderer';
import { Timeline } from '../../core/timeline';
import { createElement } from '../utils/html-tag';
import { parseDimension } from '../utils/dimensions';
import type { ViewDescriptor } from '../../lib/types';
import { DEFAULT_CONFIG } from '../../lib/config/defaults';
import { initializeCSSVariables } from '../../client/utils/CSSVariables';
import { ChartMargins } from '../../visualization';

export class ViewManager {
  private container: HTMLElement;
  private renderers: ViewRenderer[] = [];
  private resizeObserver?: ResizeObserver;
  private wrapper?: HTMLElement;
  private rendererMap: Map<HTMLElement, ViewRenderer> = new Map();
  private isResizing = false; // Prevent resize loops
  private resizeTimeouts = new Map<HTMLElement, number>(); // Per-cell debounce

  constructor(container: HTMLElement) {
    this.container = container;
    initializeCSSVariables();
    this.setupResizeObserver();
  }

  renderViews(
    viewDescriptors: ViewDescriptor[],
    containerWidth: string | number = 'auto',
    containerHeight: string | number = 'auto',
    callback?: () => void
  ): ViewRenderer[] {
    try {
      this.destroy();

      // Create wrapper with explicit sizing
      this.wrapper = this.createWrapper(containerWidth, containerHeight, viewDescriptors.length);

      // Use requestAnimationFrame to ensure wrapper is rendered before measuring
      requestAnimationFrame(() => {
        if (!this.wrapper) return;

        // Calculate cell dimensions after wrapper is in DOM
        const cellDimensions = this.calculateCellDimensions(
          containerWidth,
          containerHeight,
          viewDescriptors.length
        );

        // Create renderers with measured dimensions
        this.createRenderers(viewDescriptors, this.wrapper, cellDimensions);

        // Call callback after rendering is complete
        if (callback) {
          callback();
        }
      });

      return this.renderers;
    } catch (error) {
      console.error('ViewManager Error:', error);
      return [];
    }
  }

  updateViews(viewDescriptors: ViewDescriptor[]): void {
    // Update content only, don't touch sizes
    viewDescriptors.forEach((desc, i) => {
      const timeline =
        desc.timeline instanceof Timeline
          ? desc.timeline
          : new Timeline(desc.timeline.times, desc.timeline.states);
      this.renderers[i].render({
        type: 'view',
        timeline,
        layers: desc.layers
      });
    });
  }

  private createWrapper(w: string | number, h: string | number, count: number): HTMLElement {
    const wrapper = createElement('div', { class: 'calcplot-view-grid' });

    // Set explicit dimensions
    if (w !== 'auto') {
      wrapper.style.width = typeof w === 'number' ? `${w}px` : w;
    }

    if (h !== 'auto') {
      const heightPx = typeof h === 'number' ? h : parseDimension(h) || DEFAULT_CONFIG.HEIGHT + 100;
      wrapper.style.height = `${heightPx}px`;
      wrapper.classList.add('mode-fixed-height');
    }

    if (count > 1) {
      wrapper.classList.add('mode-multi-view');
    } else {
      wrapper.classList.add('single-view');
    }

    this.container.appendChild(wrapper);
    return wrapper;
  }

  private calculateCellDimensions(
    containerWidth: string | number,
    containerHeight: string | number,
    viewCount: number
  ): { width: number; height: number } {
    // Get actual wrapper width from DOM
    const actualWrapperWidth = this.wrapper?.clientWidth || 0;

    // Use provided containerWidth if it's numeric, otherwise use measured width
    let finalWidth: number;
    if (typeof containerWidth === 'number') {
      finalWidth = containerWidth;
    } else if (containerWidth !== 'auto') {
      finalWidth = parseDimension(containerWidth) || DEFAULT_CONFIG.DEFAULT_CONTAINER_WIDTH;
    } else {
      finalWidth =
        actualWrapperWidth || this.container.clientWidth || DEFAULT_CONFIG.DEFAULT_CONTAINER_WIDTH;
    }

    const heightPx = parseDimension(containerHeight) || DEFAULT_CONFIG.HEIGHT;

    const isMobile = finalWidth <= DEFAULT_CONFIG.MOBILE_BREAKPOINT;

    let cellHeight: number;

    if (isMobile && viewCount > 1) {
      // Mobile with multiple views: fixed height per view for comfortable scrolling
      cellHeight = DEFAULT_CONFIG.MOBILE_VIEW_HEIGHT;
    } else if (viewCount > 1) {
      // Desktop with multiple views: divide height equally
      // Account for grid gap (15px between items)
      const gridGap = DEFAULT_CONFIG.GRID_GAP;
      const rows = Math.ceil(viewCount / 2); // assuming 2 columns max
      const totalGaps = (rows - 1) * gridGap;
      cellHeight = (heightPx - totalGaps) / rows;
    } else {
      // Single view: use full height
      cellHeight = heightPx;
    }

    return {
      width: Math.max(300, finalWidth), // minimum 300px width
      height: Math.max(300, Math.floor(cellHeight)) // minimum 300px, integer
    };
  }

  private createRenderers(
    descriptors: ViewDescriptor[],
    wrapper: HTMLElement,
    cellDimensions: { width: number; height: number }
  ): void {
    descriptors.forEach((desc, index) => {
      const cell = createElement('div', { class: 'calcplot-view-item' });
      cell.style.height = `${cellDimensions.height}px`;
      cell.style.minHeight = `${cellDimensions.height}px`; // Prevent shrinking
      wrapper.appendChild(cell);

      const renderer = new ViewRenderer(cell, cellDimensions.width, cellDimensions.height);

      const timeline =
        desc.timeline instanceof Timeline
          ? desc.timeline
          : new Timeline(desc.timeline.times, desc.timeline.states);

      renderer.render({
        type: 'view',
        timeline,
        layers: desc.layers
      });

      this.renderers.push(renderer);
      this.rendererMap.set(cell, renderer);

      // Observe cell for EXTERNAL size changes only
      this.resizeObserver?.observe(cell);
    });
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      if (this.isResizing) {
        return;
      }

      // Debounce resize for this specific cell
      const timeout = window.setTimeout(() => {
        // Process each entry with debouncing
        for (const entry of entries) {
          const cell = entry.target as HTMLElement;
          const renderer = this.rendererMap.get(cell);

          if (!renderer) continue;

          // Clear existing timeout for this cell
          const existingTimeout = this.resizeTimeouts.get(cell);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }

          const { width, height } = entry.contentRect;

          // Only update if size is valid
          if (width > 0 && height > 0) {
            // Round to integers
            const w = Math.floor(width);
            const h = Math.floor(height);

            // Set flag to prevent loops
            this.isResizing = true;

            // Update renderer
            renderer.updateSize(w, h);

            // Reset flag after render completes
            requestAnimationFrame(() => {
              this.isResizing = false;
            });
          }

          // Clean up timeout reference
          this.resizeTimeouts.delete(cell);

          this.resizeTimeouts.set(cell, timeout);
        }
      }, 25); // 50ms debounce
    });
  }

  getCurrentMargins(): ChartMargins | undefined {
    // Get margins from first renderer (they should all have the same margins)
    const firstRenderer = this.renderers[0];
    // Use the public getter to access SVGManager
    console.log(firstRenderer?.getSVGManager().getDimensions()?.margins);
    return firstRenderer?.getSVGManager().getDimensions()?.margins;
  }

  destroy(): void {
    // Clear all pending timeouts
    this.resizeTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.resizeTimeouts.clear();

    // Disconnect observer
    this.resizeObserver?.disconnect();

    // Destroy renderers
    this.renderers.forEach((r) => r.destroy());
    this.renderers = [];

    // Clear maps
    this.rendererMap.clear();

    // Remove wrapper
    this.wrapper?.remove();
    this.wrapper = undefined;
  }
}
