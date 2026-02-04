/**
 * Time slider component - simple scrubbing without play/reset
 */

import { divStr, inputStr, spanStr } from '../../client/utils/html-tag';

export interface TimeSliderProps {
  currentTime?: number;
  duration?: number;
  onChange?: string;
}

export function TimeSlider({ currentTime = 0, duration = 0, onChange }: TimeSliderProps): string {
  return divStr(
    { className: 'time-slider' },
    spanStr({ className: 'time-label' }, 'Time:'),
    inputStr({
      type: 'range',
      className: 'time-range',
      min: 0,
      max: duration,
      step: duration > 0 ? duration / 1000 : 0.01,
      value: currentTime,
      oninput: onChange
    }),
    spanStr({ className: 'time-display' }, `${currentTime.toFixed(2)}s / ${duration.toFixed(2)}s`)
  );
}
