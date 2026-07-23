import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Catch error operator - switches to a fallback stream when an error occurs.
 * Cancels the previous subscription before switching to the new stream.
 *
 * @param selector Error handling function that receives the error and the caught stream, returns a fallback stream
 * @returns Operator function
 */
export function catchError<T, R = T>(selector: (error: unknown, caught: Sub<T>) => Sub<R>): Operator<T, T | R> {
  return (source: Sub<T>): Sub<T | R> => {
    return function (next?: NextAction<T | R>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const subscriber: Subscriber<T | R> = [next, error, complete];
      let unsub: Unsub | null = null;
      let isSubscribed = true;

      doSubscribe(source as Sub<T | R>, false);

      function doSubscribe(sub: Sub<T | R>, isFallback: boolean) {
        if (!isSubscribed) {
          return;
        }

        unsub?.();
        unsub = sub(
          next
            ? (value: T | R) => {
                if (isSubscribed) {
                  callNext(subscriber, value);
                }
              }
            : undefined,
          (err: unknown) => {
            if (!isSubscribed) {
              return;
            }
            if (isFallback) {
              error?.(err);
              return;
            }
            try {
              const fallback = selector(err, source);
              doSubscribe(fallback as Sub<T | R>, true);
            } catch (selectorError) {
              error?.(selectorError);
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
