import {expect, test} from 'vitest';
import type {Sub, Unsub, NextAction, ErrorAction, CompleteAction} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {of} from '@/creations/of';
import {delay} from './delay';

test('delay emits values after specified delay', async () => {
  const results: number[] = [];
  const timestamps: number[] = [];
  let completed = false;
  const startTime = Date.now();

  const data$ = pipeFrom(of(1, 2, 3), delay(100));

  await new Promise<void>((resolve) => {
    data$(
      (data) => {
        results.push(data);
        timestamps.push(Date.now() - startTime);
      },
      (err) => {
        console.error('Unexpected error:', err);
        resolve();
      },
      () => {
        completed = true;
        resolve();
      }
    );
  });

  expect(results).toEqual([1, 2, 3]);
  expect(completed).toBe(true);
  // Check that values were delayed by at least 100ms
  timestamps.forEach((timestamp) => {
    expect(timestamp).toBeGreaterThanOrEqual(90); // Allow some tolerance
  });
});

test('delay preserves original values', async () => {
  const results: string[] = [];
  let completed = false;

  const data$ = pipeFrom(of('hello', 'world', 'test'), delay(50));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      (err) => {
        console.error('Unexpected error:', err);
        resolve();
      },
      () => {
        completed = true;
        resolve();
      }
    );
  });

  expect(results).toEqual(['hello', 'world', 'test']);
  expect(completed).toBe(true);
});

test('delay handles source errors properly', async () => {
  let errorReceived: Error | null = null;
  const results: number[] = [];

  const errorSource: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    setTimeout(() => {
      next?.(1);
      setTimeout(() => {
        error?.(new Error('Source error'));
      }, 25);
    }, 10);
    return function () {};
  };

  const data$ = pipeFrom(errorSource, delay(100));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      (err) => {
        errorReceived = err instanceof Error ? err : new Error(String(err));
        resolve();
      },
      () => resolve()
    );
  });

  expect(errorReceived).toBeInstanceOf(Error);
  expect((errorReceived as unknown as Error)?.message).toBe('Source error');
  // The delayed value should not be emitted after error
  expect(results).toEqual([]);
});

test('delay can be unsubscribed', async () => {
  const results: number[] = [];
  let completed = false;

  const data$ = pipeFrom(of(1, 2, 3), delay(200));

  const unsub = data$(
    (data) => results.push(data),
    (err) => {
      console.error('Unexpected error:', err);
    },
    () => {
      completed = true;
    }
  );

  // Unsubscribe before delay completes
  setTimeout(() => {
    unsub();
  }, 100);

  // Wait longer than delay to ensure no values are emitted
  await new Promise((resolve) => setTimeout(resolve, 300));

  expect(results).toEqual([]);
  expect(completed).toBe(false);
});

test('delay with zero delay emits immediately', async () => {
  const results: number[] = [];
  let completed = false;
  const startTime = Date.now();

  const data$ = pipeFrom(of(1, 2, 3), delay(0));

  await new Promise<void>((resolve) => {
    data$(
      (data) => {
        results.push(data);
      },
      (err) => {
        console.error('Unexpected error:', err);
        resolve();
      },
      () => {
        completed = true;
        resolve();
      }
    );
  });

  const endTime = Date.now();
  const duration = endTime - startTime;

  expect(results).toEqual([1, 2, 3]);
  expect(completed).toBe(true);
  // Should complete very quickly (within 50ms)
  expect(duration).toBeLessThan(50);
});

test('delay maintains emission order', async () => {
  const results: number[] = [];
  const emissionTimes: number[] = [];
  let completed = false;
  const startTime = Date.now();

  // Create a source that emits values at different intervals
  const timedSource: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    const timeouts: NodeJS.Timeout[] = [];

    timeouts.push(setTimeout(() => next?.(1), 10));
    timeouts.push(setTimeout(() => next?.(2), 20));
    timeouts.push(setTimeout(() => next?.(3), 30));
    timeouts.push(setTimeout(() => complete?.(), 40));

    return function () {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  };

  const data$ = pipeFrom(timedSource, delay(100));

  await new Promise<void>((resolve) => {
    data$(
      (data) => {
        results.push(data);
        emissionTimes.push(Date.now() - startTime);
      },
      (err) => {
        console.error('Unexpected error:', err);
        resolve();
      },
      () => {
        completed = true;
        resolve();
      }
    );
  });

  expect(results).toEqual([1, 2, 3]);
  expect(completed).toBe(true);

  // Check that emissions are properly delayed and in order
  expect(emissionTimes[0]).toBeGreaterThanOrEqual(100); // First emission after ~110ms
  expect(emissionTimes[1]).toBeGreaterThanOrEqual(110); // Second emission after ~120ms
  expect(emissionTimes[2]).toBeGreaterThanOrEqual(120); // Third emission after ~130ms

  // Verify order is maintained
  expect(emissionTimes[0]).toBeLessThan(emissionTimes[1]);
  expect(emissionTimes[1]).toBeLessThan(emissionTimes[2]);
});

test('delay cancels all pending timeouts on unsubscribe', async () => {
  const results: number[] = [];
  let sourceUnsubscribed = false;

  const burstSource: Sub<number> = (next?: NextAction<number>): Unsub => {
    next?.(1);
    next?.(2);
    next?.(3);
    return function () {
      sourceUnsubscribed = true;
    };
  };

  const data$ = pipeFrom(burstSource, delay(50));
  const unsub = data$((data) => results.push(data));

  unsub();

  await new Promise((resolve) => setTimeout(resolve, 80));

  expect(results).toEqual([]);
  expect(sourceUnsubscribed).toBe(true);
});
