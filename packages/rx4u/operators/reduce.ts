import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Reduce operator - applies an accumulator to all values and emits only the final result on completion.
 *
 * @param accumulator Accumulator function
 * @param seed Optional initial value
 * @returns Operator function
 */
export function reduce<T, R = T>(accumulator: (acc: R, value: T, index: number) => R, seed?: R): Operator<T, R> {
  return (source: Sub<T>): Sub<R> => {
    return function (next?: NextAction<R>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const subscriber: Subscriber<R> = [next, error, complete];
      let acc: R;
      let hasAcc = seed !== undefined;
      let index = 0;
      let isUnsubscribed = false;

      if (hasAcc) {
        acc = seed as R;
      }

      const unsub = source(
        next
          ? (value: T) => {
              if (isUnsubscribed) {
                return;
              }
              try {
                if (hasAcc) {
                  acc = accumulator(acc, value, index++);
                } else {
                  acc = value as unknown as R;
                  hasAcc = true;
                }
              } catch (err) {
                isUnsubscribed = true;
                error?.(err);
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
          if (!hasAcc) {
            error?.(new Error('Reduce of empty sequence with no initial value'));
          } else {
            try {
              callNext(subscriber, acc);
            } catch (err) {
              error?.(err);
              return;
            }
            complete?.();
          }
        }
      );

      return function unsubscribe() {
        isUnsubscribed = true;
        unsub();
      };
    };
  };
}
