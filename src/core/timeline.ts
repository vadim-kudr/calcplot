/**
 * Timeline class for storing and accessing simulation results
 */

import { State, Timeline as TimelineInterface } from './types';

export class Timeline implements TimelineInterface {
  public readonly times: number[];
  public readonly states: Record<string, number[]>;

  constructor(times: number[], states: Record<string, number[]>) {
    this.times = times;
    this.states = states;
  }

  /**
   * Linear interpolation of state at given time
   */
  at(time: number): State {
    if (this.times.length === 0) {
      throw new Error('Timeline is empty');
    }

    // Handle edge cases
    if (time <= this.times[0]) {
      const result: State = {};
      for (const key in this.states) {
        result[key] = this.states[key][0];
      }
      return result;
    }

    if (time >= this.times[this.times.length - 1]) {
      const result: State = {};
      for (const key in this.states) {
        result[key] = this.states[key][this.states[key].length - 1];
      }
      return result;
    }

    // Find interval for interpolation
    let i = 0;
    while (i < this.times.length - 1 && this.times[i + 1] < time) {
      i++;
    }

    const t0 = this.times[i];
    const t1 = this.times[i + 1];
    const alpha = (time - t0) / (t1 - t0);

    // Interpolate each state variable
    const result: State = {};
    for (const key in this.states) {
      const v0 = this.states[key][i];
      const v1 = this.states[key][i + 1];
      result[key] = v0 + alpha * (v1 - v0);
    }

    return result;
  }

  /**
   * Serialize timeline for HTML embedding
   */
  serialize(): string {
    return JSON.stringify({
      times: this.times,
      states: this.states
    });
  }

  /**
   * Get duration of simulation
   */
  get duration(): number {
    return this.times.length > 0 ? this.times[this.times.length - 1] : 0;
  }

  /**
   * Get number of time steps
   */
  get steps(): number {
    return this.times.length;
  }
}
