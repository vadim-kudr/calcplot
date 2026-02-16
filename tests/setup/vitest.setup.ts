import { beforeAll, afterEach, vi } from 'vitest';
import { setupSVGMocks, resetSVGMocks } from './svg-mocks';

// Mock fetch to avoid CSS loading
(global.fetch as any) = vi.fn(() => Promise.resolve({
  ok: true,
  text: () => Promise.resolve('.calcplot-style { }')
}));

beforeAll(() => {
  setupSVGMocks();
  
  // Mock localStorage for JSDOM
  Object.defineProperty(globalThis, 'localStorage', {
    writable: true,
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0
    }
  });
  
  // Mock Deno.jupyter if not available
  if (typeof (globalThis as any).Deno === 'undefined') {
    (globalThis as any).Deno = {
      jupyter: {
        broadcast: vi.fn()
      }
    };
  }
});

afterEach(() => {
  resetSVGMocks();
});
