import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * EndWith operator - emits specified values after the source stream completes.
 * Useful for appending final values or completion markers.
 *
 * @param values Values to emit after the source completes
 * @returns Operator function
 */
export function endWith<T>(...values: T[]): Operator<T, T> {
  return function (source: Sub<T>): Sub<T> {
    return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const subscriber: Subscriber<T> = [next, error, complete];
      let isSubscribed = true;

      const unsub = source(
        next
          ? (value: T) => {
              if (isSubscribed) {
                callNext(subscriber, value);
              }
            }
          : undefined,
        (err: unknown) => {
          if (isSubscribed) {
            error?.(err);
          }
        },
        () => {
          if (!isSubscribed) {
            return;
          }

          for (const value of values) {
            if (!isSubscribed) {
              break;
            }
            callNext(subscriber, value);
          }

          if (isSubscribed) {
            complete?.();
          }
        }
      );

      return function unsubscribe(): void {
        isSubscribed = false;
        unsub();
      };
    };
  };
}
