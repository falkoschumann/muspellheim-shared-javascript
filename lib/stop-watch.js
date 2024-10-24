import { Clock } from './time.js';

/**
 * A simple stop watch.
 */
export class StopWatch {
  #clock;
  #startTime;
  #stopTime;

  /**
   * Creates a new stop watch.
   *
   * @param {Clock} [clock=Clock.system()] - the clock to use for time measurement
   */
  constructor(clock = Clock.system()) {
    this.#clock = clock;
  }

  /**
   * Starts an unnamed task.
   */
  start() {
    this.#startTime = this.#clock.millis();
  }

  /**
   * Stops the current task.
   */
  stop() {
    this.#stopTime = this.#clock.millis();
  }

  /**
   * Gets the total time in milliseconds.
   *
   * @returns {number} the total time in milliseconds
   */
  getTotalTimeMillis() {
    return this.#stopTime - this.#startTime;
  }

  /**
   * Gets the total time in seconds.
   *
   * @returns {number} the total time in seconds
   */
  getTotalTimeSeconds() {
    return this.getTotalTimeMillis() / 1000;
  }
}
