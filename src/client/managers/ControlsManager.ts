/**
 * Controls Manager - handles UI controls creation and parameter management
 */

import { createElement } from '../utils/html-tag';
import { SliderControl, CheckboxControl } from '../../lib/controls';
import { ExploreDescriptor } from '../../lib/types';
import { D3ScaleFactory } from '../../visualization/plots/utils/D3ScaleFactory';
import { ViewManager } from './ViewManager';

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

// Update CSS variables with margins from ViewManager (single source of truth)
function updateDynamicMargins(gridContainer: HTMLElement, viewManager: ViewManager): void {
  // Get margins from ViewManager's SVGManager (single source of truth)
  const margins = viewManager.getCurrentMargins();

  if (!margins) {
    return;
  }

  // Use margins from graphs for top/bottom, but fixed left margin for controls and slightly smaller right margin
  const controlsTop = '0px';
  const controlsRight = `${margins.right}px`;
  const controlsBottom = '';
  const controlsLeft = `${margins.left}px`;

  // Update CSS variables
  gridContainer.style.setProperty('--controls-margin-top', controlsTop);
  gridContainer.style.setProperty('--controls-margin-right', controlsRight);
  gridContainer.style.setProperty('--controls-margin-bottom', controlsBottom);
  gridContainer.style.setProperty('--controls-margin-left', controlsLeft);
}

// Create controls for explore mode
export function createControls(
  data: RuntimeExploreData,
  container: HTMLElement,
  viewManager: ViewManager, // Pass ViewManager to get proper margins
  options?: {
    onUpdate?: () => void;
  }
): void {
  const controlsDiv = createElement('div', {
    className: 'calcplot-controls'
  });

  // Count sliders and set attribute for multi-column layout
  const sliderCount = Object.values(data.params).filter((param) => param.type === 'slider').length;
  if (sliderCount >= 5) {
    controlsDiv.setAttribute('data-sliders-count', sliderCount.toString());
  }

  container.appendChild(controlsDiv);

  // Initialize dynamic margins based on container size
  const updateMargins = () => {
    updateDynamicMargins(container, viewManager);
  };

  // Initial margin update
  updateMargins();

  // Set up ResizeObserver to update margins on container resize
  if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(() => {
      updateMargins();
    });
    resizeObserver.observe(container);
  }

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
        console.warn('createSlider not available');
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
        console.warn('createCheckbox not available');
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
