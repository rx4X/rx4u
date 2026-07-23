import {expect, test, vi} from 'vitest';
import {share} from './share';
import {from} from '@/creations/from';

test('share operator allows multiple subscribers to share same source', async () => {
  const mockFn = vi.fn(() => 42); // Use fixed value for easier debugging
  const source = from(mockFn);
  const shared$ = share()(source);

  const results1: number[] = [];
  const results2: number[] = [];

  // Subscribe to the first one first
  const sub1 = shared$(
    (data: unknown) => {
      console.log('stream 1 received:', data);
      results1.push(data as number);
    },
    undefined,
    () => console.log('stream 1 completed')
  );

  // Subscribe to the second one immediately
  const sub2 = shared$(
    (data: unknown) => {
      console.log('stream 2 received:', data);
      results2.push(data as number);
    },
    undefined,
    () => console.log('stream 2 completed')
  );

  // Wait for async completion
  await new Promise((resolve) => setTimeout(resolve, 50));

  console.log('Results1:', results1);
  console.log('Results2:', results2);
  console.log('Mock called times:', mockFn.mock.calls.length);

  // Source function should only be called once
  expect(mockFn).toHaveBeenCalledTimes(1);
  // Two subscribers should receive the same value
  expect(results1).toEqual(results2);
  expect(results1.length).toBe(1);
});

test('share unsubscribes from source when all subscribers unsubscribe', async () => {
  const mockFn = vi.fn(() => 42);
  const source = from(mockFn);
  const shared$ = share()(source);

  const unsub1 = shared$(() => {});
  const unsub2 = shared$(() => {});

  // Wait for async startup to complete
  await new Promise((resolve) => setTimeout(resolve, 10));

  expect(mockFn).toHaveBeenCalledTimes(1);

  unsub1(); // Directly call unsubscribe function
  // Still has one subscriber, source should not unsubscribe

  unsub2(); // Directly call unsubscribe function
  // Now all subscribers are unsubscribed, source should be unsubscribed
});

test('share sends terminal completion to late subscribers without retaining them', async () => {
  const source = from(() => 42);
  const shared$ = share()(source);
  let firstCompleted = false;
  let lateCompleted = false;

  shared$(
    () => {},
    undefined,
    () => {
      firstCompleted = true;
    }
  );

  await new Promise((resolve) => setTimeout(resolve, 10));

  const lateUnsub = shared$(
    () => {},
    undefined,
    () => {
      lateCompleted = true;
    }
  );

  lateUnsub();

  expect(firstCompleted).toBe(true);
  expect(lateCompleted).toBe(true);
});
