import {expect, test} from 'vitest';
import type {Sub, Unsub, NextAction, ErrorAction, CompleteAction} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {of} from '@/creations/of';
import {endWith} from './endWith';

test('endWith emits specified values after source completes', async () => {
  const results: any[] = [];
  let completed = false;

  const data$ = pipeFrom(of('source1', 'source2'), endWith('end1', 'end2'));

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

  expect(results).toEqual(['source1', 'source2', 'end1', 'end2']);
  expect(completed).toBe(true);
});

test('endWith with single value', async () => {
  const results: any[] = [];

  const data$ = pipeFrom(of(1, 2, 3), endWith(4));

  await new Promise<void>((resolve) => {
    data$(
      (data: number) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1, 2, 3, 4]);
});

test('endWith with empty source', async () => {
  const results: string[] = [];
  let completed = false;

  const data$ = pipeFrom(
    of<string>(), // empty observable
    endWith('only', 'end', 'values')
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

  expect(results).toEqual(['only', 'end', 'values']);
  expect(completed).toBe(true);
});

test('endWith with different data types', async () => {
  const results: any[] = [];

  const data$ = pipeFrom(of<any>('string', 42), endWith<any>(null, undefined, true, {key: 'value'}, [1, 2, 3]));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual(['string', 42, null, undefined, true, {key: 'value'}, [1, 2, 3]]);
});

test('endWith does not emit when source errors', async () => {
  const error$: Sub<string> = (next?: NextAction<string>, error?: ErrorAction) => {
    next?.('source-value');
    error?.(new Error('Source error'));
    return function () {};
  };

  const results: string[] = [];
  let errorCaught = false;

  const data$ = pipeFrom(error$, endWith('end-value'));

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

  // When source errors, endWith values should not be emitted
  expect(results).toEqual(['source-value']);
  expect(errorCaught).toBe(true);
});

test('endWith with no end values behaves like identity', async () => {
  const results: number[] = [];

  const data$ = pipeFrom(
    of(1, 2, 3),
    endWith() // no end values
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1, 2, 3]);
});

test('endWith maintains subscription lifecycle', async () => {
  let sourceSubscribed = false;
  let sourceUnsubscribed = false;

  const test$: Sub<string> = (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    sourceSubscribed = true;
    next?.('test');
    complete?.();

    return function () {
      sourceUnsubscribed = true;
    };
  };

  const results: string[] = [];

  const data$ = pipeFrom(test$, endWith('end'));

  const unsubscribe = data$((data) => results.push(data));

  // Wait a bit to ensure subscription completes
  await new Promise((resolve) => setTimeout(resolve, 10));

  unsubscribe();

  expect(sourceSubscribed).toBe(true);
  expect(sourceUnsubscribed).toBe(true);
  expect(results).toEqual(['test', 'end']);
});

test('endWith can be chained multiple times', async () => {
  const results: string[] = [];

  const data$ = pipeFrom(of('original'), endWith('first'), endWith('second'));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // Chained calls should add end values in call order
  expect(results).toEqual(['original', 'first', 'second']);
});

test('endWith only emits after source completion', async () => {
  const results: string[] = [];
  const timestamps: number[] = [];
  const start = Date.now();

  const delayed$: Sub<string> = (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    next?.('immediate');
    timestamps.push(Date.now() - start);

    setTimeout(() => {
      next?.('delayed');
      timestamps.push(Date.now() - start);
      complete?.();
    }, 50);

    return function () {};
  };

  const data$ = pipeFrom(delayed$, endWith('end'));

  await new Promise<void>((resolve) => {
    data$(
      (data) => {
        results.push(data);
        timestamps.push(Date.now() - start);
      },
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual(['immediate', 'delayed', 'end']);
  // Ensure 'end' is emitted after 'delayed'
  expect(timestamps[2]).toBeGreaterThan(timestamps[1]);
});
