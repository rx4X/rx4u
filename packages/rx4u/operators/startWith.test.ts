import {expect, test} from 'vitest';
import type {Sub, NextAction, ErrorAction, CompleteAction} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {of} from '@/creations/of';
import {startWith} from './startWith';

test('startWith emits specified values before source values', async () => {
  const results: any[] = [];
  let completed = false;

  const data$ = pipeFrom(of('source1', 'source2'), startWith('start1', 'start2'));

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

  expect(results).toEqual(['start1', 'start2', 'source1', 'source2']);
  expect(completed).toBe(true);
});

test('startWith with single value', async () => {
  const results: any[] = [];

  const data$ = pipeFrom(of(2, 3, 4), startWith(1));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1, 2, 3, 4]);
});

test('startWith with empty source', async () => {
  const results: string[] = [];
  let completed = false;

  const data$ = pipeFrom(
    of<string>(), // Empty observable
    startWith('only', 'start', 'values')
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

  expect(results).toEqual(['only', 'start', 'values']);
  expect(completed).toBe(true);
});

test('startWith with different data types', async () => {
  const results: any[] = [];

  const data$ = pipeFrom(of<any>('string', 42), startWith<any>(null, undefined, true, {key: 'value'}, [1, 2, 3]));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([null, undefined, true, {key: 'value'}, [1, 2, 3], 'string', 42]);
});

test('startWith propagates source errors', async () => {
  const error$ = (next?: NextAction<string>, error?: ErrorAction) => {
    next?.('source-value');
    error?.(new Error('Source error'));
    return function () {};
  };

  const results: string[] = [];
  let errorCaught = false;

  const data$ = pipeFrom(error$, startWith('start-value'));

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

  expect(results).toEqual(['start-value', 'source-value']);
  expect(errorCaught).toBe(true);
});

test('startWith with no start values behaves like identity', async () => {
  const results: number[] = [];

  const data$ = pipeFrom(
    of(1, 2, 3),
    startWith() // No start values
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

test('startWith maintains subscription lifecycle', async () => {
  let sourceSubscribed = false;
  let sourceUnsubscribed = false;

  const test$: Sub<string> = (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction) => {
    sourceSubscribed = true;
    next?.('test');
    complete?.();

    return function () {
      sourceUnsubscribed = true;
    };
  };

  const results: string[] = [];

  const data$ = pipeFrom(test$, startWith('start'));

  const unsubscribe = data$((data) => results.push(data));

  // Wait a bit to ensure subscription completes
  await new Promise((resolve) => setTimeout(resolve, 10));

  unsubscribe();

  expect(sourceSubscribed).toBe(true);
  expect(sourceUnsubscribed).toBe(true);
  expect(results).toEqual(['start', 'test']);
});

test('startWith should not emit source values after unsubscribe', () => {
  const results: number[] = [];
  let sourceNext: ((value: number) => void) | undefined;

  const source$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    sourceNext = next;
    return function () {};
  };

  const data$ = pipeFrom(source$, startWith(0));

  const unsub = data$((data: number) => results.push(data));

  // startWith value should have been emitted
  expect(results).toEqual([0]);

  sourceNext?.(1);
  expect(results).toEqual([0, 1]);

  unsub();

  // After unsubscribe, no more values should be received
  sourceNext?.(2);
  expect(results).toEqual([0, 1]);
});

test('startWith can be chained multiple times', async () => {
  const results: string[] = [];

  const data$ = pipeFrom(of('original'), startWith('second'), startWith('first'));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // Chained calls should add start values in call order
  expect(results).toEqual(['first', 'second', 'original']);
});
