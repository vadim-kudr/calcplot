/**
 * Unit tests for runtime/serialization.ts
 * Comprehensive tests for function parsing and model serialization
 */

import { describe, test, expect } from 'vitest';
import { 
  FunctionSerializer,
  serializeModel,
  serializeParams,
  serializeTimeline,
  deserializeParams,
  deserializeEvents,
  deserializeFunctions,
  serializeFunctions,
  serializeEvents
} from '../../src/simulation/serialization';

describe('FunctionSerializer', () => {
  describe('parseFunction - Arrow functions', () => {
    test.each([
      // [input, expected, description]
      ['(state) => { return state.x; }', 'return state.x;', 'arrow with block body'],
      ['(state) => state.y', 'return state.y', 'arrow with expression body'],
      ['x => x * 2', 'return x * 2', 'simple arrow without parens'],
      ['x => { return x * 2; }', 'return x * 2;', 'simple arrow with block'],
      ['(a, b) => a + b', 'return a + b', 'arrow with multiple params'],
      ['(s) => { const x = s.x; return x * 2; }', 'const x = s.x; return x * 2;', 'arrow with multi-line body'],
      ['() => 42', 'return 42', 'arrow with no params'],
      ['(state) => { return state.x + state.y; }', 'return state.x + state.y;', 'arrow with complex expression'],
    ])('%s -> %s (%s)', (input, expected) => {
      const result = FunctionSerializer.parseFunction(input);
      expect(result).toBe(expected);
    });
  });

  describe('parseFunction - Regular functions', () => {
    test.each([
      ['function(state, params) { return params.k * state.x; }', 'return params.k * state.x;', 'regular function'],
      ['function() { return 42; }', 'return 42;', 'function with no params'],
      ['function(x) { const y = x * 2; return y; }', 'const y = x * 2; return y;', 'function with multi-line'],
    ])('%s -> %s (%s)', (input, expected) => {
      const result = FunctionSerializer.parseFunction(input);
      expect(result).toBe(expected);
    });
  });

  describe('parseFunction - Edge cases', () => {
    test('handles invalid function input', () => {
      const result = FunctionSerializer.parseFunction('not a function');
      expect(result).toBe('not a function');
    });

    test('handles empty arrow function', () => {
      const result = FunctionSerializer.parseFunction('() => {}');
      expect(result).toBe('');
    });

    test('handles function with newlines and spacing', () => {
      const input = `(state) => {
        const x = state.x;
        return x * 2;
      }`;
      const result = FunctionSerializer.parseFunction(input);
      expect(result).toContain('const x = state.x;');
      expect(result).toContain('return x * 2;');
    });

    test('handles function with complex object return', () => {
      const input = '(s) => { return { x: s.x, y: s.y }; }';
      const result = FunctionSerializer.parseFunction(input);
      expect(result).toBe('return { x: s.x, y: s.y };');
    });

    test('handles whitespace-only input', () => {
      const result = FunctionSerializer.parseFunction('   ');
      expect(result).toBe('');
    });
  });

  describe('parseAndCreateFunction', () => {
    test('creates executable function from arrow expression', () => {
      const fn = FunctionSerializer.parseAndCreateFunction(['state'], '(state) => state.x * 2');
      expect(fn({ x: 5 })).toBe(10);
    });

    test('creates executable function from arrow block', () => {
      const fn = FunctionSerializer.parseAndCreateFunction(
        ['state'], 
        '(state) => { return state.x * 2; }'
      );
      expect(fn({ x: 5 })).toBe(10);
    });

    test('creates function with multiple parameters', () => {
      const fn = FunctionSerializer.parseAndCreateFunction(
        ['a', 'b'], 
        '(a, b) => a + b'
      );
      expect(fn(3, 4)).toBe(7);
    });

    test('creates function with complex logic', () => {
      const fn = FunctionSerializer.parseAndCreateFunction(
        ['state', 'params'],
        '(state, params) => { const k = params.k; return state.x * k; }'
      );
      expect(fn({ x: 5 }, { k: 2 })).toBe(10);
    });

    test('handles function with no return value', () => {
      const fn = FunctionSerializer.parseAndCreateFunction(
        ['x'],
        '(x) => { x * 2; }' // no return statement
      );
      expect(fn(5)).toBeUndefined();
    });
  });
});

