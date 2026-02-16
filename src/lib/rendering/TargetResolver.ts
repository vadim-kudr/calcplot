/**
 * Target Resolution System
 * Handles automatic container detection and creation for different environments
 */

export type Target = string | HTMLElement;

export interface TargetResolution {
  element: HTMLElement;
  wasCreated: boolean;
  id: string;
}

export class TargetResolver {
  private static readonly DEFAULT_ID = 'calcplot-container';
  private static readonly EXAMPLE_ID = 'calcplot-default';

  /**
   * Resolve target element from various input types
   */
  static resolve(target?: Target): TargetResolution {
    // 1. Explicit target provided
    if (target) {
      return this.resolveExplicit(target);
    }

    // 2. Try to find existing container
    const existing = this.findExistingContainer();
    if (existing) {
      return {
        element: existing,
        wasCreated: false,
        id: existing.id || this.DEFAULT_ID
      };
    }

    // 3. Create new default container
    return this.createDefaultContainer();
  }

  /**
   * Resolve explicitly provided target
   */
  private static resolveExplicit(target: Target): TargetResolution {
    if (typeof target === 'string') {
      const element = this.getElementById(target) || this.querySelector(target);
      if (!element) {
        throw new Error(`Target element not found: ${target}`);
      }
      return {
        element,
        wasCreated: false,
        id: element.id || target
      };
    }

    // HTMLElement provided
    return {
      element: target,
      wasCreated: false,
      id: target.id || this.generateId()
    };
  }

  /**
   * Find existing container in the DOM
   */
  private static findExistingContainer(): HTMLElement | null {
    if (typeof document === 'undefined') {
      return null;
    }

    // Try multiple selectors in order of preference
    const selectors = [
      `#${this.DEFAULT_ID}`,
      `#${this.EXAMPLE_ID}`,
      '.calcplot-container',
      '[data-calcplot-container]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element as HTMLElement;
      }
    }

    return null;
  }

  /**
   * Create new default container
   */
  private static createDefaultContainer(): TargetResolution {
    if (typeof document === 'undefined') {
      throw new Error('Cannot create container in non-browser environment');
    }

    const container = document.createElement('div');
    container.id = this.EXAMPLE_ID;
    container.className = 'calcplot-container';
    container.setAttribute('data-calcplot-container', 'true');
    
    // Apply default styling
    container.style.cssText = `
      margin: 20px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      font-family: system-ui, -apple-system, sans-serif;
    `;

    document.body.appendChild(container);

    return {
      element: container,
      wasCreated: true,
      id: container.id
    };
  }

  /**
   * Get element by ID
   */
  private static getElementById(id: string): HTMLElement | null {
    return typeof document !== 'undefined' ? document.getElementById(id) : null;
  }

  /**
   * Query selector with fallback
   */
  private static querySelector(selector: string): HTMLElement | null {
    return typeof document !== 'undefined' ? document.querySelector(selector) : null;
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return `calcplot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create container for examples (clean, without appending to body)
   */
  static createExampleContainer(): HTMLElement {
    if (typeof document === 'undefined') {
      throw new Error('Cannot create container in non-browser environment');
    }

    const container = document.createElement('div');
    container.id = this.generateId();
    container.className = 'calcplot';
    
    return container;
  }
}
