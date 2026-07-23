import type {Sub, Unsub, Subscriber} from '@/types';
import {callNext} from '@/util';

type EventTargetLike = {
  addEventListener: (type: string, listener: (ev: Event) => void, options?: AddEventListenerOptions | boolean) => void;
  removeEventListener: (type: string, listener: (ev: Event) => void, options?: EventListenerOptions | boolean) => void;
};

/**
 * Creates a stream from DOM-like events on an EventTarget.
 *
 * @param target The event target (e.g. Element, Document, Window)
 * @param type The event type to listen for (e.g. "click", "keydown")
 * @param options Optional event listener options
 * @returns A Sub that emits events of type T
 */
export function fromEvent<T extends Event = Event>(target: EventTargetLike, type: string, options?: AddEventListenerOptions | EventListenerOptions | boolean): Sub<T> {
  return function (...subscriber: Subscriber<T>): Unsub {
    function handler(ev: Event): void {
      callNext(subscriber, ev as T);
    }

    target.addEventListener(type, handler, options);

    return function unsubscribe() {
      target.removeEventListener(type, handler, options);
    };
  };
}