describe('Model Serialization', () => {
  test('serializes model with derivatives', () => {
    const model = {
      state: { x: 0, y: 1 },
      params: { k: 2 },
      derivatives: {
        x: (s: any) => s.y,
        y: (s: any) => -s.x
      }
    };

    const serialized = serializeModel(model);

    expect(serialized.state).toEqual({ x: 0, y: 1 });
    expect(serialized.params).toEqual({ k: 2 });
    expect(serialized.derivatives.x).toContain('s.y');
    expect(serialized.derivatives.y).toContain('-s.x');
  });

  test('serializes model with events', () => {
    const model = {
      state: { x: 0 },
      params: {},
      derivatives: { x: (s: any) => 1 },
      events: {
        stop: {
          when: (s: any) => s.x > 10,
          then: (s: any) => ({ ...s, x: 0 }),
          once: true
        }
      }
    };

    const serialized = serializeModel(model);

    expect(serialized.events).toBeDefined();
    expect(serialized.events!.stop).toBeDefined();
    
    const eventObj = JSON.parse(serialized.events!.stop);
    expect(eventObj.once).toBe(true);
    expect(eventObj.when).toContain('s.x > 10');
  });

  test('handles model without events', () => {
    const model = {
      state: { x: 0 },
      params: {},
      derivatives: { x: (s: any) => 1 }
    };

    const serialized = serializeModel(model);
    expect(serialized.events).toBeUndefined();
  });
});

describe('Parameters Serialization', () => {
  test('serializes slider controls', () => {
    const params = {
      speed: {
        type: 'slider' as const,
        min: 0,
        max: 10,
        default: 5,
        step: 0.1,
        label: 'Speed'
      }
    };

    const serialized = serializeParams(params);

    expect(serialized.speed).toEqual({
      type: 'slider',
      min: 0,
      max: 10,
      default: 5,
      step: 0.1,
      label: 'Speed',
      scale: undefined
    });
  });

  test('serializes checkbox controls', () => {
    const params = {
      enabled: {
        type: 'checkbox' as const,
        default: true,
        label: 'Enabled'
      }
    };

    const serialized = serializeParams(params);

    expect(serialized.enabled).toEqual({
      type: 'checkbox',
      default: true,
      label: 'Enabled'
    });
  });

  test('handles empty params', () => {
    const serialized = serializeParams(undefined);
    expect(serialized).toEqual({});
  });

  test('uses key as label fallback', () => {
    const params = {
      speed: {
        type: 'slider' as const,
        min: 0,
        max: 10,
        default: 5
      }
    };

    const serialized = serializeParams(params);
    expect(serialized.speed.label).toBe('speed');
  });

  test('applies default step for sliders', () => {
    const params = {
      speed: {
        type: 'slider' as const,
        min: 0,
        max: 10,
        default: 5
      }
    };

    const serialized = serializeParams(params);
    expect(serialized.speed.step).toBe(0.01);
  });
});

describe('Timeline Serialization', () => {
  test('serializes timeline with multiple states', () => {
    const timeline = {
      times: [0, 1, 2],
      states: {
        x: [0, 1, 2],
        y: [0, 2, 4]
      }
    };

    const serialized = serializeTimeline(timeline);

    expect(serialized.times).toEqual([0, 1, 2]);
    expect(serialized.states).toEqual({
      x: [0, 1, 2],
      y: [0, 2, 4]
    });
  });

  test('handles empty timeline', () => {
    const timeline = {
      times: [],
      states: {}
    };

    const serialized = serializeTimeline(timeline);
    expect(serialized.times).toEqual([]);
    expect(serialized.states).toEqual({});
  });
});

