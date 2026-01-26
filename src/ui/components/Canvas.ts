/**
 * Canvas component for visualization
 */

import { divStr, h } from '../../utils/html-tag';
import { Layer } from '../ViewBuilder';

export interface CanvasProps {
  layers: Layer[];
  width?: number;
  height?: number;
  className?: string;
  canvasId?: string;
  border?: string;
}

export function Canvas({
  layers,
  width = 800,
  height = 400,
  className = '',
  canvasId = 'canvas-0',
  border = '1px solid #ccc'
}: CanvasProps): string {
  return divStr(
    { className: `viewport ${className}`.trim() },
    h('canvas', {
      id: canvasId,
      width: width,
      height: height,
      style: `max-width: ${width}px; height: ${height}px; border: ${border};`
    })
  );
}
