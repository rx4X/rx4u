import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Distinct until changed operator - only emits when value differs from previous value.
 *
 * @param compareFn Optional comparison function (default: ===)
 * @param keySelector Optional key selector function
 * @returns Operator function
 */
export function distinctUntilChanged<T, K = T>(compareFn?: (a: K, b: K) => boolean, keySelector?: (value: T) => K): Operator<T, T> {
  return (source: Sub<T>): Sub<T> => {
    return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const compare = compareFn ?? ((a: K, b: K) => a === b);
      const selectKey = keySelector ?? ((value: T) => value as unknown as K);
      const subscriber: Subscriber<T> = [next, error, complete];

      let hasValue = false;
      let lastKey: K;
      let isUnsubscribed = false;

      return source(
        next
          ? (value: T) => {
              if (isUnsubscribed) {
                return;
              }
              const currentKey = selectKey(value);
              if (!hasValue || !compare(currentKey, lastKey)) {
                hasValue = true;
                lastKey = currentKey;
                callNext(subscriber, value);
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
    };
  };
}
