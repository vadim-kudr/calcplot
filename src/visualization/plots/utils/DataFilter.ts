/**
 * DataFilter - Handles filtering and validation of plot data
 */

export class DataFilter {
  /**
   * Filter valid data points from x and y value arrays
   */
  static filterValidData(xValues: number[], yValues: number[]): { xValues: number[], yValues: number[] } {
    const validX: number[] = [];
    const validY: number[] = [];
    
    for (let i = 0; i < xValues.length; i++) {
      if (
        xValues[i] !== null && xValues[i] !== undefined && 
        yValues[i] !== null && yValues[i] !== undefined &&
        isFinite(xValues[i]) && isFinite(yValues[i])
      ) {
        validX.push(xValues[i]);
        validY.push(yValues[i]);
      }
    }
    
    return { xValues: validX, yValues: validY };
  }

  /**
   * Filter valid parametric points
   */
  static filterValidPoints(points: any[]): Array<[number, number]> {
    return points.filter(
      (p: any) =>
        Array.isArray(p) && p.length === 2 && typeof p[0] === 'number' && typeof p[1] === 'number' &&
        isFinite(p[0]) && isFinite(p[1])
    );
  }
}
