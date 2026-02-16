/**
 * Environment Renderer Base Class
 * Defines common interface for all environment-specific renderers
 */

import type { AnyDescriptor } from '../types';

export interface RenderOptions {
  width?: number | string;
  height?: number | string;
  target?: string | HTMLElement;
}

export abstract class EnvironmentRenderer {
  /**
   * Render descriptor to the target environment
   */
  abstract render(descriptor: AnyDescriptor, options?: RenderOptions): Promise<void>;

  /**
   * Check if this renderer is available in current environment
   */
  abstract isAvailable(): boolean;

  /**
   * Get renderer name for debugging
   */
  abstract getName(): string;

  /**
   * Validate descriptor before rendering
   */
  protected validateDescriptor(descriptor: AnyDescriptor): void {
    if (!descriptor || typeof descriptor !== 'object') {
      throw new Error('Invalid descriptor: must be an object');
    }

    // Check for type property in descriptor variants
    if ('type' in descriptor && !descriptor.type) {
      throw new Error('Invalid descriptor: missing type property');
    }
  }

  /**
   * Extract dimensions from options
   */
  protected extractDimensions(options?: RenderOptions): { width?: number | string; height?: number | string } {
    return {
      width: options?.width,
      height: options?.height
    };
  }

  /**
   * Generate unique container ID
   */
  protected generateId(): string {
    return `calcplot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Apply container styling
   */
  protected applyContainerStyles(element: HTMLElement, options?: RenderOptions): void {
    const { width, height } = this.extractDimensions(options);
    
    if (width) {
      element.style.width = typeof width === 'number' ? `${width}px` : width;
    }
    
    if (height) {
      element.style.height = typeof height === 'number' ? `${height}px` : height;
    }
  }
}
