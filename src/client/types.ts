/**
 * Global CalcPlot components interface
 */

import type { AnyDescriptor } from '../lib/types';
import type { Timeline } from '../core/types';
import type { VisualizationData } from '../visualization/plots/renderers/ViewRenderer';
import type { CheckboxProps } from '../visualization/controls/Checkbox';
import type { SliderProps } from '../visualization/controls/Slider';
import type { ViewBuilder } from '../lib/builders/ViewBuilder';

export interface CalcPlotComponents {
  initializeClient: (container: HTMLElement, data: AnyDescriptor) => void;
  createCheckbox: (container: HTMLElement, props: CheckboxProps) => HTMLInputElement;
  createSlider: (container: HTMLElement, props: SliderProps) => HTMLInputElement;
  view: (timeline?: Timeline) => ViewBuilder;
}

declare global {
  var CalcPlotComponents: CalcPlotComponents | undefined;
  
  interface Window {
    CalcPlotComponents?: CalcPlotComponents;
  }
}
