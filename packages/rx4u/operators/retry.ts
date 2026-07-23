import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Retry operator - automatically retries when error occurs.
 * Cancels the previous subscription before each retry.
 *
 * @param count Number of retries, defaults to 3
 * @returns Operator function
 */
export function retry<T>(count = 3): Operator<T, T> {
  return (source: Sub<T>): Sub<T> => {
    return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const subscriber: Subscriber<T> = [next, error, complete];
      let retryCount = 0;
      let unsub: Unsub | null = null;
      let isSubscribed = true;

      doSubscribe();

      function doSubscribe() {
        if (!isSubscribed) {
          return;
        }

        unsub?.();
        unsub = source(
          next
            ? (value: T) => {
                if (isSubscribed) {
                  callNext(subscriber, value);
                }
              }
            : undefined,
          (err: unknown) => {
            if (!isSubscribed) {
              return;
            }
            if (retryCount < count) {
              retryCount++;
              queueMicrotask(doSubscribe);
            } else {
              error?.(err);
            }
          },
          () => {
            if (isSubscribed) {
              complete?.();
            }
          }
        );
      }

      return function unsubscribe() {
        isSubscribed = false;
        unsub?.();
      };
    };
  };
}
