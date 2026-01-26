/**
 * Slider component for parameter controls
 */

import { div, input, label, span } from '../../utils/html-tag';
import { Control } from '../controls';

export interface SliderProps {
  id: string;
  control: Control;
  value?: number | boolean;
  onChange?: (id: string, value: number | boolean) => void;
}

/**
 * Create slider element with event listener
 */
export function createSlider(container: HTMLElement, props: SliderProps): HTMLInputElement {
  const inputId = `input-${props.id}`;
  const valueId = `val-${props.id}`;

  // Create value display
  const valueDisplay = span(
    {
      className: 'value-display',
      id: valueId
    },
    typeof props.value === 'number' ? props.value.toFixed(2) : String(props.value)
  );

  // Create input
  const inputElement = input({
    type: 'range',
    id: inputId,
    min: String(props.control.min),
    max: String(props.control.max),
    step: String(props.control.step || 0.01),
    value: String(props.value),
    'data-slider-id': props.id
  }) as HTMLInputElement;

  // Add event listener
  inputElement.addEventListener('input', (e) => {
    const value = parseFloat((e.target as HTMLInputElement).value);

    // Update value display
    valueDisplay.textContent = value.toFixed(2);

    // Call onChange callback
    if (props.onChange) {
      props.onChange(props.id, value);
    }
  });

  // Create label
  const labelElement = label({ htmlFor: inputId }, props.control.label);

  // Create control group
  const controlGroup = div(
    { className: 'control-group' },
    labelElement,
    inputElement,
    valueDisplay
  );
  container.appendChild(controlGroup);

  return inputElement;
}
