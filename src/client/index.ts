import { initializeClient } from './init';
import { createCheckbox } from '../visualization/controls/Checkbox';
import { createSlider } from '../visualization/controls/Slider';

// Re-export UI creation functions for client use
export { initializeClient } from './init';
export { createCheckbox } from '../visualization/controls/Checkbox';
export { createSlider } from '../visualization/controls/Slider';

// Make components available globally for client
if (typeof globalThis !== 'undefined') {
  (globalThis as any).CalcPlotComponents = {
    initializeClient,
    createCheckbox,
    createSlider,
  };
}
