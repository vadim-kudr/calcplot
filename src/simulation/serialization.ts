/**
 * CalcPlot API Serialization
 * Handles serialization/deserialization of models, params, functions, and timelines
 */

export interface SerializedModel {
  state: Record<string, number>;
  params: Record<string, number>;
  derivatives: Record<string, string>;
  events?: Record<string, string>;
}

export interface SerializedParams {
  [key: string]: {
    type: string;
    min: number;
    max: number;
    default: number;
    label: string;
    step: number;
  };
}

export interface SerializedTimeline {
  times: number[];
  states: Record<string, number[]>;
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

    // If it's an arrow function wrapped in parentheses with block body
    const arrowMatch = trimmed.match(/^\(([^)]+)\)\s*=>\s*\{([\s\S]*)\}$/);
    if (arrowMatch) {
      return arrowMatch[2].trim();
    }

    // If it's a simple arrow function without parentheses with block body
    const simpleArrowBlockMatch = trimmed.match(/^(\w+)\s*=>\s*\{([\s\S]*)\}$/);
    if (simpleArrowBlockMatch) {
      return simpleArrowBlockMatch[2].trim();
    }

    // If it's an arrow function wrapped in parentheses with expression body
    const arrowExprMatch = trimmed.match(/^\(([^)]+)\)\s*=>\s*(.+)$/s);
    if (arrowExprMatch) {
      return `return ${arrowExprMatch[2].trim()}`;
    }

    // If it's a simple arrow function without parentheses and without block
    const simpleArrowMatch = trimmed.match(/^(\w+)\s*=>\s*(.+)$/s);
    if (simpleArrowMatch) {
      return `return ${simpleArrowMatch[2].trim()}`;
    }

    // If it's a regular function, extract the body
    const functionMatch = trimmed.match(/^function\s*\([^)]*\)\s*\{([\s\S]*)\}$/);
    if (functionMatch) {
      return functionMatch[1].trim();
    }

    // Otherwise return as is (might be a simple expression)
    return trimmed;
  }

  /**
   * Create function from parsed string
   */
  static createFunction(params: string[], body: string): (...args: any[]) => any {
    return new Function(...params, body) as (...args: any[]) => any;
  }

  /**
   * Parse and create function in one step
   */
  static parseAndCreateFunction(params: string[], fnStr: string): (...args: any[]) => any {
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
export function serializeEvents(events: Record<string, any>): Record<string, string> {
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

export function serializeModel(model: any): SerializedModel {
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
export function serializeParams(params: Record<string, any>): SerializedParams {
  const serialized: SerializedParams = {};
  for (const [key, control] of Object.entries(params)) {
    serialized[key] = {
      type: control.type || 'slider',
      min: control.min,
      max: control.max,
      default: control.default,
      label: control.label || key,
      step: control.step || 0.01
    };
  }
  return serialized;
}

/**
 * Serialize timeline for HTML embedding
 */
export function serializeTimeline(timeline: any): SerializedTimeline {
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
    params[key] = control.default;
  }
  return params;
}

/**
 * Deserialize events from JSON strings
 */
export function deserializeEvents(
  serialized: Record<string, string>
): Record<string, any> {
  const events: Record<string, any> = {};
  for (const [key, eventStr] of Object.entries(serialized)) {
    try {
      const eventObj = JSON.parse(eventStr);
      if (eventObj.when && eventObj.then) {
        events[key] = {
          when: eval(`(${eventObj.when})`),
          then: eval(`(${eventObj.then})`),
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
export function deserializeFunctions(
  serialized: Record<string, string>
): Record<string, any> {
  const functions: Record<string, any> = {};
  for (const [key, fnStr] of Object.entries(serialized)) {
    try {
      // Handle simple function formats only
      if (fnStr.includes('=>')) {
        // Arrow function - use as is
        functions[key] = eval(`(${fnStr})`);
      } else if (fnStr.startsWith('function')) {
        // Regular function declaration - use as is
        functions[key] = eval(`(${fnStr})`);
      } else {
        // Simple expression - wrap in return statement
        functions[key] = eval(`(state, params) => ${fnStr}`);
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
export function serializeFunctions(obj: Record<string, any>): Record<string, string> {
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
