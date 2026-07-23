import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Take only the first n values from the source stream.
 * Once the count is reached, the source subscription is cancelled.
 *
 * @param count Number of values to take
 * @returns Operator function
 */
export function take<T>(count: number): Operator<T, T> {
  return (source: Sub<T>): Sub<T> => {
    return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const subscriber: Subscriber<T> = [next, error, complete];
      let taken = 0;
      let unsub: Unsub = () => {};
      let isDone = false;
      let shouldUnsub = false;

      if (count <= 0) {
        complete?.();
        return unsub;
      }

      unsub = source(
        next
          ? (value: T) => {
              if (!isDone && taken < count) {
                callNext(subscriber, value);
                taken++;
                if (taken === count) {
                  isDone = true;
                  complete?.();
                  shouldUnsub = true;
                  unsub();
                }
              }
            }
          : undefined,
        (err: unknown) => {
          if (!isDone) {
            isDone = true;
            error?.(err);
          }
        },
        () => {
          if (!isDone) {
            isDone = true;
            complete?.();
          }
        }
      );

      // Handle the case where source emitted synchronously and reached count
      // before unsub was assigned
      if (shouldUnsub) {
        unsub?.();
      }

      return function unsubscribe() {
        isDone = true;
        unsub();
      };
    };
  };
}
