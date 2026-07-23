import {expect, test} from 'vitest';
import type {Sub, NextAction, ErrorAction, CompleteAction} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {of} from '@/creations/of';
import {distinctUntilChanged} from './distinctUntilChanged';

test('distinctUntilChanged filters consecutive duplicate values', async () => {
  const results: number[] = [];
  const data$ = pipeFrom(of(1, 1, 2, 2, 2, 3, 1, 1), distinctUntilChanged());

  await new Promise<void>((resolve) => {
    data$(
      (data: number) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1, 2, 3, 1]);
});

test('distinctUntilChanged with custom compareFn', async () => {
  const results: {id: number; name: string}[] = [];
  const data$ = pipeFrom(
    of({id: 1, name: 'Alice'}, {id: 1, name: 'Alice Updated'}, {id: 2, name: 'Bob'}, {id: 2, name: 'Bob Updated'}, {id: 3, name: 'Charlie'}),
    distinctUntilChanged((a, b) => a.id === b.id)
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([
    {id: 1, name: 'Alice'},
    {id: 2, name: 'Bob'},
    {id: 3, name: 'Charlie'},
  ]);
});

test('distinctUntilChanged with keySelector', async () => {
  const results: {id: number; name: string}[] = [];
  const data$ = pipeFrom(
    of({id: 1, name: 'Alice'}, {id: 1, name: 'Alice Updated'}, {id: 2, name: 'Bob'}, {id: 2, name: 'Bob Updated'}, {id: 3, name: 'Charlie'}),
    distinctUntilChanged(undefined, (obj) => obj.id)
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([
    {id: 1, name: 'Alice'},
    {id: 2, name: 'Bob'},
    {id: 3, name: 'Charlie'},
  ]);
});

test('distinctUntilChanged emits first value always', async () => {
  const results: number[] = [];
  const data$ = pipeFrom(of(5), distinctUntilChanged());

  await new Promise<void>((resolve) => {
    data$(
      (data: number) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([5]);
});

test('distinctUntilChanged with all different values', async () => {
  const results: number[] = [];
  const data$ = pipeFrom(of(1, 2, 3, 4, 5), distinctUntilChanged());

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1, 2, 3, 4, 5]);
});

test('distinctUntilChanged with all same values', async () => {
  const results: number[] = [];
  const data$ = pipeFrom(of(1, 1, 1, 1, 1), distinctUntilChanged());

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1]);
});

test('distinctUntilChanged propagates errors', async () => {
  const error$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    next?.(1);
    next?.(1);
    error?.(new Error('Test error'));
    return function () {};
  };

  const data$ = pipeFrom(error$, distinctUntilChanged());

  let errorCaught = false;
  const results: number[] = [];

  await new Promise<void>((resolve) => {
    data$(
      (data: number) => results.push(data),
      (err) => {
        errorCaught = true;
        expect(err instanceof Error ? err.message : String(err)).toBe('Test error');
        resolve();
      }
    );
  });

  expect(results).toEqual([1]);
  expect(errorCaught).toBe(true);
});
