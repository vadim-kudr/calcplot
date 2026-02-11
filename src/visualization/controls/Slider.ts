/**
 * Slider component for parameter controls
 */

import { div, input, label, span } from '../../client/utils/html-tag';
import { SliderControl } from '../../lib/controls';

export interface SliderProps {
  id: string;
  control: SliderControl;
  value?: number;
  onChange?: (id: string, value: number) => void;
}

/**
 * Create slider element with event listener
 */
export function createSlider(container: HTMLElement, props: SliderProps): HTMLInputElement {
  const inputId = `input-${props.id}`;
  const valueId = `val-${props.id}`;

  const valueDisplay = span(
    {
      className: 'value-display',
      id: valueId
    },
    typeof props.value === 'number' ? props.value.toFixed(2) : String(props.value || 0)
  );

  // Create range slider
  const inputElement = input({
    type: 'range',
    id: inputId,
    min: String(props.control.min),
    max: String(props.control.max),
    step: String(props.control.step || 0.01),
    value: String(props.value || props.control.default),
    'data-slider-id': props.id
  }) as HTMLInputElement;

  inputElement.addEventListener('input', (e) => {
    const value = parseFloat((e.target as HTMLInputElement).value);

    valueDisplay.textContent = value.toFixed(2);

    if (props.onChange) {
      props.onChange(props.id, value);
    }
  });

  const labelElement = label({ htmlFor: inputId }, props.control.label);

  const labelRow = div(
    { className: 'label-row' },
    labelElement,
    valueDisplay
  );

  const controlGroup = div(
    { className: 'control-group' },
    labelRow,
    inputElement
  );
  container.appendChild(controlGroup);

  return inputElement;
}
