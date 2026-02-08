/**
 * Controls Manager - handles UI controls creation and parameter management
 */

import { createElement } from '../utils/html-tag';
import { SliderControl, CheckboxControl } from '../../lib/controls';
import { ExploreDescriptor } from '../../lib/types';

// Runtime interfaces for dynamic controls
interface RuntimeSliderControl extends SliderControl {
  value?: number;
}

interface RuntimeCheckboxControl extends CheckboxControl {
  value?: boolean;
}

type RuntimeControl = RuntimeSliderControl | RuntimeCheckboxControl;

interface RuntimeParams {
  [key: string]: RuntimeControl;
}

interface RuntimeExploreData extends ExploreDescriptor {
  params: RuntimeParams;
}

// Helper function to resolve dimensions
export function resolveDimension(value: number | string | 'auto', container: HTMLElement, fallback: number, useClientWidth = false): number {
  if (value === 'auto' && useClientWidth) {
    const clientWidth = container.clientWidth;
    // If clientWidth is 0 (container not rendered yet), use fallback
    return (clientWidth && clientWidth > 0) ? clientWidth : fallback;
  }
  if (typeof value === 'number') {
    return value;
  }
  return fallback;
}

// Create controls for explore mode
export function createControls(
  data: RuntimeExploreData,
  container: HTMLElement,
  options?: {
    log?: (...args: unknown[]) => void;
    onUpdate?: () => void;
  }
): void {
  // Add CSS styles
  const style = createElement('style', {
    textContent: `
      .calcplot-controls {
        margin: 16px 12px;
        display: table;
        border-collapse: collapse;
      }
      .control-group {
        display: table-row;
        height: 24px;
      }
      .control-group label {
        display: table-cell;
        font-weight: 500;
        margin: 0;
        font-size: 14px;
        text-align: right;
        padding-right: 12px;
        padding-left: 2px;
        vertical-align: middle;
        white-space: nowrap;
      }
      .control-group input[type="range"] {
        display: table-cell;
        margin: 0;
        vertical-align: middle;
        width: 150px;
        padding: 0;
      }
      .control-group .value-display {
        display: table-cell;
        text-align: left;
        font-family: monospace;
        font-size: 14px;
        color: #374151;
        vertical-align: middle;
        width: 60px;
        padding-left: 12px;
        padding-right: 2px;
      }
      .control-group input[type="checkbox"] {
        display: table-cell;
        margin: 0;
        transform: scale(1.2);
        vertical-align: middle;
      }
    `
  });
  container.appendChild(style);

  const controlsDiv = createElement('div', {
    className: 'calcplot-controls'
  });
  container.appendChild(controlsDiv);

  // Initialize values from defaults
  Object.entries(data.params).forEach(([key, param]) => {
    if (param.type === 'slider') {
      (param as RuntimeSliderControl).value = param.default;
    } else if (param.type === 'checkbox') {
      (param as RuntimeCheckboxControl).value = param.default;
    }
  });

  Object.entries(data.params).forEach(([key, param]: [string, RuntimeControl]) => {
    if (param.type === 'slider') {
      const createSlider = (window as any).CalcPlotComponents?.createSlider;
      if (createSlider) {
        createSlider(controlsDiv, {
          id: key,
          control: param,
          value: param.default,
          onChange: (id: string, value: number) => {
            // Update parameter value and refresh simulation
            if (data.params[id]) {
              (data.params[id] as SliderControl & { value?: number }).value = value;
            }
            options?.onUpdate?.();
          }
        });
      } else {
        options?.log?.('createSlider not available');
      }
    } else if (param.type === 'checkbox') {
      const createCheckbox = (window as any).CalcPlotComponents?.createCheckbox;
      if (createCheckbox) {
        createCheckbox(controlsDiv, {
          id: key,
          control: param,
          value: param.default,
          onChange: (id: string, value: boolean) => {
            // Update parameter value and refresh simulation
            if (data.params[id]) {
              data.params[id].value = value;
            }
            options?.onUpdate?.();
          }
        });
      } else {
        options?.log?.('createCheckbox not available');
      }
    }
  });
}

// Get current parameter values from controls
export function getParameters(data: RuntimeExploreData): Record<string, number | boolean> {
  const params: Record<string, number | boolean> = {};
  
  Object.entries(data.params).forEach(([key, param]: [string, RuntimeControl]) => {
    if (param.type === 'slider') {
      const sliderParam = param as RuntimeSliderControl;
      params[key] = sliderParam.value !== undefined ? sliderParam.value : sliderParam.default;
    } else if (param.type === 'checkbox') {
      const checkboxParam = param as RuntimeCheckboxControl;
      params[key] = checkboxParam.value !== undefined ? checkboxParam.value : checkboxParam.default;
    }
  });
  
  return params;
}
