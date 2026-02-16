/**
 * Default target management for examples
 */

let defaultTarget: string | null = null;

/**
 * Set the default target container for all visualizations
 * Used primarily in documentation examples
 */
export function setDefaultTarget(targetId: string): void {
  defaultTarget = targetId;
}

/**
 * Get the current default target
 */
export function getDefaultTarget(): string | null {
  return defaultTarget;
}

/**
 * Clear the default target
 */
export function clearDefaultTarget(): void {
  defaultTarget = null;
}

/**
 * Get target for rendering, with fallback to default
 */
export function getTargetWithFallback(optionsTarget?: string | HTMLElement): string | HTMLElement | undefined {
  return optionsTarget || defaultTarget || undefined;
}
