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
   * Calculate tick values for given bounds (from old AxisRenderer)
   */
  static calculateTicks(xBounds: [number, number], yBounds: [number, number]): {
    xTicks: TickSet;
    yTicks: TickSet;
  } {
    const xRange = xBounds[1] - xBounds[0];
    const yRange = yBounds[1] - yBounds[0];
    
    const xStep = this.calculateNiceStep(xRange, 6);
    const yStep = this.calculateNiceStep(yRange, 5);
    
    const xStart = Math.ceil(xBounds[0] / xStep) * xStep;
    const yStart = Math.ceil(yBounds[0] / yStep) * yStep;
    
    const xValues: number[] = [];
    const yValues: number[] = [];
    
    for (let x = xStart; x <= xBounds[1]; x += xStep) {
      xValues.push(x);
    }
    
    for (let y = yStart; y <= yBounds[1]; y += yStep) {
      yValues.push(y);
    }
    
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

}
