/**
 * RenderContext - Contains all rendering state needed by layer renderers
 */

import * as d3 from 'd3';
import { ChartMargins } from '../utils/D3ScaleFactory';

export interface RenderContext {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  width: number;
  height: number;
  margins: ChartMargins;
}
