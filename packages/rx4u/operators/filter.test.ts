import {expect, test} from 'vitest';
import {filter} from './filter';
import {of} from '@/creations/of';

test('filter keeps only values that pass predicate', async () => {
  const source = of(1, 2, 3, 4, 5);
  const filtered$ = filter((x: number) => x % 2 === 0)(source);

  const results: number[] = [];

  await new Promise<void>((resolve) => {
    filtered$(
      (value) => results.push(value),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([2, 4]);
});

test('filter with null check', async () => {
  const source = of(1, null, 3, undefined, 5);
  const filtered$ = filter((x: any) => x != null)(source);

  const results: any[] = [];

  await new Promise<void>((resolve) => {
    filtered$(
      (value) => results.push(value),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1, 3, 5]);
});
