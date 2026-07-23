import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * TakeWhile operator - emits values so long as each value satisfies the predicate,
 * then completes as soon as the predicate is not satisfied.
 *
 * @param predicate A function that evaluates each emitted value.
 * @param inclusive If true, the value that caused the predicate to return false will also be emitted.
 * @returns An Observable that emits values while the predicate is satisfied, then completes.
 */
export function takeWhile<T>(predicate: (value: T, index: number) => boolean, inclusive = false): Operator<T, T> {
  return (source: Sub<T>) => {
    return (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
      const subscriber: Subscriber<T> = [next, error, complete];
      let index = 0;
      let isUnsubscribed = false;
      let unsubSource: Unsub | null = null;

      function doComplete() {
        if (isUnsubscribed) {
          return;
        }
        isUnsubscribed = true;
        unsubSource?.();
        complete?.();
      }

      unsubSource = source(
        next
          ? (value: T) => {
              if (isUnsubscribed) {
                return;
              }
              try {
                const result = predicate(value, index++);
                if (result) {
                  callNext(subscriber, value);
                } else {
                  if (inclusive) {
                    callNext(subscriber, value);
                  }
                  doComplete();
                }
              } catch (err) {
                isUnsubscribed = true;
                unsubSource?.();
                error?.(err);
              }
            }
          : undefined,
        (err: unknown) => {
          if (isUnsubscribed) {
            return;
          }
          isUnsubscribed = true;
          error?.(err);
        },
        () => {
          if (isUnsubscribed) {
            return;
          }
          isUnsubscribed = true;
          complete?.();
        }
      );

      return function unsubscribe() {
        isUnsubscribed = true;
        unsubSource?.();
      };
    };
  };
}
