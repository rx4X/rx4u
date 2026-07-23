import {expect, test} from 'vitest';
import type {Sub, Unsub, NextAction, ErrorAction, CompleteAction} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {of} from '@/creations/of';
import {scan} from './scan';

test('scan applies accumulator function and emits intermediate results', async () => {
  const results: number[] = [];
  let completed = false;

  const data$ = pipeFrom(
    of(1, 2, 3, 4),
    scan((acc, value) => acc + value, 0)
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

  // scan should emit each intermediate result
  expect(results).toEqual([1, 3, 6, 10]);
  expect(completed).toBe(true);
});

test('scan with initial seed value', async () => {
  const results: number[] = [];

  const data$ = pipeFrom(
    of(1, 2, 3),
    scan((acc, value) => acc * value, 10)
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([10, 20, 60]);
});

test('scan without initial seed uses first value as seed', async () => {
  const results: string[] = [];

  const data$ = pipeFrom(
    of('a', 'b', 'c', 'd'),
    scan((acc, value) => acc + value)
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // First value as initial accumulator, start accumulating from second value
  expect(results).toEqual(['a', 'ab', 'abc', 'abcd']);
});

test('scan with empty source and seed', async () => {
  const results: number[] = [];
  let completed = false;

  const data$ = pipeFrom(
    of<number>(), // Empty observable
    scan((acc: number, value: number) => acc + value, 42)
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

  // Empty source should not emit any values, even with seed value
  expect(results).toEqual([]);
  expect(completed).toBe(true);
});

test('scan with empty source and no seed', async () => {
  const results: any[] = [];
  let completed = false;

  const data$ = pipeFrom(
    of<number>(),
    scan((acc: number, value: number) => acc + value)
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

test('scan with single value and seed', async () => {
  const results: number[] = [];

  const data$ = pipeFrom(
    of(5),
    scan((acc, value) => acc + value, 10)
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

test('scan with single value and no seed', async () => {
  const results: number[] = [];

  const data$ = pipeFrom(
    of(42),
    scan((acc, value) => acc + value)
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // Single value should emit that value directly
  expect(results).toEqual([42]);
});

test('scan propagates source errors', async () => {
  const error$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction) => {
    next?.(1);
    next?.(2);
    error?.(new Error('Source error'));
    return function () {};
  };

  const results: number[] = [];
  let errorCaught = false;

  const data$ = pipeFrom(
    error$,
    scan((acc: number, value: number) => acc + value, 0)
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

  expect(results).toEqual([1, 3]);
  expect(errorCaught).toBe(true);
});

test('scan with accumulator function that throws', async () => {
  const results: number[] = [];
  let errorCaught = false;

  const data$ = pipeFrom(
    of(1, 2, 3),
    scan((acc, value) => {
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

  expect(results).toEqual([1]); // Only the first value was processed
  expect(errorCaught).toBe(true);
});

test('scan with different data types', async () => {
  const results: any[] = [];

  const data$ = pipeFrom(
    of(1, 2, 3),
    scan((acc, value) => {
      acc.push(value);
      return acc;
    }, [] as number[])
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push([...data]), // Copy array to avoid reference issues
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([[1], [1, 2], [1, 2, 3]]);
});

test('scan maintains subscription lifecycle', async () => {
  let sourceSubscribed = false;
  let sourceUnsubscribed = false;

  const test$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
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
    scan((acc: number, value: number) => acc + value, 0)
  );

  const unsubscribe = data$(() => {});

  await new Promise((resolve) => setTimeout(resolve, 10));

  unsubscribe();

  expect(sourceSubscribed).toBe(true);
  expect(sourceUnsubscribed).toBe(true);
});

test('scan unsubscribes from source when accumulator throws', () => {
  let sourceUnsubCalled = false;
  let emitCount = 0;

  const source$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    const timer = setInterval(() => {
      emitCount++;
      next?.(emitCount);
    }, 10);
    return function () {
      sourceUnsubCalled = true;
      clearInterval(timer);
    };
  };

  const data$ = pipeFrom(
    source$,
    scan((acc, value) => {
      if (value === 2) {
        throw new Error('Accumulator error');
      }
      return acc + value;
    }, 0)
  );

  return new Promise<void>((resolve) => {
    data$(
      () => {},
      (err) => {
        // After accumulator throws, source should be unsubscribed
        setTimeout(() => {
          expect(sourceUnsubCalled).toBe(true);
          expect(err instanceof Error ? err.message : String(err)).toBe('Accumulator error');
          resolve();
        }, 50);
      }
    );
  });
});

test('scan with index parameter', async () => {
  const results: string[] = [];

  const data$ = pipeFrom(
    of('a', 'b', 'c'),
    scan((acc, value, index) => `${acc}-${value}${index}`, 'start')
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual(['start-a0', 'start-a0-b1', 'start-a0-b1-c2']);
});
