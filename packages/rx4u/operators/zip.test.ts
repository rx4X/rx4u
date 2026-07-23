import {expect, test} from 'vitest';
import {zip} from './zip';
import {of} from '@/creations/of';

test('zip pairs values by index', async () => {
  const source1 = of(1, 2, 3);
  const source2 = of('a', 'b', 'c');
  const zipped$ = zip(source1, source2);

  const results: [number, string][] = [];

  await new Promise<void>((resolve) => {
    zipped$(
      (value) => results.push(value),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([
    [1, 'a'],
    [2, 'b'],
    [3, 'c'],
  ]);
});

test('zip completes when shortest source completes', async () => {
  const source1 = of(1, 2, 3, 4, 5);
  const source2 = of('a', 'b');
  const zipped$ = zip(source1, source2);

  const results: [number, string][] = [];

  await new Promise<void>((resolve) => {
    zipped$(
      (value) => results.push(value),
      undefined,
      () => resolve()
    );
  });

  // zip should complete when the shortest source completes
  expect(results).toEqual([
    [1, 'a'],
    [2, 'b'],
  ]);
});

test('zip handles empty sources', async () => {
  const source1 = of();
  const source2 = of(1, 2, 3);
  const zipped$ = zip(source1, source2);

  const results: any[] = [];
  let completed = false;

  await new Promise<void>((resolve) => {
    zipped$(
      (value) => results.push(value),
      undefined,
      () => {
        completed = true;
        resolve();
      }
    );
  });

  // If there's an empty source, zip should complete immediately without emitting any values
  expect(results).toEqual([]);
  expect(completed).toBe(true);
});

test('zip with single source', async () => {
  const source1 = of(1, 2, 3);
  const zipped$ = zip(source1);

  const results: [number][] = [];

  await new Promise<void>((resolve) => {
    zipped$(
      (value) => results.push(value),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([[1], [2], [3]]);
});
