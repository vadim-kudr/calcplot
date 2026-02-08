/**
 * HTML display utilities
 */

import { isDenoJupyter } from './environment';

/**
 * Display HTML content based on environment
 */
export async function displayHTML(
  html: string,
  targetElement?: string | HTMLElement
): Promise<void> {
  // Check environment
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  const isJupyter = isDenoJupyter();

  if (isBrowser) {
    let target: HTMLElement | null = null;

    if (targetElement) {
      if (typeof targetElement === 'string') {
        target = document.getElementById(targetElement) || document.querySelector(targetElement);
      } else {
        target = targetElement;
      }
    }

    if (target) {
      // Insert HTML into target
      target.innerHTML = html;

      // Execute any scripts in the inserted HTML
      executeScripts(target);
    } else {
      // No target found - create default container
      const defaultContainer =
        document.getElementById('calcplot-default') ||
        document.querySelector('.calcplot-container') ||
        createDefaultContainer();
      defaultContainer.innerHTML = html;

      // Execute any scripts in the inserted HTML
      executeScripts(defaultContainer);
    }
  } else if (isJupyter) {
    // Jupyter environment - just send HTML as is
    try {
      const denoJupyter = (globalThis as unknown as { Deno?: { jupyter?: { broadcast: (type: string, data: unknown) => Promise<void> } } }).Deno?.jupyter;
      if (denoJupyter) {
        // Use proper Jupyter broadcast API
        await denoJupyter.broadcast('display_data', {
          data: { 'text/html': html },
          metadata: {}
        });
      }
    } catch (error) {
      console.error('Jupyter HTML display failed:', error);
    }
  } else {
    // Fallback to console
  }
}

/**
 * Create default container for HTML content (browser only)
 */
function createDefaultContainer(): HTMLElement {
  if (!(typeof window !== 'undefined' && typeof document !== 'undefined')) {
    throw new Error('Cannot create DOM elements in non-browser environment');
  }

  const container = document.createElement('div');
  container.id = 'calcplot-default';
  container.className = 'calcplot-container';
  container.style.cssText = `
    margin: 20px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    font-family: system-ui, -apple-system, sans-serif;
  `;
  document.body.appendChild(container);
  return container;
}

/**
 * Execute script content safely (browser only)
 */
function executeScriptOnce(scriptContent: string): boolean | null {
  if (!(typeof window !== 'undefined' && typeof document !== 'undefined')) {
    return null;
  }

  // Create unique script ID to avoid duplicate execution
  const scriptId =
    'calcplot-script-' +
    Math.abs(
      scriptContent.split('').reduce((acc, char) => {
        acc = (acc << 5) - acc + char.charCodeAt(0);
        return acc & acc;
      }, 0)
    );

  // Check if script already executed
  if (document.getElementById(scriptId)) {
    return null;
  }

  try {
    // Create script element with unique ID
    const script = document.createElement('script');
    script.id = scriptId;
    script.textContent = scriptContent;

    // Append to head for execution
    document.head.appendChild(script);

    return true;
  } catch (error) {
    console.error('Script execution failed:', error);
    return null;
  }
}

/**
 * Execute scripts in inserted HTML (browser only)
 */
function executeScripts(container: Element) {
  const scripts = container.querySelectorAll('script');
  scripts.forEach((oldScript) => {
    const scriptContent = oldScript.innerHTML;
    if (scriptContent.trim()) {
      executeScriptOnce(scriptContent);
    }
  });
}
