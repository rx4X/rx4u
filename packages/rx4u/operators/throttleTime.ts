import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber, Timer} from '@/types';
import {callNext, clearTimer} from '@/util';

/**
 * Throttle time operator - only emits the first value within each specified time window.
 * Supports leading/trailing configuration.
 *
 * @param duration Throttle duration in milliseconds
 * @param options Configuration for leading/trailing behavior
 * @returns Operator function
 */
export function throttleTime<T>(duration: number, options: {leading?: boolean; trailing?: boolean} = {}): Operator<T, T> {
  const {leading = true, trailing = false} = options;

  return (source: Sub<T>) => {
    return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const subscriber: Subscriber<T> = [next, error, complete];
      let throttleTimer: Timer | null = null;
      let lastValue: T | undefined;
      let hasTrailingValue = false;
      let isUnsubscribed = false;
      let emittedLeading = false;

      const unsub = source(
        next
          ? (value: T) => {
              if (isUnsubscribed) {
                return;
              }
              if (!leading && !trailing) {
                return;
              }

              if (duration === 0) {
                callNext(subscriber, value);
                return;
              }

              lastValue = value;

              if (!throttleTimer) {
                // Start of a new throttle cycle
                emittedLeading = false;

                if (leading) {
                  callNext(subscriber, value);
                  emittedLeading = true;
                }

                hasTrailingValue = !leading;

                throttleTimer = setTimeout(() => {
                  throttleTimer = null;

                  if (trailing && hasTrailingValue) {
                    // Avoid duplicating the leading value
                    if (!emittedLeading || lastValue !== value) {
                      callNext(subscriber, lastValue as T);
                    }
                  }

                  hasTrailingValue = false;
                  emittedLeading = false;
                }, duration);
              } else {
                // Within a throttle cycle, just track the latest value
                hasTrailingValue = true;
              }
            }
          : undefined,
        (err: unknown) => {
          if (isUnsubscribed) {
            return;
          }
          throttleTimer = clearTimer(throttleTimer);
          error?.(err);
        },
        () => {
          if (isUnsubscribed) {
            return;
          }
          if (trailing && hasTrailingValue && throttleTimer) {
            throttleTimer = clearTimer(throttleTimer);
            if (!emittedLeading || lastValue !== undefined) {
              callNext(subscriber, lastValue as T);
            }
          } else {
            throttleTimer = clearTimer(throttleTimer);
          }
          complete?.();
        }
      );

      return function unsubscribe() {
        isUnsubscribed = true;
        throttleTimer = clearTimer(throttleTimer);
        lastValue = undefined;
        unsub();
      };
    };
  };
}
