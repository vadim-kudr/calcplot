/**
 * Universal bundle loader that works in all environments
 */

import { serializeModel, serializeParams } from '../../simulation/serialization';
import { detectEnvironment } from './environment';

// Cache for loaded bundle to prevent repeated fetches
let cachedBundle: string | null = null;

export async function loadClientBundle(): Promise<string> {
  // Return cached bundle if already loaded
  if (cachedBundle) {
    return cachedBundle;
  }

  const env = detectEnvironment();

  switch (env) {
    case 'browser':
      // Browser environment - fetch from server
      try {
        const response = await fetch('/dist/calcplot-client.js');
        if (!response.ok) {
          throw new Error(`Failed to load client bundle: ${response.status}`);
        }
        cachedBundle = await response.text();
        return cachedBundle;
      } catch (error) {
        console.error('Failed to load client bundle:', error);
        throw error;
      }
    
    case 'node':
      // Node.js environment - read from file system
      try {
        const fs = await import('fs');
        const path = await import('path');
        const bundlePath = path.join(process.cwd(), 'dist/calcplot-client.js');
        cachedBundle = fs.readFileSync(bundlePath, 'utf-8');
        return cachedBundle;
      } catch (error) {
        console.error('Failed to read client bundle:', error);
        throw error;
      }
    
    case 'deno':
      // Deno environment - read from file system
      try {
        // @ts-ignore - Deno global
        const bundlePath = `${Deno.cwd()}/dist/calcplot-client.js`;
        // @ts-ignore - Deno global
        const bundleContent = await Deno.readTextFile(bundlePath);
        cachedBundle = bundleContent;
        if (cachedBundle) {
          return cachedBundle;
        }
        throw new Error('Bundle content is null');
      } catch (error) {
        console.error('Failed to read client bundle:', error);
        throw error;
      }
    
    default:
      throw new Error(`Unsupported environment: ${env}`);
  }
}

async function loadBrowserBundle(): Promise<string> {
  // 1. Look for inline bundle
  const inlineScript = document.querySelector('script[data-calcplot-client]');
  if (inlineScript && inlineScript.textContent) {
    return inlineScript.textContent;
  }

  // 2. Look for loaded script tag
  const loadedScript = document.querySelector('script[src*="calcplot-client"]');
  if (loadedScript) {
    // If script is already loaded, try to get its content
    try {
      const response = await fetch(loadedScript.getAttribute('src')!);
      return await response.text();
    } catch {
      // If failed, return fallback
    }
  }

  // 3. Fallback - try to load standard path
  try {
    const response = await fetch('/dist/calcplot-client.js');
    if (response.ok) {
      return await response.text();
    }
  } catch {
    // Ignore errors
  }

  // 4. Final fallback - for browser return empty string
  // since bundle is usually inlined in HTML
  return '';
}

async function loadDenoBundle(): Promise<string> {
  try {
    // Try multiple possible paths for Deno Jupyter
    const possiblePaths = [
      './dist/calcplot-client-deno.js', // If running from project root
      '../dist/calcplot-client-deno.js', // If running from examples/ (Jupyter)
      '../../dist/calcplot-client-deno.js' // If running from subdirectory
    ];

    for (const path of possiblePaths) {
      try {
        // @ts-expect-error - Deno global
        return await Deno.readTextFile(path);
      } catch {
        // Continue to next path
      }
    }

    throw new Error('Bundle not found in any expected path');
  } catch (error) {
    console.warn('Failed to load Deno client bundle:', error);
    return '// CalcPlot Client bundle not available';
  }
}

async function loadNodeBundle(): Promise<string> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const bundlePath = path.join(__dirname, '../../dist/calcplot-client.js');
    return fs.readFileSync(bundlePath, 'utf-8');
  } catch (error) {
    console.warn('Failed to load Node.js client bundle:', error);
    return '// CalcPlot Client bundle not available';
  }
}

/**
 * Preload client bundle for better performance
 */
export async function preloadClientBundle(): Promise<void> {
  if (detectEnvironment() === 'browser') {
    // Preload in browser
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = '/dist/calcplot-client.js';
    document.head.appendChild(link);
  }
}