describe('Deserialization', () => {
  describe('deserializeParams', () => {
    test('converts slider defaults to values', () => {
      const serialized = {
        speed: { type: 'slider' as const, min: 0, max: 10, default: 5, label: 'Speed' }
      };

      const params = deserializeParams(serialized);
      expect(params.speed).toBe(5);
    });

    test('converts checkbox defaults to 0/1', () => {
      const serialized = {
        enabled: { type: 'checkbox' as const, default: true, label: 'Enabled' },
        disabled: { type: 'checkbox' as const, default: false, label: 'Disabled' }
      };

      const params = deserializeParams(serialized);
      expect(params.enabled).toBe(1);
      expect(params.disabled).toBe(0);
    });

    test('handles mixed control types', () => {
      const serialized = {
        speed: { type: 'slider' as const, min: 0, max: 10, default: 5, label: 'Speed' },
        enabled: { type: 'checkbox' as const, default: true, label: 'Enabled' }
      };

      const params = deserializeParams(serialized);
      expect(params).toEqual({ speed: 5, enabled: 1 });
    });
  });

  describe('deserializeFunctions', () => {
    test('deserializes arrow function expressions', () => {
      const serialized = {
        dx: '(state, params) => state.vx'
      };

      const functions = deserializeFunctions(serialized);
      expect(functions.dx({ vx: 5 }, {})).toBe(5);
    });

    test('deserializes regular functions', () => {
      const serialized = {
        dx: 'function(state, params) { return state.vx; }'
      };

      const functions = deserializeFunctions(serialized);
      expect(functions.dx({ vx: 5 }, {})).toBe(5);
    });

    test('wraps simple expressions in arrow function', () => {
      const serialized = {
        dx: 'state.vx * 2'
      };

      const functions = deserializeFunctions(serialized);
      expect(functions.dx({ vx: 5 }, {})).toBe(10);
    });

    test('handles invalid function with fallback', () => {
      const serialized = {
        dx: 'this is not valid JS'
      };

      const functions = deserializeFunctions(serialized);
      expect(functions.dx()).toBe(0); // fallback function
    });
  });

  describe('deserializeEvents', () => {
    test('deserializes event with when/then', () => {
      const serialized = {
        stop: JSON.stringify({
          when: '(s) => s.x > 10',
          then: '(s) => ({ ...s, x: 0 })',
          once: true
        })
      };

      const events = deserializeEvents(serialized);
      
      expect(events.stop.when({ x: 15 })).toBe(true);
      expect(events.stop.when({ x: 5 })).toBe(false);
      expect(events.stop.then({ x: 15 })).toEqual({ x: 0 });
      expect(events.stop.once).toBe(true);
    });

    test('defaults once to false', () => {
      const serialized = {
        reset: JSON.stringify({
          when: '(s) => s.x > 10',
          then: '(s) => ({ x: 0 })'
        })
      };

      const events = deserializeEvents(serialized);
      expect(events.reset.once).toBe(false);
    });

    test('handles invalid JSON gracefully', () => {
      const serialized = {
        bad: 'not valid json'
      };

      const events = deserializeEvents(serialized);
      expect(events.bad).toBeUndefined();
    });
  });
});

describe('serializeFunctions', () => {
  test('converts functions to strings', () => {
    const obj = {
      dx: (s: any) => s.vx,
      dy: function(s: any) { return s.vy; }
    };

    const serialized = serializeFunctions(obj);

    expect(serialized.dx).toContain('s.vx');
    expect(serialized.dy).toContain('s.vy');
  });

  test('converts non-function values to strings', () => {
    const obj = {
      value: 42,
      name: 'test'
    };

    const serialized = serializeFunctions(obj);

    expect(serialized.value).toBe('42');
    expect(serialized.name).toBe('test');
  });

  test('skips undefined and null values', () => {
    const obj = {
      valid: (x: number) => x,
      invalid: undefined,
      nul: null
    };

    const serialized = serializeFunctions(obj);

    expect(serialized.valid).toBeDefined();
    expect(serialized.invalid).toBeUndefined();
    expect(serialized.nul).toBeUndefined();
  });
});

describe('serializeEvents', () => {
  test('serializes valid events', () => {
    const events = {
      stop: {
        when: (s: any) => s.x > 10,
        then: (s: any) => ({ ...s, x: 0 }),
        once: true
      }
    };

    const serialized = serializeEvents(events);
    const parsed = JSON.parse(serialized.stop);

    expect(parsed.when).toContain('s.x > 10');
    expect(parsed.then).toContain('s, x: 0');
    expect(parsed.once).toBe(true);
  });

  test('handles invalid events with warning', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const events = {
      invalid: {
        when: 'not a function',
        then: (s: any) => s
      }
    };

    const serialized = serializeEvents(events);
    
    expect(serialized.invalid).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid event invalid')
    );
    
    consoleSpy.mockRestore();
  });
});