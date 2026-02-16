/**
 * Web Environment Renderer
 * Handles direct rendering in browser DOM
 */

import { EnvironmentRenderer, RenderOptions } from './EnvironmentRenderer';
import { TargetResolver, type TargetResolution } from './TargetResolver';
import type { AnyDescriptor } from '../types';
import { isBrowser } from '../utils/environment';

export class WebRenderer extends EnvironmentRenderer {
  async render(descriptor: AnyDescriptor, options?: RenderOptions): Promise<void> {
    this.validateDescriptor(descriptor);
    
    const targetResolution = TargetResolver.resolve(options?.target);
    
    try {
      // Render directly to target element without iframe
      await this.initializeClient(targetResolution.element, descriptor);
      this.applyContainerStyles(targetResolution.element, options);
    } catch (error) {
      console.error('Web rendering failed:', error);
      throw error;
    }
  }

  isAvailable(): boolean {
    return isBrowser();
  }

  getName(): string {
    return 'WebRenderer';
  }


  /**
   * Initialize client with descriptor
   */
  private async initializeClient(container: HTMLElement, descriptor: AnyDescriptor): Promise<void> {
    // Import and initialize client directly
    const { initializeClient } = await import('../../client/index');
    await initializeClient(container, descriptor);
  }
}
