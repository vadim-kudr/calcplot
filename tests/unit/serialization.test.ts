/**
 * Unit tests for runtime/serialization.ts
 * Documentation-style tests for function parsing and model serialization
 */

import { describe, test, expect, vi } from 'vitest';
import {
  FunctionSerializer,
  serializeModel,
  serializeParams,
  serializeTimeline,
  deserializeParams,
  deserializeFunctions,
  deserializeEvents,
  serializeEvents
} from '../../src/simulation/serialization';

describe('FunctionSerializer - Parsing Different Function Formats', () => {
  test.each([
    {
      name: 'arrow function with block body',
      input: '(state) => { return state.x; }',
      expected: 'return state.x;'
    },
    {
      name: 'simple arrow function with block body',
      input: 's => { return s.vx * 2; }',
      expected: 'return s.vx * 2;'
    },
    {
      name: 'arrow function with expression body',
      input: '(state) => state.y',
      expected: 'return state.y'
    },
    {
      name: 'simple arrow function with expression',
      input: 'x => x * 2',
      expected: 'return x * 2'
    },
    {
      name: 'regular function declaration',
      input: 'function(state, params) { return params.k * state.x; }',
      expected: 'return params.k * state.x;'
    }
  ])('parses $name', ({ input, expected }) => {
    // When: parsing
    const result = FunctionSerializer.parseFunction(input);

    // Then: should extract body
    expect(result).toBe(expected);
  });

  test.each([
    {
      name: 'function with extra spaces',
      input: '  ( state )  =>  {  return  state.x  ;  }  ',
      expected: 'return  state.x  ;'
    },
    {
      name: 'function with newlines',
      input: `(state) => {
        return state.x;
      }`,
      expected: 'return state.x;'
    },
    {
      name: 'compact arrow with spaces',
      input: '  x => x * 2  ',
      expected: 'return x * 2'
    },
    {
      name: 'regular function with formatting',
      input: 'function ( state ) { return state.x; }',
      expected: 'return state.x;'
    }
  ])('handles whitespace and formatting in $name', ({ input, expected }) => {
    // When: parsing
    const result = FunctionSerializer.parseFunction(input);

    // Then: should handle whitespace correctly
    expect(result).toBe(expected);
  });

  test('handles complex function with multiple statements', () => {
    // Given: multi-line function
    const fnStr = `(state) => {
      const temp = state.x * state.y;
      return Math.sqrt(temp);
    }`;

    // When: parsing
    const result = FunctionSerializer.parseFunction(fnStr);

    // Then: should preserve all statements
    expect(result).toContain('const temp = state.x * state.y;');
    expect(result).toContain('return Math.sqrt(temp);');
  });

  test('createFunction from parsed body', () => {
    // Given: parsed function body and parameters
    const params = ['state', 'params'];
    const body = 'return params.k * state.x;';

    // When: creating function
    const fn = FunctionSerializer.createFunction(params, body);

    // Then: should create working function
    expect(typeof fn).toBe('function');
    expect(fn({ x: 2.0 }, { k: 3.0 })).toBe(6.0);
  });

  test('parseAndCreateFunction in one step', () => {
    // Given: function string
    const fnStr = '(a, b) => a + b';

    // When: parsing and creating
    const fn = FunctionSerializer.parseAndCreateFunction(['a', 'b'], fnStr);

    // Then: should create working function
    expect(fn(2, 3)).toBe(5);
  });
});

describe('FunctionSerializer - Parameter Auto-Detection', () => {
  test('detects functions with parameters', () => {
    // Given: function that uses parameters
    const selectorWithParams = '(s, p) => s.x * p.amplitude';
    
    // When: creating with params
    const fnWithParams = FunctionSerializer.parseAndCreateFunction(['s', 'p'], selectorWithParams);
    
    // Then: should work with parameters
    expect(fnWithParams({ x: 2 }, { amplitude: 3 })).toBe(6);
  });

  test('detects functions without parameters', () => {
    // Given: function that doesn't use parameters
    const selectorWithoutParams = '(s) => s.x * 2';
    
    // When: creating without params
    const fnWithoutParams = FunctionSerializer.parseAndCreateFunction(['s'], selectorWithoutParams);
    
    // Then: should work without parameters
    expect(fnWithoutParams({ x: 2 })).toBe(4);
  });

  test('handles fallback from params to no-params', () => {
    // Given: function defined without params
    const selector = '(s) => s.x';
    
    // When: trying to create with params (creates function but p will be undefined)
    const fnWithParams = FunctionSerializer.parseAndCreateFunction(['s', 'p'], selector);
    
    // Then: should work but ignore extra parameter
    expect(fnWithParams({ x: 5 }, { amplitude: 3 })).toBe(5); // p is undefined/ignored
    
    // When: creating correctly without params
    const fn = FunctionSerializer.parseAndCreateFunction(['s'], selector);
    
    // Then: should work without params
    expect(fn({ x: 5 })).toBe(5);
  });

  test('handles parametric plot detection with params', () => {
    // Given: parametric function with params
    const parametricSelector = '(s, p) => [s.x * p.scale, s.y * p.scale]';
    
    // When: creating and testing
    const fn = FunctionSerializer.parseAndCreateFunction(['s', 'p'], parametricSelector);
    const result = fn({ x: 1, y: 2 }, { scale: 3 });
    
    // Then: should return array for parametric plot
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([3, 6]);
  });
});

