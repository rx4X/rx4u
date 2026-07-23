import type {Sub, Unsub, StateSetter, Subscriber} from '@/types';
import {callNext, broadcastNext} from '@/util';

/**
 * Creates a reactive state without requiring an initial value.
 * Values are only emitted after setValue is called at least once.
 * Returns a tuple of [sub, setValue, getValue, destroy].
 *
 * @returns Tuple of [Sub<T>, StateSetter<T>, getter, destroy function]
 */
export function createLazyState<T>(): [Sub<T>, StateSetter<T>, () => T | undefined, () => void] {
  const subscribers = new Set<Subscriber<T>>();
  let currentValue: T | undefined = undefined;
  let hasValue = false;
  let isDestroyed = false;

  function sub(...subscriber: Subscriber<T>): Unsub {
    if (isDestroyed) {
      return function () {};
    }
    subscribers.add(subscriber);
    if (hasValue) {
      callNext(subscriber, currentValue as T);
    }
    return function unsubscribe() {
      subscribers.delete(subscriber);
    };
  }

  function setValue<U extends T>(newValue: Exclude<U, Function>): void;
  function setValue<U extends T>(newValue: () => U): void;
  function setValue<U extends T>(newValue: (prev: U) => U): void;
  function setValue<U extends T>(newValue: Exclude<U, Function> | (() => U) | ((prev: U) => U)): void {
    if (isDestroyed) {
      return;
    }
    currentValue = typeof newValue === 'function' ? (newValue as (pre: T | undefined) => T)(currentValue) : newValue;
    hasValue = true;
    broadcastNext(subscribers, currentValue);
  }

  function getValue(): T | undefined {
    return currentValue;
  }

  function destroy(): void {
    isDestroyed = true;
    subscribers.clear();
    currentValue = undefined;
  }

  return [sub, setValue, getValue, destroy];
}
