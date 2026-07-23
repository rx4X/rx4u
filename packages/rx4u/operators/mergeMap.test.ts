import {expect, test} from 'vitest';
import type {NextAction, ErrorAction, CompleteAction} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {of} from '@/creations/of';
import {mergeMap} from './mergeMap';

test('mergeMap maps and merges inner observables', async () => {
  const results: string[] = [];
  const data$ = pipeFrom(
    of(1, 2, 3),
    mergeMap((x) => of(`a${x}`, `b${x}`))
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // mergeMap should merge results from all inner observables
  expect(results).toContain('a1');
  expect(results).toContain('b1');
  expect(results).toContain('a2');
  expect(results).toContain('b2');
  expect(results).toContain('a3');
  expect(results).toContain('b3');
  expect(results.length).toBe(6);
});

test('mergeMap with concurrent limit', async () => {
  const results: string[] = [];
  let activeCount = 0;
  let maxConcurrent = 0;

  function createInner(x: number) {
    return function (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction) {
      activeCount++;
      maxConcurrent = Math.max(maxConcurrent, activeCount);

      const timer = setTimeout(() => {
        next?.(`result${x}`);
        activeCount--;
        complete?.();
      }, 50); // Add delay to ensure concurrency limit takes effect

      return function () {
        clearTimeout(timer);
        if (activeCount > 0) {
          activeCount--;
        }
      };
    };
  }

  const data$ = pipeFrom(
    of(1, 2, 3, 4, 5),
    mergeMap(createInner, 2) // Limit concurrency to 2
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: string) => results.push(data),
      undefined,
      () => {
        setTimeout(() => resolve(), 10); // Give some time for counter to stabilize
      }
    );
  });

  expect(results.length).toBe(5);
  expect(maxConcurrent).toBeLessThanOrEqual(2);
});

test('mergeMap with empty inner observable', async () => {
  const results: any[] = [];
  let completed = false;

  const data$ = pipeFrom(
    of(1, 2, 3),
    mergeMap(() => of())
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

  expect(results).toEqual([]);
  expect(completed).toBe(true);
});

test('mergeMap propagates inner observable errors', async () => {
  const errorInner = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    error?.(new Error('Inner error'));
    return function () {};
  };

  const data$ = pipeFrom(
    of(1),
    mergeMap(() => errorInner)
  );

  let errorCaught = false;

  await new Promise<void>((resolve) => {
    data$(
      () => {},
      (err) => {
        errorCaught = true;
        expect(err instanceof Error ? err.message : String(err)).toBe('Inner error');
        resolve();
      }
    );
  });

  expect(errorCaught).toBe(true);
});

test('mergeMap maintains order within each inner observable', async () => {
  const results: string[] = [];
  const data$ = pipeFrom(
    of(1, 2),
    mergeMap((x) => of(`${x}a`, `${x}b`, `${x}c`))
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // Order within each inner observable should be maintained
  const group1 = results.filter((r) => r.startsWith('1'));
  const group2 = results.filter((r) => r.startsWith('2'));

  expect(group1).toEqual(['1a', '1b', '1c']);
  expect(group2).toEqual(['2a', '2b', '2c']);
});

test('mergeMap unsubscribe should cleanup inner subscriptions correctly', () => {
  const innerUnsubCalls: number[] = [];
  let sourceNext: ((value: number) => void) | undefined;

  const source$ = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    sourceNext = next;
    return function () {};
  };

  function createInner(x: number) {
    return (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction) => {
      // Emit a value asynchronously to keep the inner subscription alive
      const timer = setTimeout(() => {
        next?.(`result${x}`);
        complete?.();
      }, 1000);
      return function () {
        clearTimeout(timer);
        innerUnsubCalls.push(x);
      };
    };
  }

  const data$ = pipeFrom(source$, mergeMap(createInner));

  const unsub = data$((data) => {});

  // Trigger inner subscriptions
  sourceNext?.(1);
  sourceNext?.(2);
  sourceNext?.(3);

  // Unsubscribe should cleanup all inner subscriptions
  unsub();

  expect(innerUnsubCalls).toEqual(expect.arrayContaining([1, 2, 3]));
  expect(innerUnsubCalls.length).toBe(3);
});

test('mergeMap with projection function and index', async () => {
  const results: string[] = [];
  const data$ = pipeFrom(
    of('a', 'b', 'c'),
    mergeMap((value, index) => of(`${value}${index}`))
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toContain('a0');
  expect(results).toContain('b1');
  expect(results).toContain('c2');
});

test('mergeMap cleans up synchronous inner subscriptions after completion', async () => {
  const innerUnsubCalls: number[] = [];

  const data$ = pipeFrom(
    of(1, 2),
    mergeMap((value) => {
      return (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction) => {
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
