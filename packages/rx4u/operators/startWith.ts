import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * StartWith operator - emits specified values before the source stream emits.
 * Useful for providing initial values or default states.
 *
 * @param values Values to emit before the source
 * @returns Operator function
 */
export function startWith<T>(...values: T[]): Operator<T, T> {
  return function (source: Sub<T>): Sub<T> {
    return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const subscriber: Subscriber<T> = [next, error, complete];
      let isSubscribed = true;

      for (const value of values) {
        callNext(subscriber, value);
      }

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
