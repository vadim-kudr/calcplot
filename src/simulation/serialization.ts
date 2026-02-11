/**
 * CalcPlot API Serialization
 * Handles serialization/deserialization of models, params, functions, and timelines
 */

import { SerializedParams } from '../lib/types';
import { Control } from '../lib/controls';
import { State, Params, Derivatives, Events, Model, Timeline } from '../core/types';

export interface SerializedModel {
  state: Record<string, number>;
  params: Record<string, number>;
  derivatives: Record<string, string>;
  events?: Record<string, string>;
}

export interface SerializedTimeline {
  times: number[];
  states: Record<string, number[]>;
}

export interface SerializedFunction {
  body: string;           // "return s.vx"
  params: string[];       // ["s"] or ["state", "params"]
}

/**
 * Function serialization utilities
 */
export class FunctionSerializer {
  /**
   * Parse function string and extract the body
   * Handles various formats:
   * - "(p)=>{ return p.x; }" → "return p.x;"
   * - "(s)=>s.vx" → "return s.vx"
   * - "s=>s.vx" → "return s.vx"
   * - "function(p){ return p.x; }" → "return p.x;"
   */
  static parseFunction(fnStr: string): string {
  const trimmed = fnStr.trim();
  
  // Edge cases: not functions
  if (!trimmed || !trimmed.includes('=>') && !trimmed.startsWith('function')) {
    return trimmed;
  }
  
  // Special case: parentheses-wrapped object literal (p) => ({ x: p.x0 })
  const arrowIndex = trimmed.indexOf('=>');
  if (arrowIndex !== -1) {
    const afterArrow = trimmed.substring(arrowIndex + 2).trim();
    if (afterArrow.startsWith('(') && afterArrow.endsWith(')')) {
      const innerContent = afterArrow.slice(1, -1).trim();
      if (innerContent.startsWith('{') && innerContent.endsWith('}')) {
        // It's an object literal in parentheses
        return `return (${innerContent})`;
      }
    }
  }
  
  // Remove function signature
  const bodyStart = trimmed.indexOf('{') !== -1 
    ? trimmed.indexOf('{') + 1 
    : trimmed.indexOf('=>') + 2;
    
  const bodyEnd = trimmed.lastIndexOf('}') !== -1 
    ? trimmed.lastIndexOf('}') 
    : trimmed.length;
    
  let body = trimmed.slice(bodyStart, bodyEnd).trim();
  
  // If it's an expression, add return
  if (!trimmed.includes('{') && !body.startsWith('return')) {
    if (body.startsWith('{') && body.endsWith('}')) {
      // Direct object literal, wrap in parentheses
      body = `return (${body})`;
    } else {
      body = `return ${body}`;
    }
  }
  
  return body;
}

  /**
   * Extract parameter names from function string
   */
  static extractParams(fnStr: string): string[] {
    const trimmed = fnStr.trim();

    // Extract parameter list
    let paramStr = '';
    
    if (trimmed.includes('=>')) {
      // Arrow function: (s, p) => ..., s => ..., (s) => ...
      const arrowIndex = trimmed.indexOf('=>');
      paramStr = trimmed.substring(0, arrowIndex).trim();
      
      // Remove 'function' keyword if present
      if (paramStr.startsWith('function')) {
        paramStr = paramStr.substring(8).trim();
      }
      
      // Extract parameters between parentheses or before =>
      if (paramStr.startsWith('(')) {
        const closingParen = paramStr.indexOf(')');
        if (closingParen !== -1) {
          paramStr = paramStr.substring(1, closingParen);
        }
      }
    } else if (trimmed.startsWith('function')) {
      // Regular function: function(s, p) { ... }
      const parenStart = trimmed.indexOf('(');
      const parenEnd = trimmed.indexOf(')');
      if (parenStart !== -1 && parenEnd !== -1 && parenEnd > parenStart) {
        paramStr = trimmed.substring(parenStart + 1, parenEnd);
      }
    }

    return paramStr
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }

  /**
   * Serialize function with parameter extraction
   */
  static serializeWithParams(fn: (...args: any[]) => any): SerializedFunction {
    const fnStr = fn.toString();
    const body = this.parseFunction(fnStr);
    const params = this.extractParams(fnStr);

    return { body, params };
  }

  /**
   * Serialize function as full string (preserves complete function with parameters)
   */
  static serializeFunction(fn: (...args: any[]) => any): string {
    return fn.toString();
  }

