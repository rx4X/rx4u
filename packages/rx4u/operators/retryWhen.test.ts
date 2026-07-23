import {expect, test} from 'vitest';
import type {Sub, NextAction, ErrorAction, CompleteAction} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {of} from '@/creations/of';
import {retryWhen} from './retryWhen';

test('retryWhen retries on error when notifier emits', async () => {
  let attemptCount = 0;
  const error$: Sub<string> = (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction) => {
    attemptCount++;
    next?.(`attempt-${attemptCount}`);
    if (attemptCount < 3) {
      error?.(new Error(`Error on attempt ${attemptCount}`));
    } else {
      next?.('success');
      complete?.();
    }
    return function () {};
  };

  const results: string[] = [];
  let completed = false;

  const data$ = pipeFrom(
    error$,
    retryWhen((errors: Sub<any>) => {
      let retryCount = 0;
      return (next?: NextAction<any>, error?: ErrorAction, complete?: CompleteAction) => {
        const unsub = errors(
          (err: any) => {
            retryCount++;
            if (retryCount <= 2) {
              next?.(err); // Trigger retry
            } else {
              error?.(err); // Stop retry
            }
          },
          error,
          complete
        );
        return unsub;
      };
    })
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: string) => results.push(data),
      undefined,
      () => {
        completed = true;
        resolve();
      }
    );
  });

  expect(results).toEqual(['attempt-1', 'attempt-2', 'attempt-3', 'success']);
  expect(completed).toBe(true);
  expect(attemptCount).toBe(3);
});

test('retryWhen stops retrying when notifier completes', async () => {
  let attemptCount = 0;
  const error$: Sub<string> = (next?: NextAction<string>, error?: ErrorAction) => {
    attemptCount++;
    next?.(`attempt-${attemptCount}`);
    error?.(new Error(`Error on attempt ${attemptCount}`));
    return function () {};
  };

  const results: string[] = [];
  let errorCaught = false;
  let completed = false;

  const data$ = pipeFrom(
    error$,
    retryWhen((errors: Sub<any>) => {
      let retryCount = 0;
      return (next?: NextAction<any>, error?: ErrorAction, complete?: CompleteAction) => {
        const unsub = errors(
          (err: any) => {
            retryCount++;
            if (retryCount <= 1) {
              next?.(err); // Retry once
            } else {
              complete?.(); // Complete, stop retry
            }
          },
          error,
          complete
        );
        return unsub;
      };
    })
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: string) => results.push(data),
      (err) => {
        errorCaught = true;
        resolve();
      },
      () => {
        completed = true;
        resolve();
      }
    );
  });

  expect(results).toEqual(['attempt-1', 'attempt-2']);
  expect(completed).toBe(true);
  expect(errorCaught).toBe(false);
  expect(attemptCount).toBe(2);
});

test('retryWhen with delayed retry', async () => {
  let attemptCount = 0;
  const error$: Sub<string> = (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction) => {
    attemptCount++;
    next?.(`attempt-${attemptCount}`);
    if (attemptCount < 2) {
      error?.(new Error(`Error on attempt ${attemptCount}`));
    } else {
      next?.('success');
      complete?.();
    }
    return function () {};
  };

  const results: string[] = [];
  const timestamps: number[] = [];
  const startTime = Date.now();

  const data$ = pipeFrom(
    error$,
    retryWhen((errors: Sub<any>) => {
      return (next?: NextAction<any>, error?: ErrorAction, complete?: CompleteAction) => {
        const unsub = errors(
          (err: any) => {
            // Delay 50ms before retry
            setTimeout(() => next?.(err), 50);
          },
          error,
          complete
        );
        return unsub;
      };
    })
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: string) => {
        results.push(data);
        timestamps.push(Date.now() - startTime);
      },
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual(['attempt-1', 'attempt-2', 'success']);
  expect(attemptCount).toBe(2);
  // Verify delay effect
  expect(timestamps[1] - timestamps[0]).toBeGreaterThan(40);
});

test('retryWhen propagates notifier errors', async () => {
  const error$: Sub<string> = (next?: NextAction<string>, error?: ErrorAction) => {
    next?.('attempt-1');
    error?.(new Error('Source error'));
    return function () {};
  };

  const results: string[] = [];
  let errorCaught = false;
  let caughtError: any;

  const data$ = pipeFrom(
    error$,
    retryWhen((errors: Sub<any>) => {
      return (next?: NextAction<any>, error?: ErrorAction) => {
        const unsub = errors((err: any) => {
          // Notifier itself has error
          error?.(new Error('Notifier error'));
        }, error);
        return unsub;
      };
    })
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: string) => results.push(data),
      (err) => {
        errorCaught = true;
        caughtError = err;
        resolve();
      }
    );
  });

  expect(results).toEqual(['attempt-1']);
  expect(errorCaught).toBe(true);
  expect(caughtError.message).toBe('Notifier error');
});

