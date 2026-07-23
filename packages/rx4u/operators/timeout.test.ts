import {expect, test} from 'vitest';
import type {Sub, Unsub, NextAction, ErrorAction, CompleteAction} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {of} from '@/creations/of';
import {timeout} from './timeout';

test('timeout emits error when no value within timeout period', async () => {
  let errorReceived: Error | null = null;
  const results: number[] = [];

  // Create a source that never emits
  const neverSource: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    return function () {}; // Never emits, never completes
  };

  const data$ = pipeFrom(neverSource, timeout(100));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      (err) => {
        errorReceived = err instanceof Error ? err : new Error(String(err));
        resolve();
      },
      () => resolve()
    );
  });

  expect(results).toEqual([]);
  expect(errorReceived).toBeInstanceOf(Error);
  expect((errorReceived as unknown as Error)?.message).toBe('Timeout after 100ms');
});

test('timeout does not emit error when values are emitted within timeout', async () => {
  const results: number[] = [];
  let errorReceived: Error | null = null;
  let completed = false;

  const data$ = pipeFrom(of(1, 2, 3), timeout(1000));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      (err) => {
        errorReceived = err instanceof Error ? err : new Error(String(err));
        resolve();
      },
      () => {
        completed = true;
        resolve();
      }
    );
  });

  expect(results).toEqual([1, 2, 3]);
  expect(errorReceived).toBeNull();
  expect(completed).toBe(true);
});

test('timeout resets timer on each emission', async () => {
  const results: number[] = [];
  let errorReceived: Error | null = null;
  let completed = false;

  // Create a source that emits every 50ms for 3 times
  const intervalSource: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    let count = 0;
    const interval = setInterval(() => {
      if (count < 3) {
        next?.(count++);
      } else {
        complete?.();
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  };

  const data$ = pipeFrom(intervalSource, timeout(100)); // 100ms timeout, but emits every 50ms

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      (err) => {
        errorReceived = err instanceof Error ? err : new Error(String(err));
        resolve();
      },
      () => {
        completed = true;
        resolve();
      }
    );
  });

  expect(results).toEqual([0, 1, 2]);
  expect(errorReceived).toBeNull();
  expect(completed).toBe(true);
});

test('timeout with custom error factory', async () => {
  let errorReceived: Error | null = null;
  const results: number[] = [];

  const neverSource: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    return function () {};
  };

  const customErrorFactory = () => new Error('Custom timeout error');
  const data$ = pipeFrom(neverSource, timeout(100, customErrorFactory));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      (err) => {
        errorReceived = err instanceof Error ? err : new Error(String(err));
        resolve();
      },
      () => resolve()
    );
  });

  expect(results).toEqual([]);
  expect(errorReceived).toBeInstanceOf(Error);
  expect((errorReceived as unknown as Error)?.message).toBe('Custom timeout error');
});

test('timeout handles source errors properly', async () => {
  let errorReceived: Error | null = null;
  const results: number[] = [];

  const errorSource: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    setTimeout(() => {
      error?.(new Error('Source error'));
    }, 50);
    return function () {};
  };

  const data$ = pipeFrom(errorSource, timeout(1000));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      (err) => {
        errorReceived = err instanceof Error ? err : new Error(String(err));
        resolve();
      },
      () => resolve()
    );
  });

  expect(results).toEqual([]);
  expect(errorReceived).toBeInstanceOf(Error);
  expect((errorReceived as unknown as Error)?.message).toBe('Source error');
});

test('timeout can be unsubscribed', async () => {
  const results: number[] = [];
  let errorReceived: Error | null = null;

  const neverSource: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    return function () {};
  };

  const data$ = pipeFrom(neverSource, timeout(200));

  const unsub = data$(
    (data) => results.push(data),
    (err) => {
      errorReceived = err instanceof Error ? err : new Error(String(err));
    },
    () => {}
  );

  // Unsubscribe before timeout
  setTimeout(() => {
    unsub();
  }, 100);

  // Wait longer than timeout to ensure no error is emitted
  await new Promise((resolve) => setTimeout(resolve, 300));

  expect(results).toEqual([]);
  expect(errorReceived).toBeNull();
});

test('timeout unsubscribes source after timeout error', async () => {
  let sourceUnsubscribed = false;
  let errorReceived: Error | null = null;

  const neverSource: Sub<number> = (): Unsub => {
    return function () {
      sourceUnsubscribed = true;
    };
  };

  const data$ = pipeFrom(neverSource, timeout(20));

  await new Promise<void>((resolve) => {
    data$(
      () => {},
      (err) => {
        errorReceived = err instanceof Error ? err : new Error(String(err));
        resolve();
      }
    );
  });

  expect(errorReceived).toBeInstanceOf(Error);
  expect(sourceUnsubscribed).toBe(true);
});

test('timeout cleans up a source that errors synchronously', () => {
  let cleanupCalls = 0;
  const source$: Sub<number> = (_next, error): Unsub => {
    error?.(new Error('source error'));
    return function unsubscribe() {
      cleanupCalls++;
    };
  };

  pipeFrom(source$, timeout(100))(undefined, () => {});

  expect(cleanupCalls).toBe(1);
});
