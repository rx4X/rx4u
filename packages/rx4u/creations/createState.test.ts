import {expect, test, vi} from 'vitest';
import {createState} from './createState';

test('should return initial value', () => {
  const [, , getValue] = createState(42);
  expect(getValue()).toBe(42);
});

test('should immediately emit current value to new subscribers', () => {
  const [data$] = createState('hello');
  const mockNext = vi.fn();

  data$(mockNext);

  expect(mockNext).toHaveBeenCalledWith('hello');
  expect(mockNext).toHaveBeenCalledTimes(1);
});

test('should update value and notify all subscribers', () => {
  const [data$, setValue, getValue] = createState(0);
  const mockNext1 = vi.fn();
  const mockNext2 = vi.fn();

  data$(mockNext1);
  data$(mockNext2);

  // Clear initial calls
  mockNext1.mockClear();
  mockNext2.mockClear();

  // Update value
  setValue(10);

  expect(getValue()).toBe(10);
  expect(mockNext1).toHaveBeenCalledWith(10);
  expect(mockNext2).toHaveBeenCalledWith(10);
  expect(mockNext1).toHaveBeenCalledTimes(1);
  expect(mockNext2).toHaveBeenCalledTimes(1);
});

test('should handle multiple updates', () => {
  const [data$, setValue, getValue] = createState('initial');
  const mockNext = vi.fn();

  data$(mockNext);
  mockNext.mockClear();

  setValue('first');
  setValue('second');
  setValue('third');

  expect(getValue()).toBe('third');
  expect(mockNext).toHaveBeenCalledTimes(3);
  expect(mockNext).toHaveBeenNthCalledWith(1, 'first');
  expect(mockNext).toHaveBeenNthCalledWith(2, 'second');
  expect(mockNext).toHaveBeenNthCalledWith(3, 'third');
});

test('should unsubscribe correctly', () => {
  const [data$, setValue] = createState(100);
  const mockNext = vi.fn();

  const unsub = data$(mockNext);
  mockNext.mockClear();

  unsub();
  setValue(200);

  expect(mockNext).not.toHaveBeenCalled();
});

test('should handle errors in next callback', () => {
  const [data$, setValue] = createState('test');
  const mockNext = vi.fn(() => {
    throw new Error('Test error');
  });
  const mockError = vi.fn();

  data$(mockNext, mockError);
  mockNext.mockClear();

  setValue('new value');

  expect(mockError).toHaveBeenCalledWith(expect.any(Error));
});

test('should work with different data types', () => {
  // Test with an object
  const [, , getObj] = createState({count: 0, name: 'test'});
  expect(getObj()).toEqual({count: 0, name: 'test'});

  // Test with an array
  const [, , getArr] = createState([1, 2, 3]);
  expect(getArr()).toEqual([1, 2, 3]);

  // Test with boolean
  const [, , getBool] = createState(true);
  expect(getBool()).toBe(true);
});

test('should maintain separate state for different instances', () => {
  const [, setValue1, getValue1] = createState(1);
  const [, setValue2, getValue2] = createState(2);

  setValue1(10);
  setValue2(20);

  expect(getValue1()).toBe(10);
  expect(getValue2()).toBe(20);
});
