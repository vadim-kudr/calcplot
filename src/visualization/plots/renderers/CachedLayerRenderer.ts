/**
 * Base Layer Renderer - provides common functionality for all layer renderers
 */

import { RenderContext } from '../interfaces';
import { State, Params } from '../../../core/types';
import { FunctionSerializer } from '../../../simulation/serialization';
import { BaseLayer } from '../interfaces/BaseLayer';
import { SelectorResult } from '../../../lib/builders/BuilderInterfaces';

// Common function types to avoid duplication
type StateFunction<T> = (state: State) => T;
type StateParamsFunction<T> = (state: State, params?: Params) => T;
type ContextStateFunction<T> = (ctx: any, state: State) => T;
type VectorFunction = (state: State, params?: Params) => { dx: number; dy: number };

export interface CachedLayer<TType, TOptions> extends BaseLayer<TType, TOptions> {
  selector?: string;
  _functionParams?: Record<string, string[]>;
  _cachedFunctions?: Record<string, Function>;
}

export abstract class CachedLayerRenderer<TLayer extends CachedLayer<string, unknown>> {
  /**
   * Cache function parameters for a layer
   */
  protected cacheFunctionParams(layer: TLayer, functionName: string, params: string[]): void {
    if (!layer._functionParams) {
      layer._functionParams = {};
    }
    layer._functionParams[functionName] = params;
  }

  /**
   * Cache a function for a layer
   */
  protected cacheFunction(layer: TLayer, functionName: string, func: Function): void {
    if (!layer._cachedFunctions) {
      layer._cachedFunctions = {};
    }
    layer._cachedFunctions[functionName] = func;
  }

  /**
   * Get selector function from layer (shortcut for most common use case)
   */
  protected getSelectorFunction(layer: TLayer): StateParamsFunction<SelectorResult> | undefined {
    return this.createAndCacheSelector(layer, layer.selector);
  }

  /**
   * Get predicate function from layer (shortcut for predicate functions)
   */
  protected getPredicateFunction(
    layer: TLayer,
    selector: string | undefined
  ): StateFunction<boolean> | undefined {
    if (!selector) return undefined;

    return this.getSelector(layer, 'predicate', selector, (sel) =>
      this.createPredicateFunction(sel)
    );
  }

  /**
   * Get section function from layer (shortcut for section functions)
   */
  protected getSectionFunction(
    layer: TLayer,
    selector: string | undefined
  ): StateFunction<boolean> | undefined {
    if (!selector) return undefined;

    return this.getSelector(layer, 'section', selector, (sel) => this.createSectionFunction(sel));
  }

  /**
   * Get draw function from layer (shortcut for scene draw functions)
   */
  protected getDrawFunction(
    layer: TLayer,
    selector: string | undefined
  ): ContextStateFunction<void> | undefined {
    if (!selector) return undefined;

    return this.getSelector(layer, 'draw', selector, (sel) => this.createDrawFunction(sel));
  }

  /**
   * Get vector function from layer (shortcut for vector functions)
   */
  protected getVectorFunction(
    layer: TLayer & { at?: string; dir?: string },
    functionName: 'at' | 'dir'
  ): VectorFunction | undefined {
    const selector = functionName === 'at' ? layer.at : layer.dir;
    if (!selector) return undefined;

    return this.getSelector(layer, functionName, selector, (sel, params) =>
      this.createVectorFunction(sel)
    );
  }

  /**
   * Create and cache selector function in one call
   */
  protected createAndCacheSelector(
    layer: TLayer,
    selector: string | undefined
  ): StateParamsFunction<SelectorResult> | undefined {
    if (!selector) return undefined;

    return this.getSelector(layer, 'selector', selector, (sel, params) =>
      this.createSelectorFunction(sel, params)
    );
  }

  /**
   * Get cached function or create and cache it
   */
  protected getSelector<TResult = any>(
    layer: TLayer,
    functionName: string,
    selector: string | undefined,
    createFunc: (selector: string, params: string[]) => TResult
  ): TResult | undefined {
    if (!selector) return undefined;

    // Check if already cached
    if (layer._cachedFunctions?.[functionName]) {
      return layer._cachedFunctions[functionName] as TResult;
    }

    // Extract parameters if not cached
    if (!layer._functionParams?.[functionName]) {
      const params = FunctionSerializer.extractParams(selector);
      this.cacheFunctionParams(layer, functionName, params);
    }

    // Create and cache function with parameters
    const params = layer._functionParams?.[functionName] || ['state'];
    const func = createFunc(selector, params);
    this.cacheFunction(layer, functionName, func as Function);
    return func;
  }

  /**
   * Create selector function from serialized selector
   */
  protected createSelectorFunction(
    selector: string,
    params: string[] = []
  ): StateParamsFunction<SelectorResult> {
    const body = FunctionSerializer.parseFunction(selector);
    return new Function(params[0], params[1], body) as StateParamsFunction<SelectorResult>;
  }

  /**
   * Create predicate function from serialized selector
   */
  protected createPredicateFunction(selector: string): StateFunction<boolean> {
    const params = FunctionSerializer.extractParams(selector);
    const body = FunctionSerializer.parseFunction(selector);
    return new Function(params[0], params[1], body) as StateFunction<boolean>;
  }

  /**
   * Create section function from serialized selector
   */
  protected createSectionFunction(selector: string): StateFunction<boolean> {
    const params = FunctionSerializer.extractParams(selector);
    const body = FunctionSerializer.parseFunction(selector);
    return new Function(params[0], params[1], body) as StateFunction<boolean>;
  }

  /**
   * Create draw function from serialized selector
   */
  protected createDrawFunction(selector: string): ContextStateFunction<void> {
    const params = FunctionSerializer.extractParams(selector);
    const body = FunctionSerializer.parseFunction(selector);
    return new Function(params[0], params[1], body) as ContextStateFunction<void>;
  }

  /**
   * Create vector function from serialized selector
   */
  protected createVectorFunction(selector: string): VectorFunction {
    const params = FunctionSerializer.extractParams(selector);
    const body = FunctionSerializer.parseFunction(selector);
    return new Function(params[0], params[1], body) as VectorFunction;
  }

  abstract render(layer: TLayer, context: RenderContext): void;
}
