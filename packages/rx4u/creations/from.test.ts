import {expect, test, vi} from 'vitest';
import {from} from './from';

test('from creates observable from function', async () => {
  const results: number[] = [];
  const data$ = from(() => 10);

  await new Promise<void>((resolve) => {
    const unsub = data$(
      (data) => {
        results.push(data);
      },
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([10]);
});

test('from lazy execution - only executes on subscription', () => {
  const mockFn = vi.fn(() => 42);

  // Create stream but don't subscribe
  const data$ = from(mockFn);

  // Function should not be called
  expect(mockFn).not.toHaveBeenCalled();

  // Only executes after subscription
  const unsub = data$(() => {});
  expect(mockFn).toHaveBeenCalledTimes(1);
});

test('from multiple subscriptions are independent', async () => {
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
