import type {Sub, Unsub, StateSetter, Subscriber} from '@/types';
import {callNext, broadcastNext} from '@/util';

/**
 * Creates a reactive state with synchronous value distribution.
 * Returns a tuple of [sub, setValue, getValue, destroy].
 *
 * @param initialValue Initial state value
 * @returns Tuple of [Sub<T>, StateSetter<T>, getter, destroy function]
 */
export function createState<T>(initialValue: T): [Sub<T>, StateSetter<T>, () => T, () => void] {
  const subscribers = new Set<Subscriber<T>>();
  let currentValue = initialValue;
  let isDestroyed = false;

  function sub(...subscriber: Subscriber<T>): Unsub {
    if (isDestroyed) {
      return function () {};
    }
    subscribers.add(subscriber);
    callNext(subscriber, currentValue);
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
    currentValue = typeof newValue === 'function' ? (newValue as (pre: T) => T)(currentValue) : newValue;
    broadcastNext(subscribers, currentValue);
  }

  function getValue(): T {
    return currentValue;
  }

  function destroy(): void {
    isDestroyed = true;
    subscribers.clear();
  }

  return [sub, setValue, getValue, destroy];
}
