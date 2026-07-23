import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * withLatestFrom operator - combines source stream values with latest values from other streams.
 * Uses O(1) readyCount check instead of O(n) array scan.
 *
 * @param others Other streams to combine with
 * @returns Operator function
 */
export function withLatestFrom<T, U>(other: Sub<U>): Operator<T, [T, U]>;
export function withLatestFrom<T, U, V>(other1: Sub<U>, other2: Sub<V>): Operator<T, [T, U, V]>;
export function withLatestFrom<T, U, V, W>(other1: Sub<U>, other2: Sub<V>, other3: Sub<W>): Operator<T, [T, U, V, W]>;
export function withLatestFrom<T>(...others: Sub<any>[]): Operator<T, [T, ...any[]]> {
  return (source: Sub<T>) => {
    return function (next?: NextAction<[T, ...any[]]>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const latestValues: unknown[] = new Array(others.length);
      const hasEmitted: boolean[] = new Array(others.length).fill(false);
      const subscriber: Subscriber<[T, ...any[]]> = [next, error, complete];
      let readyCount = 0;
      let otherCompletedCount = 0;
      let sourceCompleted = false;
      let isUnsubscribed = false;

      const unsubs: Unsub[] = [];

      others.forEach((other, index) => {
        const unsub = other(
          (value: unknown) => {
            if (isUnsubscribed) {
              return;
            }
            latestValues[index] = value;
            if (!hasEmitted[index]) {
              hasEmitted[index] = true;
              readyCount++;
            }
          },
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
            otherCompletedCount++;
            if (sourceCompleted && otherCompletedCount === others.length) {
              complete?.();
            }
          }
        );
        unsubs.push(unsub);
      });

      const sourceUnsub = source(
        next
          ? (value: T) => {
              if (isUnsubscribed) {
                return;
              }
              if (readyCount >= others.length) {
                callNext(subscriber, [value, ...latestValues] as [T, ...any[]]);
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
          sourceCompleted = true;
          if (otherCompletedCount === others.length) {
            complete?.();
          }
        }
      );

      unsubs.push(sourceUnsub);

      return function unsubscribe() {
        if (isUnsubscribed) {
          return;
        }
        isUnsubscribed = true;
        unsubs.forEach((unsubFn) => unsubFn());
      };
    };
  };
}
