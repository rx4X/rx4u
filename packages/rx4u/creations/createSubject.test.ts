import {expect, test, vi} from 'vitest';
import {createSubject} from './createSubject';

test('createSubject multicasts values to all subscribers', () => {
  const [subject$, next] = createSubject<number>();
  const results1: number[] = [];
  const results2: number[] = [];

  subject$((value) => results1.push(value));
  subject$((value) => results2.push(value));

  next(1);
  next(2);

  expect(results1).toEqual([1, 2]);
  expect(results2).toEqual([1, 2]);
});

test('createSubject does not replay values emitted before subscription', () => {
  const [subject$, next] = createSubject<number>();
  const results: number[] = [];

  next(1);
  subject$((value) => results.push(value));
  next(2);

  expect(results).toEqual([2]);
});

test('createSubject unsubscribe stops future values', () => {
  const [subject$, next] = createSubject<number>();
  const results: number[] = [];

  const unsub = subject$((value) => results.push(value));

  next(1);
  unsub();
  next(2);

  expect(results).toEqual([1]);
});

test('createSubject unsubscribing one subscriber keeps other subscribers active', () => {
  const [subject$, next] = createSubject<number>();
  const results1: number[] = [];
  const results2: number[] = [];

  const unsub1 = subject$((value) => results1.push(value));
  subject$((value) => results2.push(value));

  next(1);
  unsub1();
  next(2);

  expect(results1).toEqual([1]);
  expect(results2).toEqual([1, 2]);
});

test('createSubject forwards next handler errors to error handler', () => {
  const [subject$, next] = createSubject<number>();
  const error = new Error('next failed');
  const errorHandler = vi.fn();

  subject$(() => {
    throw error;
  }, errorHandler);

  next(1);

  expect(errorHandler).toHaveBeenCalledWith(error);
});
