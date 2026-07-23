import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * TakeUntil operator - emits values from the source until the notifier emits.
 *
 * @param notifier Observable whose first emission causes the output to stop.
 * @returns An Observable that emits source values until notifier fires.
 */
export function takeUntil<T>(notifier: Sub<unknown>): Operator<T, T> {
  return (source: Sub<T>) => {
    return (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
      const subscriber: Subscriber<T> = [next, error, complete];
      let isUnsubscribed = false;
      let unsubNotifier: Unsub | null = null;
      let unsubSource: Unsub | null = null;

      function teardown() {
        if (isUnsubscribed) {
          return;
        }
        isUnsubscribed = true;
        unsubNotifier?.();
        unsubSource?.();
        complete?.();
      }

      unsubNotifier = notifier(
        () => teardown(),
        (err: unknown) => {
          if (isUnsubscribed) {
            return;
          }
          isUnsubscribed = true;
          unsubSource?.();
          error?.(err);
        }
      );

      if (isUnsubscribed) {
        unsubNotifier();
        return function unsubscribeTerminated() {};
      }

      unsubSource = source(
        next
          ? (value: T) => {
              if (isUnsubscribed) {
                return;
              }
              callNext(subscriber, value);
            }
          : undefined,
        (err: unknown) => {
          if (isUnsubscribed) {
            return;
          }
          isUnsubscribed = true;
          unsubNotifier?.();
          error?.(err);
        },
        () => {
          if (isUnsubscribed) {
            return;
          }
          isUnsubscribed = true;
          unsubNotifier?.();
          complete?.();
        }
      );
      if (isUnsubscribed) {
        unsubSource();
      }

      return function unsubscribe() {
        if (isUnsubscribed) {
          return;
        }
        isUnsubscribed = true;
        unsubNotifier?.();
        unsubSource?.();
      };
    };
  };
}
