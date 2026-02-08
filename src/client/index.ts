import { initializeClient } from './init';
import { createCheckbox } from '../visualization/controls/Checkbox';
import { createSlider } from '../visualization/controls/Slider';
import { view } from '../lib/builders/ViewBuilder';
import type { CalcPlotComponents } from './types';

// Re-export UI creation functions for client use
export { initializeClient } from './init';
export { createCheckbox } from '../visualization/controls/Checkbox';
export { createSlider } from '../visualization/controls/Slider';

// Make components available globally for client
if (typeof globalThis !== 'undefined') {
  (globalThis as { CalcPlotComponents: CalcPlotComponents }).CalcPlotComponents = {
    initializeClient,
    createCheckbox,
    createSlider,
    view,
  };
}
