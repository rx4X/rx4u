import {expect, test} from 'vitest';
import {pipeFrom} from '@/pipeFrom';
import {take} from '@/operators/take';
import {interval} from './interval';

test('interval emits sequential numbers', async () => {
  const results: number[] = [];
  const data$ = pipeFrom(interval(10), take(3));

  await new Promise<void>((resolve) => {
    const unsub = data$(
      (data) => {
        results.push(data);
      },
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([0, 1, 2]);
});

test('interval starts from 0', async () => {
  const results: number[] = [];
  const data$ = pipeFrom(interval(5), take(1));

  await new Promise<void>((resolve) => {
    const unsub = data$(
      (data) => {
        results.push(data);
      },
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([0]);
});

test('interval unsubscription stops emission', async () => {
  const results: number[] = [];
  const data$ = interval(10);

  const unsub = data$((data: number) => {
    results.push(data);
  });

  // Wait for some emissions
  await new Promise((resolve) => setTimeout(resolve, 25));

  // Unsubscribe
  unsub();

  const countBeforeUnsub = results.length;

  // Wait for more time
  await new Promise((resolve) => setTimeout(resolve, 25));

  // Should have no new emissions
  expect(results.length).toBe(countBeforeUnsub);
});

test('interval with different periods', async () => {
  const results1: number[] = [];
  const results2: number[] = [];

  const data1$ = pipeFrom(interval(5), take(2));
  const data2$ = pipeFrom(interval(20), take(2));

  const start = Date.now();

  await Promise.all([
    new Promise<void>((resolve) => {
      data1$(
        (data) => results1.push(data),
        undefined,
        () => resolve()
      );
    }),
    new Promise<void>((resolve) => {
      data2$(
        (data) => results2.push(data),
        undefined,
        () => resolve()
      );
    }),
  ]);

  const elapsed = Date.now() - start;

  expect(results1).toEqual([0, 1]);
  expect(results2).toEqual([0, 1]);
  // The faster interval should complete first
  expect(elapsed).toBeGreaterThan(20);
});