describe('Model Serialization', () => {
  test('serializes complete model with events', () => {
    // Given: mathematical model with boundary conditions
    const model = {
      state: { x: 1.0, v: 0.0 },
      params: { k: 2.0, damping: 0.1 },
      derivatives: {
        x: (state: any) => state.v,
        v: (state: any, params: any) => -params.k * state.x - params.damping * state.v
      },
      events: {
        boundary: {
          when: (state: any) => Math.abs(state.x) - 5,
          then: (state: any) => ({ ...state, v: -state.v * 0.8 })
        }
      }
    };

    // When: serializing
    const serialized = serializeModel(model);

    // Then: functions become strings, data preserved
    expect(serialized.state).toEqual({ x: 1.0, v: 0.0 });
    expect(serialized.params).toEqual({ k: 2.0, damping: 0.1 });
    expect(typeof serialized.derivatives.x).toBe('string');
    expect(typeof serialized.derivatives.v).toBe('string');
    expect(serialized.events).toBeDefined();
    expect(typeof serialized.events!.boundary).toBe('string');
  });

  test('serializes simple model without events', () => {
    // Given: exponential growth model
    const model = {
      state: { y: 1.0 },
      params: { rate: 0.1 },
      derivatives: {
        y: (state: any, params: any) => params.rate * state.y
      }
    };

    // When: serializing
    const serialized = serializeModel(model);

    // Then: should work without events
    expect(serialized.state).toEqual({ y: 1.0 });
    expect(serialized.params).toEqual({ rate: 0.1 });
    expect(serialized.derivatives).toBeDefined();
    expect(serialized.events).toBeUndefined();
  });

  test('serializes slider parameters', () => {
    // Given: UI controls for simulation
    const params = {
      k: { type: 'slider', min: 0.1, max: 5.0, default: 1.0, label: 'Spring Constant', step: 0.1 },
      damping: { min: 0, max: 1, default: 0.1, step: 0.01 }
    };

    // When: serializing
    const serialized = serializeParams(params);

    // Then: should preserve all control properties
    expect(serialized.k.type).toBe('slider');
    expect(serialized.k.min).toBe(0.1);
    expect(serialized.k.max).toBe(5.0);
    expect(serialized.k.default).toBe(1.0);
    expect(serialized.k.label).toBe('Spring Constant');
    expect(serialized.k.step).toBe(0.1);
  });

  test('serializes timeline data', () => {
    // Given: simulation results
    const timeline = {
      times: [0, 0.1, 0.2, 0.3],
      states: {
        x: [0, 1, 2, 3],
        y: [0, 1, 4, 9],
        v: [1, 1, 1, 1]
      },
      at: vi.fn(),
      serialize: vi.fn()
    } as any;

    // When: serializing
    const serialized = serializeTimeline(timeline);

    // Then: should preserve data structure
    expect(serialized.times).toEqual([0, 0.1, 0.2, 0.3]);
    expect(serialized.states.x).toEqual([0, 1, 2, 3]);
    expect(serialized.states.y).toEqual([0, 1, 4, 9]);
    expect(serialized.states.v).toEqual([1, 1, 1, 1]);
  });
});

describe('Deserialization', () => {
  test('deserializes parameters to default values', () => {
    // Given: serialized parameters
    const serialized = {
      k: { type: 'slider', min: 0.1, max: 5.0, default: 2.0, label: 'Constant', step: 0.1 },
      damping: { type: 'slider', min: 0, max: 1, default: 0.2, label: 'Damping', step: 0.01 }
    };

    // When: deserializing
    const params = deserializeParams(serialized);

    // Then: should extract default values
    expect(params).toEqual({ k: 2.0, damping: 0.2 });
  });

  test('deserializes functions from strings', () => {
    // Given: serialized functions in different formats
    const testCases = [
      {
        name: 'arrow function',
        input: '(state) => state.vx',
        testState: { vx: 5 },
        expected: 5
      },
      {
        name: 'arrow function with params',
        input: '(state, params) => -params.k * state.x',
        testState: { x: 2 },
        testParams: { k: 3 },
        expected: -6
      },
      {
        name: 'regular function declaration',
        input: 'function(state) { return 0.5 * state.v * state.v; }',
        testState: { v: 4 },
        expected: 8
      }
    ];

    testCases.forEach(({ name, input, testState, testParams, expected }) => {
      // When: deserializing
      const functions = deserializeFunctions({ [name]: input });

      // Then: should create working function
      expect(typeof functions[name]).toBe('function');

      if (testParams) {
        expect(functions[name](testState, testParams)).toBe(expected);
      } else {
        expect(functions[name](testState)).toBe(expected);
      }
    });
  });

  test('handles deserialization errors gracefully', () => {
    // Given: malformed function string
    const serialized = {
      broken: 'invalid function syntax',
      working: '(x) => x * 2'
    };

    // When: deserializing
    const functions = deserializeFunctions(serialized);

    // Then: should provide fallback for broken function
    expect(typeof functions.broken).toBe('function');
    expect(functions.broken()).toBe(0); // fallback
    expect(functions.working(5)).toBe(10); // working function
  });
});

