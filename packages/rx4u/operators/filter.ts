import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Filter operator - only emits values that satisfy the condition.
 * Supports type guard predicates for automatic type narrowing.
 *
 * @param predicate Filter condition function (can be a type guard)
 * @returns Operator function
 */
export function filter<T, S extends T>(predicate: (value: T) => value is S): Operator<T, S>;
export function filter<T>(predicate: (value: T) => boolean): Operator<T, T>;
export function filter<T>(predicate: (value: T) => boolean): Operator<T, T> {
  return (source: Sub<T>) => {
    return (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
      const subscriber: Subscriber<T> = [next, error, complete];
      const onNext = next
        ? (value: T) => {
            try {
              if (predicate(value)) {
                callNext(subscriber, value);
              }
            } catch (err) {
              error?.(err);
            }
          }
        : undefined;

      return source(onNext, error, complete);
    };
  };
}
