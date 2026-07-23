import {expect, test} from 'vitest';
import type {Sub, Unsub, NextAction, ErrorAction} from '@/types';
import {of} from '@/creations/of';
import {combineLatest} from './combineLatest';

test('combineLatest emits when all sources have emitted at least once', async () => {
  const sub1 = of(1, 2);
  const sub2 = of('a', 'b');
  const combined$ = combineLatest(sub1, sub2);

  const results: [number, string][] = [];

  await new Promise<void>((resolve) => {
    combined$(
      (value) => results.push(value),
      undefined,
      () => resolve()
    );
  });

  // combineLatest should emit combinations of the latest values
  expect(results.length).toBeGreaterThan(0);
  expect(results[results.length - 1]).toEqual([2, 'b']);
});

test('combineLatest waits for all sources to emit', async () => {
  const sub1 = of(1);
  const sub2 = of('a', 'b');
  const combined$ = combineLatest(sub1, sub2);

  const results: [number, string][] = [];

  await new Promise<void>((resolve) => {
    combined$(
      (value) => results.push(value),
      undefined,
      () => resolve()
    );
  });

  // Should wait for all sources to emit before starting to combine
  expect(results.length).toBeGreaterThan(0);
  expect(results).toContainEqual([1, 'a']);
  expect(results).toContainEqual([1, 'b']);
});

test('combineLatest handles empty sources', async () => {
  const source1 = of();
  const source2 = of(1, 2);
  const combined$ = combineLatest(source1, source2);

  const results: any[] = [];
  let completed = false;

  await new Promise<void>((resolve) => {
    combined$(
      (value) => results.push(value),
      undefined,
      () => {
        completed = true;
        resolve();
      }
    );
  });

  // If there are empty sources, combineLatest should complete immediately without emitting any values
  expect(results).toEqual([]);
  expect(completed).toBe(true);
});

test('combineLatest tears down other sources when a source errors', async () => {
  let longSourceUnsubscribed = false;

  const longSource: Sub<number> = (next?: NextAction<number>): Unsub => {
    const intervalId = setInterval(() => next?.(1), 5);
    return function () {
      longSourceUnsubscribed = true;
      clearInterval(intervalId);
    };
  };

  const errorSource: Sub<string> = (next?: NextAction<string>, error?: ErrorAction): Unsub => {
    const timeoutId = setTimeout(() => error?.(new Error('stop')), 10);
    return function () {
      clearTimeout(timeoutId);
    };
  };

  await new Promise<void>((resolve) => {
    combineLatest(longSource, errorSource)(
      () => {},
      () => resolve()
    );
  });

  expect(longSourceUnsubscribed).toBe(true);
});
