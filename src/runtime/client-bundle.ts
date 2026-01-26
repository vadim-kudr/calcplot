/**
 * CalcPlot Client Bundle
 * Runtime components for browser visualization
 */

// Import and export all client runtime components
import { initializeClient, createCheckbox, createSlider } from './client/index';
import { view } from '../ui/ViewBuilder';

// Make available globally for IIFE bundle
if (typeof globalThis !== 'undefined') {
  (globalThis as any).CalcPlotClient = {
    initializeClient,
    createCheckbox,
    createSlider,
    view
  };
}
