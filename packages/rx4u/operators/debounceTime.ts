import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber, Timer} from '@/types';
import {callNext, clearTimer} from '@/util';

/**
 * DebounceTime operator - delays emission until no new values arrive within the specified time.
 * Only the most recent value is emitted after the quiet period.
 *
 * @param delay Time in milliseconds to wait before emitting
 * @returns Operator function
 */
export function debounceTime<T>(delay: number): Operator<T, T> {
  return (source: Sub<T>): Sub<T> => {
    return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const subscriber: Subscriber<T> = [next, error, complete];
      let timeoutId: Timer | null = null;
      let lastValue: T | undefined;
      let hasValue = false;
      let isCompleted = false;

      const unsub = source(
        next
          ? (value: T) => {
              if (isCompleted) {
                return;
              }

              lastValue = value;
              hasValue = true;
              timeoutId = clearTimer(timeoutId);
              timeoutId = setTimeout(emitValue, delay);
            }
          : undefined,
        (err: unknown) => {
          timeoutId = clearTimer(timeoutId);
          isCompleted = true;
          error?.(err);
        },
        () => {
          isCompleted = true;
          timeoutId = clearTimer(timeoutId);

          if (hasValue) {
            callNext(subscriber, lastValue as T);
          }

          complete?.();
        }
      );

      function emitValue(): void {
        if (hasValue && !isCompleted) {
          callNext(subscriber, lastValue as T);
          hasValue = false;
        }
        timeoutId = null;
      }

      return function unsubscribe(): void {
        timeoutId = clearTimer(timeoutId);
        isCompleted = true;
        hasValue = false;
        lastValue = undefined;
        unsub();
      };
    };
  };
}
