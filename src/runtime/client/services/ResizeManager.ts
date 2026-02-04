/**
 * ResizeManager - Handles ResizeObserver with debouncing
 */

export interface ResizeManagerOptions {
  debounceMs?: number;
  minSizeChange?: number;
}

export class ResizeManager {
  private observer?: ResizeObserver;
  private debouncedCallback: (width: number, height: number) => void;
  private lastWidth?: number;
  private lastHeight?: number;

  constructor(
    private element: HTMLElement,
    private callback: (width: number, height: number) => void,
    private options: ResizeManagerOptions = {}
  ) {
    const { debounceMs = 16, minSizeChange = 1 } = options;
    
    this.debouncedCallback = this.debounce(callback, debounceMs);
    this.setupObserver();
  }

  /**
   * Setup ResizeObserver to handle container size changes
   */
  private setupObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          
          // Only update if size actually changed significantly
          if (this.shouldResize(width, height)) {
            this.debouncedCallback(width, height);
            this.lastWidth = width;
            this.lastHeight = height;
          }
        }
      });
      
      this.observer.observe(this.element);
    }
  }

  /**
   * Check if resize should be performed based on size change threshold
   */
  private shouldResize(width: number, height: number): boolean {
    const { minSizeChange = 1 } = this.options;
    
    if (this.lastWidth === undefined || this.lastHeight === undefined) {
      return true;
    }
    
    return (
      Math.abs(width - this.lastWidth) > minSizeChange ||
      Math.abs(height - this.lastHeight) > minSizeChange
    );
  }

  /**
   * Simple debounce implementation
   */
  private debounce<T extends (...args: any[]) => void>(
    func: T,
    waitMs: number
  ): (...args: Parameters<T>) => void {
    let timeout: number | undefined;
    
    return (...args: Parameters<T>) => {
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
      
      timeout = window.setTimeout(() => {
        func(...args);
      }, waitMs);
    };
  }

  /**
   * Force a resize check
   */
  checkResize(): void {
    const rect = this.element.getBoundingClientRect();
    const { width, height } = rect;
    
    if (this.shouldResize(width, height)) {
      this.callback(width, height);
      this.lastWidth = width;
      this.lastHeight = height;
    }
  }

  /**
   * Update the callback function
   */
  updateCallback(callback: (width: number, height: number) => void): void {
    this.callback = callback;
    this.debouncedCallback = this.debounce(callback, this.options.debounceMs || 16);
  }

  /**
   * Destroy the ResizeObserver and clean up
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }
}
