/**
 * Control types and utilities for UI components
 */

export interface Control {
  type: 'slider' | 'checkbox';
  label: string;
  default: number | boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function slider(
  min: number,
  max: number,
  defaultValue: number,
  label: string,
  step: number = 0.01
): Control {
  return {
    type: 'slider',
    label,
    default: defaultValue,
    min,
    max,
    step
  };
}

export function checkbox(label: string, defaultValue: boolean = false): Control {
  return {
    type: 'checkbox',
    label,
    default: defaultValue
  };
}
