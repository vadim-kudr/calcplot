export { initializeClient } from './init';

// Re-export UI creation functions for client use
export { createCheckbox } from '../../ui/components/Checkbox';
export { createSlider } from '../../ui/components/Slider';
export { view } from '../../ui/ViewBuilder';

// Make components available globally for client
import { initializeClient } from './init';
import { createCheckbox } from '../../ui/components/Checkbox';
import { createSlider } from '../../ui/components/Slider';
import { view } from '../../ui/ViewBuilder';

// Create global components object
if (typeof globalThis !== 'undefined') {
  (globalThis as any).CalcPlotComponents = {
    initializeClient: initializeClient,
    createSlider: createSlider,
    createCheckbox: createCheckbox,
    view: view
  };
}
