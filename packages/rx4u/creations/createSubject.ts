import type {Sub, Unsub, Subscriber} from '@/types';
import {callNext} from '@/util';

export function createSubject<T>(): [Sub<T>, (value: T) => void] {
  const subscribers = new Set<Subscriber<T>>();

  // Sub type subscription method
  function sub(...subscriber: Subscriber<T>): Unsub {
    subscribers.add(subscriber);
    return function () {
      subscribers.delete(subscriber);
    };
  }

  function next(value: T): void {
    subscribers.forEach((subscriber: Subscriber<T>) => callNext(subscriber, value));
  }

  return [sub, next];
}
