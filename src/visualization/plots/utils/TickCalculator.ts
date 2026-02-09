/**
 * TickCalculator - Centralized tick calculation for axes and grid
 */


export interface TickSet {
  values: number[];
  labels: string[];
  step: number;
}

export class TickCalculator {
  /**
   * Calculate nice tick values using MathUtils algorithm (from old version)
   */
  static calculateNiceStep(range: number, targetSteps: number): number {
    if (range <= 0) return 1;
    
    const roughStep = range / targetSteps;
    const exponent = Math.floor(Math.log10(roughStep));
    const fraction = roughStep / Math.pow(10, exponent);
    
    let niceFraction: number;
    if (fraction <= 1.5) niceFraction = 1;
    else if (fraction <= 3) niceFraction = 2;
    else if (fraction <= 7) niceFraction = 5;
    else niceFraction = 10;
    
    return niceFraction * Math.pow(10, exponent);
  }

  /**
   * Format tick label based on step size
   */
  static formatTickLabel(value: number, step: number): string {
    if (step >= 1000 || (step < 0.01 && step > 0)) {
      return value.toExponential(1);
    }
    
    let decimals = 0;
    if (step < 1) {
      decimals = Math.ceil(-Math.log10(step));
    }
    
    const formatted = value.toFixed(decimals);
    // Remove trailing .0 but keep other zeros
    return formatted.replace(/\\.0+$/, '');
  }

  /**
   * Calculate tick values for given bounds with overlap prevention
   */
  static calculateTicks(xBounds: [number, number], yBounds: [number, number]): {
    xTicks: TickSet;
    yTicks: TickSet;
  } {
    // Handle invalid bounds
    const xRange = Math.abs(xBounds[1] - xBounds[0]);
    const yRange = Math.abs(yBounds[1] - yBounds[0]);
    
    // Calculate initial steps
    let xStep = this.calculateNiceStep(xRange, 6);
    let yStep = this.calculateNiceStep(yRange, 5);
    
    // For very narrow ranges, use larger steps to prevent overlap
    if (xRange < 0.01) {
      xStep = Math.max(xStep, xRange * 0.5); // At least 50% of range
    }
    if (yRange < 0.01) {
      yStep = Math.max(yStep, yRange * 0.5); // At least 50% of range
    }
    
    // Generate tick values
    const xValues = this.generateTickValues(xBounds, xStep);
    const yValues = this.generateTickValues(yBounds, yStep);
    
    return {
      xTicks: {
        values: xValues,
        labels: xValues.map(tick => this.formatTickLabel(tick, xStep)),
        step: xStep
      },
      yTicks: {
        values: yValues,
        labels: yValues.map(tick => this.formatTickLabel(tick, yStep)),
        step: yStep
      }
    };
  }

  /**
   * Generate tick values with overlap prevention
   */
  private static generateTickValues(bounds: [number, number], step: number): number[] {
    const [min, max] = bounds;
    const range = max - min;
    
    // Handle edge cases
    if (range <= 0 || step <= 0) {
      return [min];
    }
    
    // For very narrow ranges, limit to just 2-3 ticks
    let maxTicks = 10;
    if (range < 0.1) maxTicks = 3;
    if (range < 0.01) maxTicks = 2;
    
    const start = Math.ceil(min / step) * step;
    const values: number[] = [];
    
    // Generate ticks with limit
    for (let value = start; value <= max && values.length < maxTicks; value += step) {
      values.push(value);
    }
    
    // Ensure we have at least start and end ticks for very narrow ranges
    if (values.length === 1 && range > 0) {
      values.push(max);
    }
    
    return values;
  }
}
