import {expect, test} from 'vitest';
import type {Sub, Unsub, NextAction, ErrorAction} from '@/types';
import {of} from '@/creations/of';
import {merge} from './merge';

test('merge combines multiple observables', async () => {
  const source1 = of(1, 2);
  const source2 = of(3, 4);
  const merged$ = merge(source1, source2);

  const results: number[] = [];

  await new Promise<void>((resolve) => {
    merged$(
      (value) => results.push(value),
      undefined,
      () => resolve()
    );
  });

  // Results should contain all values, but order may vary (async)
  expect(results.sort()).toEqual([1, 2, 3, 4]);
});

test('merge handles empty observables', async () => {
  const source1 = of<number>();
  const source2 = of<number>(1, 2);
  const merged$ = merge(source1, source2);

  const results: number[] = [];

  await new Promise<void>((resolve) => {
    merged$(
      (value: number) => results.push(value),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1, 2]);
});

test('merge propagates errors', async () => {
  const source1 = of(1, 2);
  const error$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction) => {
    setTimeout(() => error?.(new Error('Test error')), 10);
    return function () {};
  };

  const merged$ = merge(source1, error$);

  let errorCaught = false;

  await new Promise<void>((resolve) => {
    merged$(
      () => {},
      () => {
        errorCaught = true;
        resolve();
      },
      () => resolve()
    );
  });

  expect(errorCaught).toBe(true);
});

test('merge tears down sibling sources when one source errors', async () => {
  let longSourceUnsubscribed = false;

  const longSource: Sub<number> = (next?: NextAction<number>): Unsub => {
    const intervalId = setInterval(() => next?.(1), 5);
    return function () {
      longSourceUnsubscribed = true;
      clearInterval(intervalId);
    };
  };

  const errorSource: Sub<number> = (next?: NextAction<number>, error?: ErrorAction): Unsub => {
    const timeoutId = setTimeout(() => error?.(new Error('stop')), 10);
    return function () {
      clearTimeout(timeoutId);
    };
  };

  await new Promise<void>((resolve) => {
    merge(longSource, errorSource)(
      () => {},
      () => resolve()
    );
  });

  expect(longSourceUnsubscribed).toBe(true);
});
