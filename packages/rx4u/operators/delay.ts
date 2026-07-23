import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Delay operator - delays the emission of values by a specified time.
 * Tracks every pending timeout so rapid sources keep all delayed values
 * and unsubscribe/error can cancel all scheduled work.
 *
 * @param ms Delay duration in milliseconds
 * @returns Operator function
 */
export function delay<T = void>(ms: number): Operator<T, T> {
  return (source: Sub<T>): Sub<T> => {
    return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const subscriber: Subscriber<T> = [next, error, complete];
      const pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();
      let isUnsubscribed = false;
      let sourceCompleted = false;

      function cleanup(): void {
        pendingTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
        pendingTimeouts.clear();
      }

      function completeIfDone(): void {
        if (sourceCompleted && pendingTimeouts.size === 0 && !isUnsubscribed) {
          isUnsubscribed = true;
          complete?.();
        }
      }

      const unsub = source(
        next
          ? (value: T) => {
              if (isUnsubscribed) {
                return;
              }
              const timeoutId = setTimeout(() => {
                pendingTimeouts.delete(timeoutId);
                if (!isUnsubscribed) {
                  callNext(subscriber, value);
                  completeIfDone();
                }
              }, ms);
              pendingTimeouts.add(timeoutId);
            }
          : undefined,
        (err: unknown) => {
          if (isUnsubscribed) {
            return;
          }
          isUnsubscribed = true;
          cleanup();
          error?.(err);
        },
        () => {
          if (isUnsubscribed) {
            return;
          }
          sourceCompleted = true;
          completeIfDone();
        }
      );

      return function unsubscribe(): void {
        isUnsubscribed = true;
        cleanup();
        unsub();
      };
    };
  };
}