  /**
   * Create function from parsed string
   */
  static createFunction(params: string[], body: string): (...args: unknown[]) => unknown {
    // Create function using Function constructor
    if (params.length === 0) {
      return new Function(body) as (...args: unknown[]) => unknown;
    } else if (params.length === 1) {
      return new Function(params[0], body) as (...args: unknown[]) => unknown;
    } else {
      return new Function(params[0], params[1], body) as (...args: unknown[]) => unknown;
    }
  }

  /**
   * Parse and create function in one step
   */
  static parseAndCreateFunction(params: string[], fnStr: string): (...args: unknown[]) => unknown {
    const parsedBody = this.parseFunction(fnStr);
    return this.createFunction(params, parsedBody);
  }
}

/**
 * Serialize model for HTML embedding
 */
/**
 * Serialize events for HTML embedding
 */
export function serializeEvents(events: Events): Record<string, string> {
  const serialized: Record<string, string> = {};

  for (const [key, event] of Object.entries(events)) {
    if (event && typeof event.when === 'function' && typeof event.then === 'function') {
      serialized[key] = JSON.stringify({
        when: event.when.toString(),
        then: event.then.toString(),
        once: event.once || false
      });
    } else {
      console.warn(`Invalid event ${key}: when and then must be functions`);
    }
  }

  return serialized;
}

export function serializeModel(model: Model): SerializedModel {
  return {
    state: model.state,
    params: model.params,
    derivatives: serializeFunctions(model.derivatives),
    events: model.events ? serializeEvents(model.events) : undefined
  };
}

/**
 * Serialize parameters (sliders) for HTML embedding
 */
export function serializeParams(params?: Record<string, Control>): SerializedParams {
  const serialized: SerializedParams = {};
  if (!params) {
    return serialized;
  }
  for (const [key, control] of Object.entries(params)) {
    if (control.type === 'slider') {
      serialized[key] = {
        type: control.type,
        min: control.min,
        max: control.max,
        default: control.default,
        label: control.label || key,
        step: control.step || 0.01,
        scale: control.scale
      };
    } else {
      serialized[key] = {
        type: control.type,
        default: control.default,
        label: control.label || key
      };
    }
  }
  return serialized;
}

/**
 * Serialize timeline for HTML embedding
 */
export function serializeTimeline(timeline: Timeline): SerializedTimeline {
  return {
    times: timeline.times,
    states: timeline.states
  };
}

/**
 * Deserialize parameters from sliders to values
 */
export function deserializeParams(serializedParams: SerializedParams): Record<string, number> {
  const params: Record<string, number> = {};
  for (const [key, control] of Object.entries(serializedParams)) {
    if (control.type === 'slider') {
      params[key] = control.default;
    } else if (control.type === 'checkbox') {
      params[key] = control.default ? 1 : 0; // Convert boolean to number
    }
  }
  return params;
}

/**
 * Deserialize events from JSON strings
 */
export function deserializeEvents(serialized: Record<string, string>): Events {
  const events: Events = {};
  for (const [key, eventStr] of Object.entries(serialized)) {
    try {
      const eventObj = JSON.parse(eventStr);
      if (eventObj.when && eventObj.then) {
        events[key] = {
          when: new Function('return ' + eventObj.when)(),
          then: new Function('return ' + eventObj.then)(),
          once: eventObj.once || false
        };
      }
    } catch (e) {
      console.error('Error deserializing event', key, e);
    }
  }
  return events;
}

/**
 * Deserialize functions from strings (simple functions only)
 */
export function deserializeFunctions(serialized: Record<string, string>): Derivatives {
  const functions: Derivatives = {};
  for (const [key, fnStr] of Object.entries(serialized)) {
    try {
      // Handle simple function formats only
      if (fnStr.includes('=>')) {
        // Arrow function - use as is
        functions[key] = new Function('return ' + fnStr)();
      } else if (fnStr.startsWith('function')) {
        // Regular function declaration - use as is
        functions[key] = new Function('return ' + fnStr)();
      } else {
        // Simple expression - wrap in return statement
        functions[key] = new Function('state', 'params', 'return ' + fnStr) as (state: State, params: Params) => number;
      }
    } catch (e) {
      console.error('Error deserializing function', key, e);
      // Fallback: simple identity function
      functions[key] = () => 0;
    }
  }
  return functions;
}

/**
 * Helper: serialize object with functions
 */
export function serializeFunctions(
  obj: Record<string, ((state: State, params: Params) => number) | string | number | boolean>
): Record<string, string> {
  const serialized: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'function') {
      serialized[key] = value.toString();
    } else if (value !== undefined && value !== null) {
      serialized[key] = String(value);
    } else {
      console.warn(`Skipping undefined/null value for key: ${key}`);
    }
  }

  return serialized;
}
