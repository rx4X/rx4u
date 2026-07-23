import {expect, test} from 'vitest';
import type {Unsub, NextAction, ErrorAction, CompleteAction, Sub} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {of} from '@/creations/of';
import {switchMap} from './switchMap';

test('switchMap maps and switches to new inner observable', async () => {
  const results: string[] = [];
  const data$ = pipeFrom(
    of(1, 2, 3),
    switchMap((x) => of(`a${x}`, `b${x}`))
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // switchMap should switch to the latest inner observable
  expect(results).toContain('a3');
  expect(results).toContain('b3');
});

test('switchMap cancels previous inner observable', async () => {
  const results: string[] = [];
  let cancelledCount = 0;

  const createInner =
    (x: number) =>
    (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
      const timer = setTimeout(() => {
        next?.(`result${x}`);
        complete?.();
      }, x * 10);

      return function () {
        cancelledCount++;
        clearTimeout(timer);
      };
    };

  const data$ = pipeFrom(of(1, 2, 3), switchMap(createInner));

  await new Promise<void>((resolve) => {
    data$(
      (data: string) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // Only the last inner observable should complete
  expect(results).toEqual(['result3']);
  // Previous inner observables should be cancelled
  expect(cancelledCount).toBeGreaterThan(0);
});

test('switchMap with empty inner observable', async () => {
  const results: any[] = [];
  let completed = false;

  const data$: Sub<any> = pipeFrom(
    of(1, 2, 3),
    switchMap(() => of())
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: number) => results.push(data),
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

test('switchMap propagates inner observable errors', async () => {
  const errorInner = (next?: NextAction<number>, error?: ErrorAction) => {
    error?.(new Error('Inner error'));
    return function () {};
  };

  const data$ = pipeFrom(
    of(1),
    switchMap(() => errorInner)
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

test('switchMap completes correctly when Promise is superseded by new value', async () => {
  let sourceNext: ((value: number) => void) | undefined;
  let sourceComplete: (() => void) | undefined;
  let resolveLatest: ((value: string) => void) | undefined;

  const source$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    sourceNext = next;
    sourceComplete = complete;
    return function () {};
  };

  const results: string[] = [];
  let completed = false;

  const data$ = pipeFrom(
    source$,
    switchMap((x) => {
      if (x === 1) {
        // First value never settles, so completion must not wait for it.
        return new Promise<string>(() => {});
      }
      return new Promise<string>((resolve) => {
        resolveLatest = resolve;
      });
    })
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

    // Emit first value (starts slow Promise)
    sourceNext?.(1);
    // Emit second value quickly (supersedes first Promise)
    sourceNext?.(2);
    // Complete the source
    sourceComplete?.();
    resolveLatest?.('fast-2');
  });

  // Only the second Promise's result should be emitted
  expect(results).toEqual(['fast-2']);
  expect(completed).toBe(true);
});

test('switchMap with projection function', async () => {
  const results: number[] = [];
  const data$ = pipeFrom(
    of(1, 2, 3),
    switchMap((x) => of(x * 10, x * 20))
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // Should contain the mapping result of the last value
  expect(results).toContain(30);
  expect(results).toContain(60);
});
