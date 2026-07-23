import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Conditional retry operator - decides whether to retry based on a notifier stream.
 * Each time the notifier emits, the previous subscription is cancelled and a new one is created.
 *
 * @param notifier A function that receives an error stream and returns a notifier stream
 * @returns Operator function
 */
export function retryWhen<T>(notifier: (errors: Sub<unknown>) => Sub<unknown>): Operator<T, T> {
  return (source: Sub<T>): Sub<T> => {
    return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const subscriber: Subscriber<T> = [next, error, complete];
      let unsub: Unsub | null = null;
      let notifierUnsub: Unsub | null = null;
      let isSubscribed = true;
      let errorSubject: NextAction<unknown> | undefined;

      function teardown(): void {
        if (!isSubscribed) {
          return;
        }
        isSubscribed = false;
        unsub?.();
        notifierUnsub?.();
        errorSubject = undefined;
      }

      function errorNotifier(next?: NextAction<unknown>) {
        errorSubject = next;
        return function unsubscribeErrorNotifier() {
          errorSubject = undefined;
        };
      }

      try {
        const notifier$ = notifier(errorNotifier);
        notifierUnsub = notifier$(
          () => {
            if (isSubscribed) {
              doSubscribe();
            }
          },
          (err: unknown) => {
            if (isSubscribed) {
              teardown();
              error?.(err);
            }
          },
          () => {
            if (isSubscribed) {
              teardown();
              complete?.();
            }
          }
        );
      } catch (err) {
        error?.(err);
        return function unsubscribeEmpty() {};
      }

      doSubscribe();

      function doSubscribe() {
        if (!isSubscribed) {
          return;
        }

        unsub?.();
        unsub = source(
          next
            ? (value: T) => {
                if (isSubscribed) {
                  callNext(subscriber, value);
                }
              }
            : undefined,
          (err: unknown) => {
            if (!isSubscribed) {
              return;
            }
            if (errorSubject !== undefined) {
              errorSubject(err);
            } else {
              error?.(err);
            }
          },
          () => {
            if (isSubscribed) {
              teardown();
              complete?.();
            }
          }
        );
      }

      return function unsubscribe() {
        teardown();
      };
    };
  };
}
