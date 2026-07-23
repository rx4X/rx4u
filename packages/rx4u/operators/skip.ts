import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Skip operator - skips the first n values from the source stream.
 *
 * @param count Number of values to skip
 * @returns Operator function
 */
export function skip<T>(count: number): Operator<T, T> {
  return (source: Sub<T>): Sub<T> => {
    return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const subscriber: Subscriber<T> = [next, error, complete];
      let skipped = 0;
      let isUnsubscribed = false;

      const unsub = source(
        next
          ? (value: T) => {
              if (isUnsubscribed) {
                return;
              }
              if (skipped >= count) {
                callNext(subscriber, value);
              } else {
                skipped++;
              }
            }
          : undefined,
        (err: unknown) => {
          if (isUnsubscribed) {
            return;
          }
          error?.(err);
        },
        () => {
          if (isUnsubscribed) {
            return;
          }
          complete?.();
        }
      );

      return function unsubscribe() {
        isUnsubscribed = true;
        unsub();
      };
    };
  };
}
