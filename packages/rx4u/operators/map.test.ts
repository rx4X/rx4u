import {expect, test} from 'vitest';
import {map} from './map';
import {of} from '@/creations/of';

test('map transforms values correctly', async () => {
  const source = of(1, 2, 3);
  const mapped$ = map((x: number) => x * 2)(source);

  const results: number[] = [];

  await new Promise<void>((resolve) => {
    mapped$(
      (value) => results.push(value),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([2, 4, 6]);
});
