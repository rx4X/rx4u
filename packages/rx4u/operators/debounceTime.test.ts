import {expect, test} from 'vitest';
import type {Sub, NextAction, ErrorAction, CompleteAction} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {debounceTime} from './debounceTime';

test('debounceTime delays emissions', async () => {
  const results: number[] = [];
  const timestamps: number[] = [];

  const source: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    const start = Date.now();
    setTimeout(() => {
      next?.(1);
      timestamps.push(Date.now() - start);
    }, 10);
    setTimeout(() => {
      next?.(2);
      timestamps.push(Date.now() - start);
    }, 15);
    setTimeout(() => {
      next?.(3);
      timestamps.push(Date.now() - start);
    }, 30); // Changed to 30ms to ensure it's within value 2's debounce time
    setTimeout(() => {
      complete?.();
    }, 80); // Delay complete to ensure debounce has time to work
    return function () {};
  };

  const data$ = pipeFrom(source, debounceTime(20));

  const start = Date.now();
  await new Promise<void>((resolve) => {
    data$(
      (data: number) => {
        results.push(data);
        timestamps.push(Date.now() - start);
      },
      undefined,
      () => resolve()
    );
  });

  // Only the last value should be emitted, as the first two are debounced
  expect(results).toEqual([3]);
});

test('debounceTime emits last value after delay', async () => {
  const results: number[] = [];

  const source: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    next?.(1);
    setTimeout(() => complete?.(), 50);
    return function () {};
  };

  const data$ = pipeFrom(source, debounceTime(20));

  await new Promise<void>((resolve) => {
    data$(
      (data: number) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1]);
});

test('debounceTime with rapid emissions', async () => {
  const results: number[] = [];

  const source: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    // Rapidly emit multiple values
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => next?.(i), i * 2);
    }
    setTimeout(() => complete?.(), 100);
    return function () {};
  };

  const data$ = pipeFrom(source, debounceTime(20));

  await new Promise<void>((resolve) => {
    data$(
      (data: number) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // Only the last value should be emitted
  expect(results).toEqual([5]);
});

test('debounceTime with zero delay', async () => {
  const results: number[] = [];

  const source: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    next?.(1);
    next?.(2);
    next?.(3);
    setTimeout(() => complete?.(), 10);
    return function () {};
  };

  const data$ = pipeFrom(source, debounceTime(0));

  await new Promise<void>((resolve) => {
    data$(
      (data: number) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // Zero delay should emit the last value
  expect(results).toEqual([3]);
});

test('debounceTime cleans up properly on unsubscribe without emitting pending value', async () => {
  const results: number[] = [];

  const source: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    next?.(1);
    next?.(2);
    // More values will come later
    const timer = setTimeout(() => {
      next?.(3);
    }, 100);
    return () => clearTimeout(timer);
  };

  const data$ = pipeFrom(source, debounceTime(30));

  const unsub = data$((data: number) => results.push(data));

  // Unsubscribe before debounce timer fires
  await new Promise((resolve) => setTimeout(resolve, 10));
  unsub();

  // Wait past the debounce time
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Nothing should have been emitted since we unsubscribed before the timer
  expect(results).toEqual([]);
});

test('debounceTime propagates errors', async () => {
  const error$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction) => {
    next?.(1);
    setTimeout(() => error?.(new Error('Test error')), 10);
    return function () {};
  };

  const data$ = pipeFrom(error$, debounceTime(20));

  let errorCaught = false;

  await new Promise<void>((resolve) => {
    data$(
      () => {},
      (err) => {
        errorCaught = true;
        expect(err instanceof Error ? err.message : String(err)).toBe('Test error');
        resolve();
      }
    );
  });

  expect(errorCaught).toBe(true);
});
