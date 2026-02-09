// Base layer interface
export interface BaseLayer<TType, TOptions = {}> {
  type: TType;
  index?: number;
  options?: TOptions;
}