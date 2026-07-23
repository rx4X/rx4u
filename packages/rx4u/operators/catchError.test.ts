import {expect, test} from 'vitest';
import type {Sub, NextAction, ErrorAction} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {of} from '@/creations/of';
import {catchError} from './catchError';

test('catchError catches errors and returns fallback observable', async () => {
  const error$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction) => {
    next?.(1);
    error?.(new Error('Test error'));
    return function () {};
  };

  const results: any[] = [];
  let completed = false;

  const data$ = pipeFrom(
    error$,
    catchError((err) => of('fallback', 'value'))
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: any) => results.push(data),
      undefined,
      () => {
        completed = true;
        resolve();
      }
    );
  });

  expect(results).toEqual([1, 'fallback', 'value']);
  expect(completed).toBe(true);
});

test('catchError passes through values when no error occurs', async () => {
  const results: number[] = [];
  let completed = false;

  const data$ = pipeFrom(
    of(1, 2, 3),
    catchError((err) => of(999))
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

test('catchError can re-throw errors', async () => {
  const error$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction) => {
    next?.(1);
    error?.(new Error('Original error'));
    return function () {};
  };

  const results: number[] = [];
  let errorCaught = false;

  const data$ = pipeFrom(
    error$,
    catchError((err) => {
      throw new Error('Re-thrown error');
    })
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      (err) => {
        errorCaught = true;
        expect(err instanceof Error ? err.message : String(err)).toBe('Re-thrown error');
        resolve();
      }
    );
  });

  expect(results).toEqual([1]);
  expect(errorCaught).toBe(true);
});

test('catchError receives error object in handler', async () => {
  const originalError = new Error('Test error with data');
  originalError.name = 'CustomError';

  const error$: Sub<any> = (next?: NextAction<any>, error?: ErrorAction) => {
    error?.(originalError);
    return function () {};
  };

  const results: string[] = [];

  const data$ = pipeFrom(
    error$,
    catchError((err) => {
      expect(err).toBe(originalError);
      expect(err instanceof Error ? err.name : String(err)).toBe('CustomError');
      return of(`Caught: ${err instanceof Error ? err.message : String(err)}`);
    })
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual(['Caught: Test error with data']);
});

test('catchError with empty fallback observable', async () => {
  const error$: Sub<number> = (next?: NextAction<number>, error?: ErrorAction) => {
    next?.(1);
    error?.(new Error('Test error'));
    return function () {};
  };

  const results: number[] = [];
  let completed = false;

  const data$: Sub<number> = pipeFrom(
    error$,
    catchError(() => of()) // Empty fallback
  );

  await new Promise<void>((resolve) => {
    data$(
      (data: number) => results.push(data),
      undefined,
      () => {
        completed = true;
        resolve();
      }
    );
  });

  expect(results).toEqual([1]);
  expect(completed).toBe(true);
});

test('catchError handles multiple errors in sequence', async () => {
  const error1$: Sub<any> = (next?: NextAction<any>, error?: ErrorAction) => {
    error?.(new Error('First error'));
    return function () {};
  };

  const error2$: Sub<any> = (next?: NextAction<any>, error?: ErrorAction) => {
    error?.(new Error('Second error'));
    return function () {};
  };

  const results: string[] = [];
  let finalErrorCaught = false;

  const data$ = pipeFrom(
    error1$,
    catchError((err) => {
      results.push(`First catch: ${err instanceof Error ? err.message : String(err)}`);
      return error2$;
    }),
    catchError((err) => {
      results.push(`Second catch: ${err instanceof Error ? err.message : String(err)}`);
      return of('final fallback');
    })
  );

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      () => {
        finalErrorCaught = true;
        resolve();
      },
      () => resolve()
    );
  });

  expect(results).toEqual(['First catch: First error', 'Second catch: Second error', 'final fallback']);
  expect(finalErrorCaught).toBe(false);
});
