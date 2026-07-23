import {expect, test} from 'vitest';
import type {Sub, Unsub, NextAction, ErrorAction, CompleteAction} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {of} from '@/creations/of';
import {skip} from './skip';

test('skip ignores first n values', async () => {
  const results: number[] = [];
  const data$ = pipeFrom(of(1, 2, 3, 4, 5), skip(2));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([3, 4, 5]);
});

test('skip with count 0 emits all values', async () => {
  const results: number[] = [];
  const data$ = pipeFrom(of(1, 2, 3), skip(0));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1, 2, 3]);
});

test('skip with count greater than source length', async () => {
  const results: number[] = [];
  let completed = false;
  const data$ = pipeFrom(of(1, 2), skip(5));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => {
        completed = true;
        resolve();
      }
    );
  });

  expect(results).toEqual([]);
  expect(completed).toBe(true);
});

test('skip with negative count behaves like skip(0)', async () => {
  const results: number[] = [];
  const data$ = pipeFrom(of(1, 2, 3), skip(-1));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1, 2, 3]);
});

test('skip maintains source completion', async () => {
  const results: number[] = [];
  let completed = false;
  const data$ = pipeFrom(of(1, 2, 3, 4), skip(2));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => {
        completed = true;
        resolve();
      }
    );
  });

  expect(results).toEqual([3, 4]);
  expect(completed).toBe(true);
});

test('skip should not emit values after unsubscribe', async () => {
  const results: number[] = [];
  let sourceNext: ((value: number) => void) | undefined;

  const source$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    sourceNext = next;
    return function () {};
  };

  const data$ = pipeFrom(source$, skip(1));

  const unsub = data$((data: number) => results.push(data));

  // Skip the first value
  sourceNext?.(1);
  // This should be received
  sourceNext?.(2);

  expect(results).toEqual([2]);

  // Unsubscribe
  unsub();

  // These values should NOT be received after unsubscribe
  sourceNext?.(3);
  sourceNext?.(4);

  expect(results).toEqual([2]);
});

test('skip propagates errors', async () => {
  const error$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    next?.(1);
    next?.(2);
    error?.(new Error('Test error'));
    return function () {};
  };

  const data$ = pipeFrom(error$, skip(1));

  let errorCaught = false;
  const results: number[] = [];

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      (err) => {
        errorCaught = true;
        expect(err instanceof Error ? err.message : String(err)).toBe('Test error');
        resolve();
      }
    );
  });

  expect(results).toEqual([2]);
  expect(errorCaught).toBe(true);
});
