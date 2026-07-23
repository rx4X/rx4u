import {expect, test} from 'vitest';
import type {Sub, Unsub, NextAction, ErrorAction, CompleteAction} from '@/types';
import {of} from '@/creations/of';
import {pipeFrom} from '@/pipeFrom';
import {concatMap} from './concatMap';

test('concatMap maps and concatenates inner observables sequentially', async () => {
  const results: string[] = [];
  const data$ = pipeFrom(
    of(1, 2, 3),
    concatMap((x) => of(`a${x}`, `b${x}`))
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // concatMap should concatenate all inner observables in order
  expect(results).toEqual(['a1', 'b1', 'a2', 'b2', 'a3', 'b3']);
});

test('concatMap waits for previous inner observable to complete', async () => {
  const results: string[] = [];
  const timestamps: number[] = [];
  const start = Date.now();

  function createDelayedInner(x: number, delay: number) {
    return function (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction) {
      const timer = setTimeout(() => {
        next?.(`result${x}`);
        timestamps.push(Date.now() - start);
        complete?.();
      }, delay);

      return () => clearTimeout(timer);
    };
  }

  const data$ = pipeFrom(
    of(1, 2, 3),
    concatMap((x, index) => createDelayedInner(x, [30, 10, 20][index]))
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: string) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // Results should be in source observable order, not completion time order
  expect(results).toEqual(['result1', 'result2', 'result3']);

  // Timestamps should be increasing (serial execution)
  expect(timestamps[0]).toBeLessThan(timestamps[1]);
  expect(timestamps[1]).toBeLessThan(timestamps[2]);
});

test('concatMap with empty inner observable', async () => {
  const results: any[] = [];
  let completed = false;

  const data$ = pipeFrom(
    of(1, 2, 3),
    concatMap((x) => (x === 2 ? of() : of(`result${x}`)))
  );

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

  expect(results).toEqual(['result1', 'result3']);
  expect(completed).toBe(true);
});

test('concatMap propagates inner observable errors', async () => {
  const errorInner: Sub<string> = (next?: NextAction<string>, error?: ErrorAction): Unsub => {
    error?.(new Error('Inner error'));
    return function () {};
  };

  const data$ = pipeFrom(
    of(1, 2, 3),
    concatMap((x: number) => (x === 2 ? errorInner : of(`result${x}`)))
  );

  let errorCaught = false;
  const results: string[] = [];

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      (err) => {
        errorCaught = true;
        expect(err instanceof Error ? err.message : String(err)).toBe('Inner error');
        resolve();
      }
    );
  });

  expect(results).toEqual(['result1']);
  expect(errorCaught).toBe(true);
});

test('concatMap maintains strict order', async () => {
  const results: number[] = [];
  const executionOrder: number[] = [];

  function createInner(x: number): Sub<number> {
    return function (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      executionOrder.push(x);
      // Simulate async operation, but second completes faster than first
      const delay = x === 1 ? 50 : 10;
      const timer = setTimeout(() => {
        next?.(x * 10);
        complete?.();
      }, delay);

      return function () {
        clearTimeout(timer);
      };
    };
  }

  const data$ = pipeFrom(of(1, 2, 3), concatMap(createInner));

  await new Promise<void>((resolve) => {
    data$(
      (data: number) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // Results should strictly follow source order
  expect(results).toEqual([10, 20, 30]);
  // But execution may not start simultaneously (serial)
  expect(executionOrder[0]).toBe(1);
});

test('concatMap continues processing buffer after project throws', async () => {
  const results: string[] = [];
  const errors: string[] = [];

  let sourceNext: ((value: number) => void) | undefined;
  let sourceComplete: (() => void) | undefined;

  const source$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    sourceNext = next;
    sourceComplete = complete;
    return function () {};
  };

  const data$ = pipeFrom(
    source$,
    concatMap((x) => {
      if (x === 2) {
        throw new Error('Project error');
      }
      return (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
        setTimeout(() => {
          next?.(`result${x}`);
          complete?.();
        }, 10);
        return function () {};
      };
    })
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: string) => results.push(data),
      (err) => {
        errors.push(err instanceof Error ? err.message : String(err));
        // After error from project(2), emit value 3 to see if it's processed
        // Use setTimeout to allow the error to be fully processed
        setTimeout(() => {
          sourceNext?.(3);
          sourceComplete?.();
        }, 0);
      },
      () => resolve()
    );

    // Emit values: 1 starts processing, 2 is buffered, then project(2) throws
    sourceNext?.(1);
    sourceNext?.(2);
  });

  expect(errors).toEqual(['Project error']);
  expect(results).toContain('result1');
  // result3 should also be processed since isProcessing was properly reset
  expect(results).toContain('result3');
});

test('concatMap with projection function and index', async () => {
  const results: string[] = [];
  const data$ = pipeFrom(
    of('a', 'b', 'c'),
    concatMap((value, index) => of(`${value}${index}`, `${value}${index}_2`))
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual(['a0', 'a0_2', 'b1', 'b1_2', 'c2', 'c2_2']);
});

test('concatMap cleans up synchronous inner subscriptions after completion', async () => {
  const innerUnsubCalls: number[] = [];

  const data$ = pipeFrom(
    of(1, 2),
    concatMap((value) => {
      return (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
        next?.(`result${value}`);
        complete?.();
        return function () {
          innerUnsubCalls.push(value);
        };
      };
    })
  );

  const results: string[] = [];

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual(['result1', 'result2']);
  expect(innerUnsubCalls).toEqual([1, 2]);
});
