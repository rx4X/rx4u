import {expect, test, vi} from 'vitest';
import {pipeFrom} from './pipeFrom';
import {from} from './creations/from';
import {fromPromise} from './creations/fromPromise';
import {of} from './creations/of';
import {filter} from './operators/filter';
import {map} from './operators/map';

test('basic pipe functionality', async () => {
  const results: number[] = [];

  const data$ = pipeFrom(
    fromPromise(() => Promise.resolve(10)),
    filter((a: number) => a !== null),
    map((a: number) => a * 3)
  );

  await new Promise<void>((resolve) => {
    const unsub = data$(
      (data) => {
        results.push(data);
      },
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([30]);
});

test('single operator subscription', async () => {
  const results: number[] = [];

  const data$ = fromPromise(() => Promise.resolve(42));

  await new Promise<void>((resolve) => {
    const unsub = data$(
      (data) => {
        results.push(data);
      },
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([42]);
});

test('lazy execution - only executes on subscription', () => {
  const mockFn = vi.fn(() => 42);

  // Create stream but don't subscribe
  const data$ = from(mockFn);

  // Function should not be called
  expect(mockFn).not.toHaveBeenCalled();

  // Only executes after subscription
  const unsub = data$(() => {});
  expect(mockFn).toHaveBeenCalledTimes(1);
});

test('multiple subscriptions are independent by default', async () => {
  const mockFn = vi.fn(() => Math.random());
  const data$ = from(mockFn);

  const results1: number[] = [];
  const results2: number[] = [];

  await Promise.all([
    new Promise<void>((resolve) => {
      data$(
        (data) => results1.push(data),
        undefined,
        () => resolve()
      );
    }),
    new Promise<void>((resolve) => {
      data$(
        (data) => results2.push(data),
        undefined,
        () => resolve()
      );
    }),
  ]);

  // Each subscription should execute independently
  expect(mockFn).toHaveBeenCalledTimes(2);
  expect(results1[0]).not.toBe(results2[0]);
});

test('unsubscription works correctly', () => {
  const mockNext = vi.fn();
  const data$ = of(1, 2, 3);

  const unsub = data$(mockNext);
  unsub(); // Directly call unsubscribe function

  // Need to wait due to async emission
  setTimeout(() => {
    expect(mockNext).not.toHaveBeenCalled();
  }, 10);
});
