import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Scan operator - applies an accumulator function to each value and emits each intermediate result.
 *
 * @param accumulator Accumulator function
 * @param seed Optional initial value
 * @returns Operator function
 */
export function scan<T, R = T>(accumulator: (acc: R, value: T, index: number) => R, seed?: R): Operator<T, R> {
  return function (source: Sub<T>): Sub<R> {
    return function (next?: NextAction<R>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const subscriber: Subscriber<R> = [next, error, complete];
      let acc: R;
      let hasAcc = seed !== undefined;
      let index = 0;
      let isSubscribed = true;

      if (hasAcc) {
        acc = seed!;
      }

      const unsub = source(
        next
          ? (value: T) => {
              if (!isSubscribed) {
                return;
              }

              try {
                if (hasAcc) {
                  acc = accumulator(acc, value, index++);
                  callNext(subscriber, acc);
                } else {
                  acc = value as unknown as R;
                  hasAcc = true;
                  callNext(subscriber, acc);
                }
              } catch (err) {
                isSubscribed = false;
                unsub();
                error?.(err);
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
