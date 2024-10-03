import { describe, expect, it } from '@jest/globals';

import { OutputTracker } from '../lib/output-tracker.js';

describe('Output tracker', () => {
  it('Uses custom event to track output', () => {
    const eventTarget = new EventTarget();
    const outputTracker = OutputTracker.create(eventTarget, 'foo');

    const event = new CustomEvent('foo', { detail: 'bar' });
    eventTarget.dispatchEvent(event);

    expect(outputTracker.data).toEqual(['bar']);
  });

  it('Clears stored output', () => {
    const eventTarget = new EventTarget();
    const outputTracker = OutputTracker.create(eventTarget, 'foo');
    const event = new CustomEvent('foo', { detail: 'bar' });
    eventTarget.dispatchEvent(event);

    expect(outputTracker.clear()).toEqual(['bar']);

    expect(outputTracker.data).toEqual([]);
  });

  it('Stops tracking', () => {
    const eventTarget = new EventTarget();
    const outputTracker = OutputTracker.create(eventTarget, 'foo');
    const event = new CustomEvent('foo', { detail: 'bar' });
    eventTarget.dispatchEvent(event);

    outputTracker.stop();
    eventTarget.dispatchEvent(event);

    expect(outputTracker.data).toEqual(['bar']);
  });
});
