/**
 * Checkbox component for boolean parameters
 */

import { div, input, label } from '../../client/utils/html-tag';
import { CheckboxControl } from '../../lib/controls';

export interface CheckboxProps {
  id: string;
  control: CheckboxControl;
  value?: boolean;
  onChange?: (id: string, value: boolean) => void;
}

/**
 * Create checkbox element with event listener
 */
export function createCheckbox(container: HTMLElement, props: CheckboxProps): HTMLInputElement {
  const inputId = `input-${props.id}`;

  const inputElement = input({
    type: 'checkbox',
    id: inputId,
    checked: props.value !== undefined ? props.value : props.control.default,
    'data-checkbox-id': props.id
  }) as HTMLInputElement;

  inputElement.addEventListener('change', (e) => {
    const checked = (e.target as HTMLInputElement).checked;

    if (props.onChange) {
      props.onChange(props.id, checked);
    }
  });

  const labelElement = label({ htmlFor: inputId }, props.control.label);

  const controlGroup = div({ className: 'control-group' }, labelElement, inputElement);
  container.appendChild(controlGroup);

  return inputElement;
}