describe('Real-world Serialization Examples', () => {
  test('oscillator model roundtrip', () => {
    // Given: harmonic oscillator
    const model = {
      state: { x: 1.0, v: 0.0 },
      params: { omega: 1.0, damping: 0.1 },
      derivatives: {
        x: (state: any) => state.v,
        v: (state: any, params: any) =>
          -params.omega * params.omega * state.x - params.damping * state.v
      }
    };

    // When: serialize and deserialize
    const serialized = serializeModel(model);
    const functions = deserializeFunctions(serialized.derivatives);

    // Then: should preserve functionality
    expect(functions.x({ v: 2 })).toBe(2);
    expect(functions.v({ x: 1, v: 0 }, { omega: 2, damping: 0.1 })).toBeCloseTo(-4.0, 1);
  });

  test('parameter controls for UI', () => {
    // Given: interactive controls
    const controls = {
      gravity: {
        type: 'slider',
        min: 0,
        max: 20,
        default: 9.81,
        label: 'Gravity (m/s²)',
        step: 0.1
      },
      mass: { type: 'slider', min: 0.1, max: 10, default: 1.0, label: 'Mass (kg)', step: 0.1 },
      airResistance: {
        type: 'checkbox',
        min: 0,
        max: 1,
        default: 0,
        label: 'Air Resistance',
        step: 1
      }
    };

    // When: serializing for HTML
    const serialized = serializeParams(controls);

    // Then: should create proper UI definitions
    expect(serialized.gravity.label).toBe('Gravity (m/s²)');
    expect(serialized.gravity.default).toBe(9.81);
    expect(serialized.airResistance.type).toBe('checkbox');
  });
});

describe('Event Serialization', () => {
  test('should serialize event object with functions', () => {
    // Given: event with when/then functions
    const events = {
      groundHit: {
        when: (s) => s.y,
        then: (s, p) => null,
        once: true
      }
    };

    // When: serializing events
    const serialized = serializeEvents(events);

    // Then: should create JSON string with function strings
    expect(serialized.groundHit).toContain('when');
    expect(serialized.groundHit).toContain('then');
    expect(serialized.groundHit).toContain('once');
    
    const parsed = JSON.parse(serialized.groundHit);
    expect(parsed.when).toBe('(s) => s.y');
    expect(parsed.then).toBe('(s, p) => null');
    expect(parsed.once).toBe(true);
  });

  test('should deserialize event JSON back to functions', () => {
    // Given: serialized event JSON
    const serialized = {
      groundHit: '{"when":"(s)=>s.y","then":"(s, p)=>null","once":true}'
    };

    // When: deserializing with deserializeEvents
    const deserialized = deserializeEvents(serialized);

    // Then: should create working event object
    expect(typeof deserialized.groundHit.when).toBe('function');
    expect(typeof deserialized.groundHit.then).toBe('function');
    expect(deserialized.groundHit.once).toBe(true);
    
    // Test function execution
    const testState = { x: 10, y: -5 };
    expect(deserialized.groundHit.when(testState)).toBe(-5);
    expect(deserialized.groundHit.then(testState, { g: 9.81 })).toBe(null);
  });

  test('should handle model with events in serializeModel', () => {
    // Given: model with events
    const model = {
      state: { x: 0, y: 0 },
      params: { g: 9.81 },
      derivatives: {
        x: (s) => s.vx,
        y: (s) => s.vy
      },
      events: {
        groundHit: {
          when: (s) => s.y,
          then: (s, p) => null,
          once: true
        }
      }
    };

    // When: serializing model
    const serialized = serializeModel(model);

    // Then: should include serialized events
    expect(serialized.events).toBeDefined();
    expect(serialized.events.groundHit).toContain('when');
    
    // Check derivative serialization with exact format
    expect(serialized.derivatives.x).toBe('(s) => s.vx');
    expect(serialized.derivatives.y).toBe('(s) => s.vy');
  });
});
