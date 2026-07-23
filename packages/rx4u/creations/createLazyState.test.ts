import {expect, test, vi} from 'vitest';
import {createLazyState} from './createLazyState';

test('getValue returns undefined before any set', () => {
  const [, , getValue] = createLazyState<number>();
  expect(getValue()).toBeUndefined();
});

test('does not immediately emit on subscription before first set', () => {
  const [state$] = createLazyState<string>();
  const mockNext = vi.fn();

  state$(mockNext);

  expect(mockNext).not.toHaveBeenCalled();
});

test('emits after set and updates value', () => {
  const [state$, setValue, getValue] = createLazyState<number>();
  const mockNext = vi.fn();

  state$(mockNext);

  setValue(10);
  setValue((prev) => (prev ?? 0) + 5);

  expect(getValue()).toBe(15);
  expect(mockNext).toHaveBeenCalledTimes(2);
  expect(mockNext).toHaveBeenNthCalledWith(1, 10);
  expect(mockNext).toHaveBeenNthCalledWith(2, 15);
});

test('unsubscribe works correctly', () => {
  const [state$, setValue] = createLazyState<number>();
  const mockNext = vi.fn();

  const unsub = state$(mockNext);
  unsub();

  setValue(1);
  expect(mockNext).not.toHaveBeenCalled();
});

test('handles errors in next callback', () => {
  const [state$, setValue] = createLazyState<string>();
  const mockNext = vi.fn(() => {
    throw new Error('Test error');
  });
  const mockError = vi.fn();

  state$(mockNext, mockError);

  setValue('value');

  expect(mockError).toHaveBeenCalledWith(expect.any(Error));
});
