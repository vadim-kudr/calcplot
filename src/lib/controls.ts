/**
 * Control types and utilities for UI components
 */

export interface SliderControl {
  type: 'slider';
  label: string;
  default: number;
  min: number;
  max: number;
  step?: number;
  scale?: 'linear' | 'log';
}

export interface CheckboxControl {
  type: 'checkbox';
  label: string;
  default: boolean;
}

export type Control = SliderControl | CheckboxControl;

/**
 * Creates a slider control for interactive parameter adjustment.
 * 
 * Sliders allow real-time parameter manipulation in explore() visualizations.
 * They can be linear or logarithmic scale and support custom step sizes.
 * 
 * @param min - Minimum slider value
 * @param max - Maximum slider value
 * @param defaultValue - Initial slider value
 * @param label - Display label for the slider
 * @param step - Step size for slider increments (default: 0.01)
 * @param options - Additional slider options
 * @param options.scale - Scale type: 'linear' or 'log' (default: 'linear')
 * 
 * @returns Slider control configuration object
 * 
 * @example
 * ```javascript
 * // Basic frequency slider
 * slider(0.1, 5, 1, 'Frequency');
 * 
 * // Fine-grained damping control
 * slider(0, 1, 0.1, 'Damping', 0.001);
 * 
 * // Logarithmic scale for wide ranges
 * slider(0.001, 1000, 1, 'Gain', 0.1, { scale: 'log' });
 * ```
 */
export function slider(
  min: number,
  max: number,
  defaultValue: number,
  label: string,
  step: number = 0.01,
  options: { scale?: 'linear' | 'log' } = {}
): SliderControl {
  return {
    type: 'slider',
    label,
    default: defaultValue,
    min,
    max,
    step,
    scale: options.scale || 'linear'
  };
}

/**
 * Creates a checkbox control for boolean parameter toggling.
 * 
 * Checkboxes are perfect for enabling/disabling features or switching
 * between different modes in explore() visualizations.
 * 
 * @param label - Display label for the checkbox
 * @param defaultValue - Initial checked state (default: false)
 * 
 * @returns Checkbox control configuration object
 * 
 * @example
 * ```javascript
 * // Toggle damping on/off
 * checkbox('Enable Damping', false);
 * 
 * // Show/hide vector field
 * checkbox('Show Vector Field', true);
 * 
 * // Switch between integration methods
 * checkbox('Use RK4', true);
 * ```
 */
export function checkbox(label: string, defaultValue: boolean = false): CheckboxControl {
  return {
    type: 'checkbox',
    label,
    default: defaultValue
  };
}
