/**
 * CalcPlot Client Initialization
 * Handles setup and initialization of visualizations
 */

import { createSlider } from '../visualization/controls/Slider';
import { createCheckbox } from '../visualization/controls/Checkbox';
import { view } from '../lib/builders/ViewBuilder';
import { initializeExplore } from './managers/ExploreManager';
import { initializeShow } from './managers/ShowManager';
import { initializeCompare } from './managers/CompareManager';
import { initializeCSSVariables } from './utils/CSSVariables';
import { AnyDescriptor } from '../lib/types';

// Make components available globally for client
if (typeof globalThis !== 'undefined') {
  (globalThis as any).CalcPlotComponents = {
    createSlider: createSlider,
    createCheckbox: createCheckbox,
    view: view
  };
}

// Main initialization function
export function initializeClient(
  container: HTMLElement,
  data?: AnyDescriptor
): void {
  // Initialize CSS variables first
  initializeCSSVariables();

  const calcData = data || (window as any).calcPlotData;
  if (!calcData) {
    console.warn('[calcplot] No calcplot data found');
    return;
  }

  if (!container) {
    console.warn('[calcplot] No container provided - visualization skipped');
    return;
  }

  // Handle different data types
  if (calcData && 'type' in calcData) {
    if (calcData.type === 'explore') {
      initializeExplore(calcData as any, container);
    } else if (calcData.type === 'show') {
      initializeShow(calcData as any, container);
    } else if (calcData.type === 'compare') {
      initializeCompare(calcData as any, container);
    } else {
      console.warn('[calcplot] Unknown data type:', (calcData as any).type);
    }
  } else {
    console.warn('[calcplot] Invalid data format - missing type property');
  }
}
