import {expect, test} from 'vitest';
import type {Sub, Unsub, NextAction, ErrorAction, CompleteAction} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {of} from '@/creations/of';
import {take} from './take';

test('take limits number of emitted values', async () => {
  const results: number[] = [];
  const data$ = pipeFrom(of(1, 2, 3, 4, 5), take(3));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1, 2, 3]);
});

test('take with count 0 completes immediately', async () => {
  const results: number[] = [];
  let completed = false;
  const data$ = pipeFrom(of(1, 2, 3), take(0));

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

test('take with count greater than source length', async () => {
  const results: number[] = [];
  const data$ = pipeFrom(of(1, 2), take(5));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1, 2]);
});

test('take with negative count behaves like take(0)', async () => {
  const results: number[] = [];
  let completed = false;
  const data$ = pipeFrom(of(1, 2, 3), take(-1));

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

test('take calls source unsub on synchronous source after count reached', () => {
  let sourceUnsubCalled = false;

  const source: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    // Emit values synchronously — unsub is not yet assigned when next is called
    next?.(1);
    next?.(2);
    return function () {
      sourceUnsubCalled = true;
    };
  };

  const results: number[] = [];
  const data$ = pipeFrom(source, take(2));

  data$(
    (data: number) => results.push(data),
    undefined,
    () => {}
  );

  expect(results).toEqual([1, 2]);
  // The source unsub should have been called even though source emits synchronously
  expect(sourceUnsubCalled).toBe(true);
});

test('take unsubscribes from source after count reached', async () => {
  const results: number[] = [];
  let sourceCompleted = false;

  const source: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    let count = 0;
    const interval = setInterval(() => {
      if (count < 10) {
        next?.(count++);
      } else {
        sourceCompleted = true;
        complete?.();
        clearInterval(interval);
      }
    }, 1);

    return () => clearInterval(interval);
  };

  const data$ = pipeFrom(source, take(3));

  await new Promise<void>((resolve) => {
    data$(
      (data: number) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([0, 1, 2]);
  // Source should be unsubscribed early and not complete
  expect(sourceCompleted).toBe(false);
});
