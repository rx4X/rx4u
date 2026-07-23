import {expect, test} from 'vitest';
import type {Sub, Unsub, NextAction, ErrorAction, CompleteAction} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {throttleTime} from './throttleTime';

test('throttleTime emits first value and ignores subsequent values within duration', async () => {
  const results: number[] = [];
  const timestamps: number[] = [];
  const start = Date.now();

  const test$ = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    next?.(1);
    timestamps.push(Date.now() - start);

    setTimeout(() => {
      next?.(2); // Should be ignored
      timestamps.push(Date.now() - start);
    }, 10);

    setTimeout(() => {
      next?.(3); // Should be ignored
      timestamps.push(Date.now() - start);
    }, 20);

    setTimeout(() => {
      next?.(4); // Should be emitted (after 50ms)
      timestamps.push(Date.now() - start);
      complete?.();
    }, 60);

    return function () {};
  };

  const data$ = pipeFrom(
    test$,
    throttleTime(50) // 50ms throttle time
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1, 4]);
});

test('throttleTime with leading=false emits last value', async () => {
  const results: number[] = [];

  const test$ = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    next?.(1);

    setTimeout(() => next?.(2), 10);
    setTimeout(() => next?.(3), 20);
    setTimeout(() => next?.(4), 30);

    setTimeout(() => {
      next?.(5); // New throttle cycle
      complete?.();
    }, 80);

    return function () {};
  };

  const data$ = pipeFrom(test$, throttleTime(50, {leading: false, trailing: true}));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // Should emit the last value of each throttle cycle
  expect(results).toEqual([4, 5]);
});

test('throttleTime with both leading and trailing', async () => {
  const results: number[] = [];

  const test$ = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    next?.(1); // leading

    setTimeout(() => next?.(2), 10);
    setTimeout(() => next?.(3), 20); // trailing

    setTimeout(() => {
      next?.(4); // leading of new cycle
      complete?.();
    }, 80);

    return function () {};
  };

  const data$ = pipeFrom(test$, throttleTime(50, {leading: true, trailing: true}));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1, 3, 4]);
});

test('throttleTime with leading=false and trailing=false emits nothing', async () => {
  const results: number[] = [];

  const test$ = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    next?.(1);
    setTimeout(() => next?.(2), 10);
    setTimeout(() => next?.(3), 20);
    setTimeout(() => complete?.(), 80);

    return function () {};
  };

  const data$ = pipeFrom(test$, throttleTime(50, {leading: false, trailing: false}));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([]);
});

test('throttleTime with zero duration', async () => {
  const results: number[] = [];

  const test$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    next?.(1);
    next?.(2);
    next?.(3);
    complete?.();

    return function () {};
  };

  const data$ = pipeFrom(test$, throttleTime(0));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // Zero duration should let all values through
  expect(results).toEqual([1, 2, 3]);
});

test('throttleTime propagates errors', async () => {
  const error$ = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
    next?.(1);
    setTimeout(() => {
      error?.(new Error('Test error'));
    }, 10);

    return function () {};
  };

  const results: number[] = [];
  let errorCaught = false;

  const data$ = pipeFrom(error$, throttleTime(50));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
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

test('throttleTime handles rapid emissions correctly', async () => {
  const results: number[] = [];

  const test$ = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    // Rapidly emit multiple values
    for (let i = 1; i <= 10; i++) {
      setTimeout(() => next?.(i), i * 5); // One value every 5ms
    }

    setTimeout(() => complete?.(), 100);

    return function () {};
  };

  const data$ = pipeFrom(
    test$,
    throttleTime(30) // 30ms throttle
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // Should only emit the first value and values after throttle time
  expect(results.length).toBeLessThan(10);
  expect(results[0]).toBe(1);
});

test('throttleTime maintains subscription lifecycle', async () => {
  let sourceSubscribed = false;
  let sourceUnsubscribed = false;

  const test$ = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    sourceSubscribed = true;
    next?.(1);

    return function () {
      sourceUnsubscribed = true;
    };
  };

  const data$ = pipeFrom(test$, throttleTime(50));

  const unsubscribe = data$(() => {});

  await new Promise((resolve) => setTimeout(resolve, 10));

  unsubscribe();

  expect(sourceSubscribed).toBe(true);
  expect(sourceUnsubscribed).toBe(true);
});

test('throttleTime with leading+trailing does not duplicate when only one value in cycle', async () => {
  const results: number[] = [];

  const test$ = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    // Single value per cycle — should not be emitted twice
    next?.(1);
    setTimeout(() => {
      next?.(2); // New cycle, single value
      complete?.();
    }, 80);

    return function () {};
  };

  const data$ = pipeFrom(test$, throttleTime(50, {leading: true, trailing: true}));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  // Each value should appear only once (no duplication from trailing)
  expect(results).toEqual([1, 2]);
});

test('throttleTime with custom scheduler-like behavior', async () => {
  const results: number[] = [];
  const emissionTimes: number[] = [];
  const start = Date.now();

  const test$ = (next?: NextAction<number>, error?: ErrorAction, complete?: CompleteAction) => {
    next?.(1);
    emissionTimes.push(Date.now() - start);

    setTimeout(() => {
      next?.(2);
      emissionTimes.push(Date.now() - start);
    }, 25);

    setTimeout(() => {
      next?.(3);
      emissionTimes.push(Date.now() - start);
      complete?.();
    }, 75);

    return function () {};
  };

  const data$ = pipeFrom(test$, throttleTime(50));

  await new Promise<void>((resolve) => {
    data$(
      (data) => {
        results.push(data);
      },
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([1, 3]);
});
