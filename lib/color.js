// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

const FACTOR = 0.7;

/**
 * The Color class represents a color in the RGB color space.
 */
export class Color {
  /**
   * The RGB value of the color.
   *
   * @type {number}
   */
  rgb;

  /**
   * Creates a color instance from RGB values.
   *
   * @param {number|string} [red] The red component or the RGB value.
   * @param {number} [green] The green component.
   * @param {number} [blue] The blue component.
   */
  constructor(red, green, blue) {
    if (typeof red === 'string') {
      this.rgb = parseInt(red, 16);
    } else if (
      typeof red === 'number' &&
      typeof green === 'number' &&
      typeof blue === 'number'
    ) {
      this.rgb =
        ((red & 0xff) << 16) | ((green & 0xff) << 8) | ((blue & 0xff) << 0);
    } else if (typeof red === 'number') {
      this.rgb = red;
    } else {
      this.rgb = NaN;
    }
  }

  /**
   * The red component of the color.
   *
   * @type {number}
   */
  get red() {
    return (this.rgb >> 16) & 0xff;
  }

  /**
   * The green component of the color.
   *
   * @type {number}
   */
  get green() {
    return (this.rgb >> 8) & 0xff;
  }

  /**
   * The blue component of the color.
   *
   * @type {number}
   */
  get blue() {
    return (this.rgb >> 0) & 0xff;
  }

  /**
   * Creates a new color that is brighter than this color.
   *
   * @param {number} [factor] The optional factor to brighten the color.
   * @return {Color} The brighter color.
   */
  brighter(factor = FACTOR) {
    if (Number.isNaN(this.rgb)) {
      return new Color();
    }

    let red = this.red;
    let green = this.green;
    let blue = this.blue;

    const inverse = Math.floor(1 / (1 - factor));
    if (red === 0 && green === 0 && blue === 0) {
      return new Color(inverse, inverse, inverse);
    }

    if (red > 0 && red < inverse) red = inverse;
    if (green > 0 && green < inverse) green = inverse;
    if (blue > 0 && blue < inverse) blue = inverse;

    return new Color(
      Math.min(Math.floor(red / FACTOR), 255),
      Math.min(Math.floor(green / FACTOR), 255),
      Math.min(Math.floor(blue / FACTOR), 255),
    );
  }

  /**
   * Creates a new color that is darker than this color.
   *
   * @param {number} [factor] The optional factor to darken the color.
   * @return {Color} The darker color.
   */
  darker(factor = FACTOR) {
    if (Number.isNaN(this.rgb)) {
      return new Color();
    }

    return new Color(
      Math.max(Math.floor(this.red * factor), 0),
      Math.max(Math.floor(this.green * factor), 0),
      Math.max(Math.floor(this.blue * factor), 0),
    );
  }

  /**
   * Returns the RGB value of the color.
   *
   * @return {number} The RGB value of the color.
   */
  valueOf() {
    return this.rgb;
  }

  /**
   * Returns the hexadecimal representation of the color.
   *
   * @return {string} The hexadecimal representation of the color.
   */
  toString() {
    if (Number.isNaN(this.rgb)) {
      return 'Invalid Color';
    }

    return this.rgb.toString(16).padStart(6, '0');
  }
}
