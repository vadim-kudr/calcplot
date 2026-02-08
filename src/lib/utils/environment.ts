/**
 * Environment detection utilities
 */

export type Environment = 'browser' | 'deno' | 'node';

export interface EnvironmentDetails {
  isDeno: boolean;
  isJupyter: boolean;
  isBrowser: boolean;
  isNode: boolean;
}

export function detectEnvironment(): Environment {
  // Browser environment
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'browser';
  }

  // Deno environment
  // @ts-expect-error - Deno global
  if (typeof Deno !== 'undefined') {
    return 'deno';
  }

  // Node.js environment (fallback)
  return 'node';
}

export function detectEnvironmentDetails(): EnvironmentDetails {
  // Check for Deno
  const isDeno = typeof (globalThis as unknown as { Deno?: unknown }).Deno !== 'undefined';

  // Check for Jupyter (within Deno)
  const isJupyter = isDeno && typeof ((globalThis as unknown as { Deno?: { jupyter?: unknown } }).Deno?.jupyter) !== 'undefined';

  // Check for browser
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  // Check for Node.js
  const isNode =
    typeof (globalThis as unknown as { process?: { versions?: { node?: string } } }).process !== 'undefined' &&
    (globalThis as unknown as { process?: { versions?: { node?: string } } }).process?.versions?.node;

  return {
    isDeno,
    isJupyter,
    isBrowser,
    isNode: !!isNode
  };
}

export function isAsyncSupported(): boolean {
  return typeof Promise !== 'undefined';
}

export function supportsDynamicImport(): boolean {
  try {
    // Test if dynamic import is available
    new Function('return import("")');
    return true;
  } catch {
    return false;
  }
}

// Legacy compatibility functions
export function isDenoJupyter(): boolean {
  const env = detectEnvironmentDetails();
  return env.isDeno && env.isJupyter;
}

export function supportsHTMLOutput(): boolean {
  const env = detectEnvironmentDetails();
  return (env.isDeno && env.isJupyter) || env.isBrowser;
}

export function isBrowser(): boolean {
  const env = detectEnvironmentDetails();
  return env.isBrowser;
}
