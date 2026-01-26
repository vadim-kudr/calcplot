/**
 * Checkbox component for boolean parameters
 */

import { div, input, label } from '../../utils/html-tag';
import { Control } from '../controls';

export interface CheckboxProps {
  id: string;
  control: Control;
  value?: boolean;
  onChange?: (id: string, value: boolean) => void;
}

/**
 * Create checkbox element with event listener
 */
export function createCheckbox(container: HTMLElement, props: CheckboxProps): HTMLInputElement {
  const inputId = `input-${props.id}`;

  // Create input
  const inputElement = input({
    type: 'checkbox',
    id: inputId,
    checked: props.value || false,
    'data-checkbox-id': props.id
  }) as HTMLInputElement;

  // Add event listener
  inputElement.addEventListener('change', (e) => {
    const checked = (e.target as HTMLInputElement).checked;

    // Call onChange callback
    if (props.onChange) {
      props.onChange(props.id, checked);
    }
  });

  // Create label
  const labelElement = label({ htmlFor: inputId }, props.control.label);

  // Create control group
  const controlGroup = div({ className: 'control-group' }, labelElement, inputElement);
  container.appendChild(controlGroup);

  return inputElement;
}
