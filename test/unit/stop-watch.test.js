// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from 'vitest';

import { Clock } from '../../lib/time.js';
import { StopWatch } from '../../lib/stop-watch.js';

describe('Stop watch', () => {
  it('measures time', () => {
    const clock = Clock.fixed();
    const watch = new StopWatch(clock);

    watch.start();
    clock.add(1600);
    watch.stop();

    expect(watch.getTotalTimeMillis()).toBe(1600);
    expect(watch.getTotalTimeSeconds()).toBe(1.6);
  });
});