test('retryWhen passes through successful observables', async () => {
  const results: number[] = [];
  let completed = false;

  const data$ = pipeFrom(
    of(1, 2, 3),
    retryWhen((errors: Sub<any>) => {
      return (next?: NextAction<any>, error?: ErrorAction, complete?: CompleteAction) => {
        // This notifier should not be called because source stream has no errors
        const unsub = errors((err: any) => next?.(err), error, complete);
        return unsub;
      };
    })
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => {
        completed = true;
        resolve();
      }
    );
  });

  expect(results).toEqual([1, 2, 3]);
  expect(completed).toBe(true);
});

test('retryWhen with conditional retry based on error type', async () => {
  let attemptCount = 0;
  const error$: Sub<string> = (next?: NextAction<string>, error?: ErrorAction) => {
    attemptCount++;
    next?.(`attempt-${attemptCount}`);

    if (attemptCount === 1) {
      error?.(new Error('RetryableError'));
    } else if (attemptCount === 2) {
      error?.(new Error('FatalError'));
    }
    return function () {};
  };

  const results: string[] = [];
  let errorCaught = false;
  let caughtError: any;

  const data$ = pipeFrom(
    error$,
    retryWhen((errors: Sub<any>) => {
      return (next?: NextAction<any>, error?: ErrorAction, complete?: CompleteAction) => {
        const unsub = errors(
          (err: any) => {
            if ((err instanceof Error ? err.message : String(err)) === 'RetryableError') {
              next?.(err); // Retry
            } else {
              error?.(err); // Don't retry, propagate error
            }
          },
          error,
          complete
        );
        return unsub;
      };
    })
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: string) => results.push(data),
      (err) => {
        errorCaught = true;
        caughtError = err;
        resolve();
      }
    );
  });

  expect(results).toEqual(['attempt-1', 'attempt-2']);
  expect(errorCaught).toBe(true);
  expect(caughtError.message).toBe('FatalError');
  expect(attemptCount).toBe(2);
});

test('retryWhen handles notifier creation error', async () => {
  const error$: Sub<string> = (next?: NextAction<string>, error?: ErrorAction) => {
    next?.('attempt-1');
    error?.(new Error('Source error'));
    return function () {};
  };

  const results: string[] = [];
  let errorCaught = false;
  let caughtError: any;

  const data$ = pipeFrom(
    error$,
    retryWhen(() => {
      throw new Error('Notifier creation error');
    })
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: string) => results.push(data),
      (err) => {
        errorCaught = true;
        caughtError = err;
        resolve();
      }
    );
  });

  // When notifier creation fails, source stream won't be subscribed, so no values
  expect(results).toEqual([]);
  expect(errorCaught).toBe(true);
  expect(caughtError.message).toBe('Notifier creation error');
});

test('retryWhen unsubscription cleans up resources', async () => {
  let sourceUnsubscribed = false;
  let notifierUnsubscribed = false;

  const error$: Sub<string> = (next?: NextAction<string>, error?: ErrorAction) => {
    next?.('attempt-1');
    error?.(new Error('Source error'));
    return function () {
      sourceUnsubscribed = true;
    };
  };

  const data$ = pipeFrom(
    error$,
    retryWhen((errors: Sub<any>) => {
      return (next?: NextAction<any>, error?: ErrorAction, complete?: CompleteAction) => {
        const unsub = errors(
          (err: any) => {
            // Don't retry, keep it in waiting state
          },
          error,
          complete
        );
        return function () {
          notifierUnsubscribed = true;
          unsub();
        };
      };
    })
  );

  const unsubscribe = data$(
    () => {},
    () => {}
  );

  // Wait a short time to ensure error is handled
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Unsubscribe
  unsubscribe();

  expect(sourceUnsubscribed).toBe(true);
  expect(notifierUnsubscribed).toBe(true);
});

test('retryWhen with immediate retry', async () => {
  let attemptCount = 0;
  const error$: Sub<string> = (next?: NextAction<string>, error?: ErrorAction, complete?: CompleteAction) => {
    attemptCount++;
    next?.(`attempt-${attemptCount}`);
    if (attemptCount < 3) {
      error?.(new Error(`Error on attempt ${attemptCount}`));
    } else {
      next?.('success');
      complete?.();
    }
    return function () {};
  };

  const results: string[] = [];
  let completed = false;

  const data$ = pipeFrom(
    error$,
    retryWhen((errors: Sub<any>) => {
      return (next?: NextAction<any>, error?: ErrorAction, complete?: CompleteAction) => {
        const unsub = errors(
          (err: any) => {
            // Immediate retry
            next?.(err);
          },
          error,
          complete
        );
        return unsub;
      };
    })
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: string) => results.push(data),
      undefined,
      () => {
        completed = true;
        resolve();
      }
    );
  });

  expect(results).toEqual(['attempt-1', 'attempt-2', 'attempt-3', 'success']);
  expect(completed).toBe(true);
  expect(attemptCount).toBe(3);
});
