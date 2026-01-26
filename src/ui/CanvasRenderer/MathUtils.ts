export class MathUtils {
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
    return formatted.replace(/\.0+$/, '');
  }
  
  static interpolateData(
    x: number[], 
    y: number[], 
    numPoints: number = 100
  ): { x: number[]; y: number[] } {
    if (x.length < 2) return { x, y };
    
    const resultX: number[] = [];
    const resultY: number[] = [];
    
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      const idx = t * (x.length - 1);
      const idxFloor = Math.floor(idx);
      const idxCeil = Math.min(idxFloor + 1, x.length - 1);
      const alpha = idx - idxFloor;
      
      resultX.push(x[idxFloor] * (1 - alpha) + x[idxCeil] * alpha);
      resultY.push(y[idxFloor] * (1 - alpha) + y[idxCeil] * alpha);
    }
    
    return { x: resultX, y: resultY };
  }
  
  static getColorByIndex(idx: number): string {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // orange
    ];
    return colors[idx % colors.length];
  }
  
  static formatNumberForDisplay(value: number, step: number): string {
    // Determine number of decimal places based on step
    if (step >= 1) {
      return value.toFixed(0);
    } else if (step >= 0.1) {
      return value.toFixed(1);
    } else if (step >= 0.01) {
      return value.toFixed(2);
    } else if (step >= 0.001) {
      return value.toFixed(3);
    } else {
      return value.toExponential(2);
    }
  }
  
  // Method to protect against too large/small numbers
  static clampToReasonableRange(value: number): number {
    if (Math.abs(value) > 1e9) {
      return Number(value.toExponential(2));
    }
    if (Math.abs(value) < 1e-9 && value !== 0) {
      return Number(value.toExponential(2));
    }
    return value;
  }
}
