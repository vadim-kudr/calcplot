/**
 * Deno Environment Renderer
 * Handles HTML generation for Deno/Jupyter environments
 */

import { EnvironmentRenderer, RenderOptions } from './EnvironmentRenderer';
import type { AnyDescriptor } from '../types';
import { isDenoJupyter } from '../utils/environment';

export class DenoRenderer extends EnvironmentRenderer {
  private bundleCache: string | null = null;
  private bundleInjected: boolean = false;
  private bundleLoadingPromise: Promise<string> | null = null;

  async render(descriptor: AnyDescriptor, options?: RenderOptions): Promise<void> {
    this.validateDescriptor(descriptor);

    const html = await this.generateHTML(descriptor, options);
    await this.displayHTML(html);
  }

  isAvailable(): boolean {
    return isDenoJupyter();
  }

  getName(): string {
    return 'DenoRenderer';
  }

  /**
   * Load client bundle once
   */
  private async loadClientBundle(): Promise<string> {
    if (this.bundleCache) return this.bundleCache;
    
    // Return existing promise if already loading
    if (this.bundleLoadingPromise) {
      return this.bundleLoadingPromise;
    }

    // Create and store loading promise
    this.bundleLoadingPromise = (async () => {
      try {
        const bundleUrl = import.meta.resolve('./calcplot-client-deno.js');
        const bundlePath = new URL(bundleUrl).pathname;

        // @ts-expect-error - Deno global
        this.bundleCache = await Deno.readTextFile(bundlePath);
        return this.bundleCache!;
      } catch (error) {
        throw new Error(
          `CalcPlot client bundle not found. ` +
            `Make sure to run 'npm run build' first.\n` +
            `Error: ${error instanceof Error ? error.message : String(error)}`
        );
      } finally {
        this.bundleLoadingPromise = null;
      }
    })();

    return this.bundleLoadingPromise;
  }

  /**
   * Generate HTML for descriptor
   */
  private async generateHTML(descriptor: AnyDescriptor, options?: RenderOptions): Promise<string> {
    const bundle = await this.loadClientBundle();
    const containerId = `calcplot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Inject bundle only once globally (atomic check and set)
    const shouldInjectBundle = !this.bundleInjected;
    if (shouldInjectBundle) {
      this.bundleInjected = true;
    }

    const scriptTag = shouldInjectBundle
      ? `
    <script>
      ${bundle}
      window.dispatchEvent(new Event('calcplot-ready'));
    </script>
    `
      : '';

    return `
      ${scriptTag}
      <div id="${containerId}"></div>
      <script>
        (function() {
          const data = ${JSON.stringify(descriptor)};
          const container = document.getElementById('${containerId}');
          
          if (window.CalcPlotClient) {
            window.CalcPlotClient.initializeClient(container, data);
          } else {
            window.addEventListener('calcplot-ready', function handler() {
              window.CalcPlotClient.initializeClient(container, data);
            }, { once: true });
          }
        })();
      </script>
    `;
  }

  /**
   * Display HTML in Jupyter environment
   */
  private async displayHTML(html: string): Promise<void> {
    try {
      // @ts-expect-error - Deno global
      const denoJupyter = globalThis.Deno?.jupyter;
      if (denoJupyter) {
        await denoJupyter.broadcast('display_data', {
          data: { 'text/html': html },
          metadata: {}
        });
      } else {
        console.warn('Jupyter environment not available, HTML not displayed');
      }
    } catch (error) {
      console.error('Jupyter HTML display failed:', error);
      throw error;
    }
  }
}
