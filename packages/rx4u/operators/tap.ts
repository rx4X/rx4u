import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction} from '@/types';

/**
 * Tap operator - executes side effects for each emission without modifying the stream.
 * Useful for debugging, logging, or triggering external actions.
 *
 * @param tapFn Side effect function called with each emitted value
 * @returns Operator function
 */
export function tap<T>(tapFn: (value: T) => void): Operator<T, T> {
  return function (source: Sub<T>) {
    return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      return source(
        next
          ? (value: T) => {
              try {
                tapFn(value);
                next(value);
              } catch (err) {
                error?.(err);
              }
            }
          : undefined,
        error,
        complete
      );
    };
  };
}
