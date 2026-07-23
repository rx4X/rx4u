import {expect, test} from 'vitest';
import type {Sub, NextAction, ErrorAction, CompleteAction} from '@/types';
import {retry} from './retry';
import {of} from '@/creations/of';
import {pipeFrom} from '@/pipeFrom';

test('retry re-subscribes on error with specified count', async () => {
  let attemptCount = 0;
  const error$: Sub<string> = (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction) => {
    attemptCount++;
    next?.(`attempt-${attemptCount}`);
    if (attemptCount < 3) {
      error?.(new Error(`Error on attempt ${attemptCount}`));
    } else {
      next?.('success');
      complete?.();
    }
    return function () {};
  };

  const results: string[] = [];
  let completed = false;

  const data$ = pipeFrom(
    error$,
    retry(2) // Maximum 2 retries, 3 attempts total
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: string) => results.push(data),
      undefined,
      () => {
        completed = true;
        resolve();
      }
    );
  });

  expect(results).toEqual(['attempt-1', 'attempt-2', 'attempt-3', 'success']);
  expect(completed).toBe(true);
  expect(attemptCount).toBe(3);
});

test('retry fails after exhausting retry count', async () => {
  let attemptCount = 0;
  const error$ = (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction) => {
    attemptCount++;
    next?.(`attempt-${attemptCount}`);
    error?.(new Error(`Error on attempt ${attemptCount}`));
    return function () {};
  };

  const results: string[] = [];
  let errorCaught = false;

  const data$ = pipeFrom(
    error$,
    retry(1) // Maximum 1 retry, 2 attempts total
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: string) => results.push(data),
      (err) => {
        errorCaught = true;
        expect(err instanceof Error ? err.message : String(err)).toBe('Error on attempt 2');
        resolve();
      }
    );
  });

  expect(results).toEqual(['attempt-1', 'attempt-2']);
  expect(errorCaught).toBe(true);
  expect(attemptCount).toBe(2);
});

test('retry with count 0 does not retry', async () => {
  let attemptCount = 0;
  const error$ = (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction) => {
    attemptCount++;
    next?.(`attempt-${attemptCount}`);
    error?.(new Error('Immediate error'));
    return function () {};
  };

  const results: string[] = [];
  let errorCaught = false;

  const data$ = pipeFrom(error$, retry(0));

  await new Promise<void>((resolve) => {
    data$(
      (data: string) => results.push(data),
      (err) => {
        errorCaught = true;
        resolve();
      }
    );
  });

  expect(results).toEqual(['attempt-1']);
  expect(errorCaught).toBe(true);
  expect(attemptCount).toBe(1);
});

test('retry passes through successful observables', async () => {
  const results: number[] = [];
  let completed = false;

  const data$ = pipeFrom(of(1, 2, 3), retry(3));

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

  expect(results).toEqual([1, 2, 3]);
  expect(completed).toBe(true);
});
