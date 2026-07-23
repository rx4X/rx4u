import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber, Timer} from '@/types';
import {callNext, clearTimer} from '@/util';

/**
 * Timeout operator - emits an error if no value is emitted within the specified time.
 *
 * @param ms Timeout duration in milliseconds
 * @param errorFactory Optional function to create a custom error
 * @returns Operator function
 */
export function timeout<T>(ms: number, errorFactory?: () => Error): Operator<T, T> {
  return function (source: Sub<T>): Sub<T> {
    return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const subscriber: Subscriber<T> = [next, error, complete];
      const createTimeoutError = errorFactory ?? (() => new Error(`Timeout after ${ms}ms`));
      let timeoutId: Timer | null = null;
      let unsub: Unsub = () => {};
      let isCompleted = false;
      let shouldUnsub = false;

      function terminateWithError(err: unknown): void {
        if (isCompleted) {
          return;
        }
        isCompleted = true;
        timeoutId = clearTimer(timeoutId);
        shouldUnsub = true;
        unsub();
        error?.(err);
      }

      resetTimeout();

      unsub = source(
        next
          ? (value: T) => {
              if (!isCompleted) {
                resetTimeout();
                callNext(subscriber, value);
              }
            }
          : undefined,
        (err: unknown) => {
          terminateWithError(err);
        },
        () => {
          if (!isCompleted) {
            isCompleted = true;
            timeoutId = clearTimer(timeoutId);
            complete?.();
          }
        }
      );
      if (shouldUnsub) {
        unsub();
      }

      function resetTimeout(): void {
        timeoutId = clearTimer(timeoutId);
        if (!isCompleted) {
          timeoutId = setTimeout(() => {
            terminateWithError(createTimeoutError());
          }, ms);
        }
      }

      return function unsubscribe(): void {
        isCompleted = true;
        timeoutId = clearTimer(timeoutId);
        unsub();
      };
    };
  };
}
