import {expect, test, vi} from 'vitest';
import {of} from './of';

test('of creates observable from values', async () => {
  const results: number[] = [];
  const data$ = of(1, 2, 3);

  await new Promise<void>((resolve) => {
    data$(
      (data: number) => {
        results.push(data);
      },
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1, 2, 3]);
});

test('of creates observable from single value', async () => {
  const results: number[] = [];
  const data$ = of(42);

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

test('of creates empty observable when no values provided', async () => {
  const results: any[] = [];
  let completed = false;
  const data$ = of();

  await new Promise<void>((resolve) => {
    const unsub = data$(
      (data) => {
        results.push(data);
      },
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

test('of unsubscription works correctly', async () => {
  const mockNext = vi.fn();
  const data$ = of(1, 2, 3);

  const unsub = data$(mockNext);
  unsub(); // Directly call unsubscribe function

  // Wait for microtasks to process
  await new Promise((resolve) => setTimeout(resolve, 0));

  // Since we unsubscribed immediately, no values should be emitted
  expect(mockNext).not.toHaveBeenCalled();
});

test('of handles different data types', async () => {
  const results: any[] = [];
  const data$ = of<any>('hello', 42, true, null, undefined);

  await new Promise<void>((resolve) => {
    const unsub = data$(
      (data) => {
        results.push(data);
      },
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual(['hello', 42, true, null, undefined]);
});
