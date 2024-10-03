import { describe, expect, it } from '@jest/globals';

import { ConfigurableResponses } from '../lib/configurable-responses.js';

describe('Configurable responses', () => {
  describe('Single value', () => {
    it('Always returns the same value', () => {
      const responses = ConfigurableResponses.create(42);

      expect(responses.next()).toBe(42);
      expect(responses.next()).toBe(42);
      expect(responses.next()).toBe(42);
    });

    it('Throws error if no value is given', () => {
      const responses = ConfigurableResponses.create();

      expect(() => responses.next()).toThrow(
        new Error('No more responses configured.'),
      );
    });
  });

  describe('Multiple values', () => {
    it('Returns values in order', () => {
      const responses = ConfigurableResponses.create([1, 2, 3]);

      expect(responses.next()).toBe(1);
      expect(responses.next()).toBe(2);
      expect(responses.next()).toBe(3);
    });

    it('Throws error if no more values', () => {
      const responses = ConfigurableResponses.create([1, 2, 3], 'foobar');

      responses.next();
      responses.next();
      responses.next();

      expect(() => responses.next()).toThrow(
        new Error('No more responses configured in foobar.'),
      );
    });

    it('Throws error if array is empty', () => {
      const responses = ConfigurableResponses.create([]);

      expect(() => responses.next()).toThrow(
        new Error('No more responses configured.'),
      );
    });
  });
});
