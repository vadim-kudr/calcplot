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

export function slider(
  min: number,
  max: number,
  defaultValue: number,
  label: string,
  step: number = 0.01
): SliderControl {
  return {
    type: 'slider',
    label,
    default: defaultValue,
    min,
    max,
    step
  };
}

export function checkbox(label: string, defaultValue: boolean = false): CheckboxControl {
  return {
    type: 'checkbox',
    label,
    default: defaultValue
  };
}
