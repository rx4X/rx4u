import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Map operator - transforms each emitted value using a mapping function.
 *
 * @param mapFn Mapping function
 * @returns Operator function
 */
export function map<T, R>(mapFn: (value: T) => R): Operator<T, R> {
  return (source: Sub<T>) => {
    return (next?: NextAction<R>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
      const subscriber: Subscriber<R> = [next, error, complete];
      const onNext = next
        ? (value: T) => {
            try {
              callNext(subscriber, mapFn(value));
            } catch (err) {
              error?.(err);
            }
          }
        : undefined;

      return source(onNext, error, complete);
    };
  };
}
