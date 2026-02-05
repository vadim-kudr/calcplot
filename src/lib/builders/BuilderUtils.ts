/**
 * Shared utilities for CalcPlot builders
 */

import { SelectorFunction } from './BuilderInterfaces';

// Re-export interfaces from BuilderInterfaces
export type { 
  PlotOptions, 
  AxisOptions, 
  GridOptions,
  FillOptions,
  RefLineOptions,
  LegendOptions,
  VectorFieldOptions,
  PoincareOptions,
  NullclineOptions,
  VectorOptions,
  SceneFunction,
  VectorFunction,
  SelectorFunction,
  DrawContext,
  Layer
} from './BuilderInterfaces';

/**
 * Parse plot arguments with flexible signatures
 */
export function parsePlotArgs(
  selector: SelectorFunction,
  arg2?: string | any,
  arg3?: string
): { selector: SelectorFunction; options: any } {
  let options: any = {};
  
  if (arg2 === undefined) {
    // plot(selector) - use defaults
    options = {};
  } else if (typeof arg2 === 'string') {
    if (arg3 !== undefined) {
      // plot(selector, color, label)
      options = { color: arg2, label: arg3 };
    } else {
      // plot(selector, label) - assume it's a label if it looks like text, color if hex
      if (arg2.startsWith('#') || /^#[0-9A-F]{6}$/i.test(arg2)) {
        options = { color: arg2 };
      } else {
        options = { label: arg2 };
      }
    }
  } else {
    // plot(selector, options)
    options = arg2;
  }
  
  return { selector, options };
}

/**
 * Parse axis arguments with flexible signatures
 */
export function parseAxisArgs(
  arg1?: string | number | any,
  arg2?: string,
  arg3?: number
): { options: any } {
  let options: any = {};
  
  if (arg1 === undefined) {
    // axis() - use defaults
    options = {};
  } else if (typeof arg1 === 'number') {
    // axis(aspectRatio)
    options = { aspectRatio: arg1 };
  } else if (typeof arg1 === 'string') {
    if (typeof arg2 === 'string' && typeof arg3 === 'number') {
      // axis(xLabel, yLabel, aspectRatio)
      options = { xLabel: arg1, yLabel: arg2, aspectRatio: arg3 };
    } else if (typeof arg2 === 'string') {
      // axis(xLabel, yLabel)
      options = { xLabel: arg1, yLabel: arg2 };
    } else {
      // axis(xLabel) - treat as xLabel only
      options = { xLabel: arg1 };
    }
  } else {
    // axis(options)
    options = arg1;
  }
  
  return { options };
}
