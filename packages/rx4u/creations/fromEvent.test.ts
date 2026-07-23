import {expect, test, vi} from 'vitest';
import {fromEvent} from './fromEvent';

class MockTarget {
  private listeners: Record<string, Array<(event: Event) => void>> = {};

  addEventListener(type: string, listener: (event: Event) => void): void {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (event: Event) => void): void {
    const arr = this.listeners[type];
    if (!arr) return;
    const idx = arr.indexOf(listener);
    if (idx >= 0) arr.splice(idx, 1);
  }

  emit(type: string, event: Event): void {
    const arr = this.listeners[type] || [];
    for (const l of arr) l(event);
  }
}

test('fromEvent forwards events to subscribers', async () => {
  const target = new MockTarget();
  const clicks$ = fromEvent(target, 'click');

  const results: Event[] = [];
  const firstClick = new Event('click');
  const secondClick = new Event('click');

  await new Promise<void>((resolve) => {
    clicks$((e) => {
      results.push(e);
      if (results.length === 2) resolve();
    });

    target.emit('click', firstClick);
    target.emit('click', secondClick);
  });

  expect(results).toEqual([firstClick, secondClick]);
});

test('unsubscribing removes listener', () => {
  const target = new MockTarget();
  const clicks$ = fromEvent(target, 'click');

  const mockNext = vi.fn();
  const unsub = clicks$(mockNext);
  const firstClick = new Event('click');
  const secondClick = new Event('click');

  target.emit('click', firstClick);
  unsub();
  target.emit('click', secondClick);

  expect(mockNext).toHaveBeenCalledTimes(1);
  expect(mockNext).toHaveBeenCalledWith(firstClick);
});
