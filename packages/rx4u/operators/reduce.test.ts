import {expect, test} from 'vitest';
import type {Sub, NextAction, ErrorAction, CompleteAction} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {of} from '@/creations/of';
import {reduce} from './reduce';

test('reduce applies accumulator function and emits final result', async () => {
  const results: number[] = [];
  let completed = false;

  const data$ = pipeFrom(
    of(1, 2, 3, 4),
    reduce((acc, value) => acc + value, 0)
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

  // reduce should only emit final result when source completes
  expect(results).toEqual([10]);
  expect(completed).toBe(true);
});

test('reduce with initial seed value', async () => {
  const results: number[] = [];

  const data$ = pipeFrom(
    of(1, 2, 3),
    reduce((acc, value) => acc * value, 10)
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([60]);
});

test('reduce without initial seed uses first value as seed', async () => {
  const results: string[] = [];

  const data$ = pipeFrom(
    of('a', 'b', 'c', 'd'),
    reduce((acc, value) => (acc || '') + value)
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: string) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual(['abcd']);
});

test('reduce with empty source and seed', async () => {
  const results: number[] = [];
  let completed = false;

  const data$ = pipeFrom(
    of<number>(), // Empty stream
    reduce((acc: number, value: number) => acc + value, 42)
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

  // Empty source should emit initial value
  expect(results).toEqual([42]);
  expect(completed).toBe(true);
});

test('reduce with empty source and no seed', async () => {
  let errorCaught = false;

  const data$ = pipeFrom(
    of<number>(),
    reduce((acc: number, value: number) => acc + value)
  );

  await new Promise<void>((resolve) => {
    data$(
      () => {},
      (err) => {
        errorCaught = true;
        expect(err instanceof Error ? err.message : String(err)).toContain('empty'); // Empty source without initial value should error
        resolve();
      }
    );
  });

  expect(errorCaught).toBe(true);
});

test('reduce with single value and seed', async () => {
  const results: number[] = [];

  const data$ = pipeFrom(
    of(5),
    reduce((acc: number, value: number) => acc + value, 10)
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([15]);
});

test('reduce with single value and no seed', async () => {
  const results: number[] = [];

  const data$ = pipeFrom(
    of(42),
    reduce((acc, value) => (acc || 0) + value)
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: number) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // Single value should emit that value directly
  expect(results).toEqual([42]);
});

test('reduce propagates source errors', async () => {
  const error$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    next?.(1);
    next?.(2);
    error?.(new Error('Source error'));
    return function () {};
  };

  const results: number[] = [];
  let errorCaught = false;

  const data$ = pipeFrom(
    error$,
    reduce((acc, value) => acc + value, 0)
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      (err) => {
        errorCaught = true;
        expect(err instanceof Error ? err.message : String(err)).toBe('Source error');
        resolve();
      }
    );
  });

  // Should not emit any values when error occurs
  expect(results).toEqual([]);
  expect(errorCaught).toBe(true);
});

test('reduce with accumulator function that throws', async () => {
  const results: number[] = [];
  let errorCaught = false;

  const data$ = pipeFrom(
    of(1, 2, 3),
    reduce((acc, value) => {
      if (value === 2) {
        throw new Error('Accumulator error');
      }
      return acc + value;
    }, 0)
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      (err) => {
        errorCaught = true;
        expect(err instanceof Error ? err.message : String(err)).toBe('Accumulator error');
        resolve();
      }
    );
  });

  expect(results).toEqual([]);
  expect(errorCaught).toBe(true);
});

test('reduce with different data types', async () => {
  const results: number[][] = [];

  const data$ = pipeFrom(
    of(1, 2, 3),
    reduce((acc, value) => {
      acc.push(value);
      return acc;
    }, [] as number[])
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([[1, 2, 3]]);
});

test('reduce maintains subscription lifecycle', async () => {
  let sourceSubscribed = false;
  let sourceUnsubscribed = false;

  const test$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    sourceSubscribed = true;
    next?.(1);
    next?.(2);
    complete?.();

    return function () {
      sourceUnsubscribed = true;
    };
  };

  const data$ = pipeFrom(
    test$,
    reduce((acc: number, value: number) => acc + value, 0)
  );

  const unsubscribe = data$(() => {});

  await new Promise((resolve) => setTimeout(resolve, 10));

  unsubscribe();

  expect(sourceSubscribed).toBe(true);
  expect(sourceUnsubscribed).toBe(true);
});

test('reduce with index parameter', async () => {
  const results: string[] = [];

  const data$ = pipeFrom(
    of('a', 'b', 'c'),
    reduce((acc, value, index) => `${acc}-${value}${index}`, 'start')
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual(['start-a0-b1-c2']);
});

test('reduce only emits on completion', async () => {
  const results: number[] = [];
  const emissionTimes: number[] = [];
  const start = Date.now();

  const delayed$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    next?.(1);
    emissionTimes.push(Date.now() - start);

    setTimeout(() => {
      next?.(2);
      emissionTimes.push(Date.now() - start);
    }, 30);

    setTimeout(() => {
      next?.(3);
      emissionTimes.push(Date.now() - start);
      complete?.();
    }, 60);

    return function () {};
  };

  const data$ = pipeFrom(
    delayed$,
    reduce((acc, value) => {
      results.push(value); // Record processed values
      return acc + value;
    }, 0)
  );

  const finalResults: number[] = [];

  await new Promise<void>((resolve) => {
    data$(
      (data) => {
        finalResults.push(data);
        emissionTimes.push(Date.now() - start);
      },
      undefined,
      () => resolve()
    );
  });

  // reduce should process all values but only emit once at the end
  expect(results).toEqual([1, 2, 3]);
  expect(finalResults).toEqual([6]);

  // Final emission should be after or at the same time as all source values (due to timing precision limitations)
  expect(emissionTimes[emissionTimes.length - 1]).toBeGreaterThanOrEqual(emissionTimes[2]);
});
