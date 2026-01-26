/**
 * Vitest setup file
 */

// Setup for Deno environment
import { vi } from 'vitest';

// Mock Deno.jupyter if not available
if (typeof (globalThis as any).Deno === 'undefined') {
  (globalThis as any).Deno = {
    jupyter: {
      broadcast: vi.fn()
    }
  };
}
