import {expect, test, vi} from 'vitest';
import {fromPromise} from './fromPromise';

test('fromPromise creates observable from promise', async () => {
  const results: number[] = [];
  const data$ = fromPromise(() => Promise.resolve(42));

  await new Promise<void>((resolve) => {
    data$(
      (data) => results.push(data),
      undefined,
      () => resolve()
    );
  });

  expect(results).toEqual([42]);
});

test('fromPromise handles promise rejection', async () => {
  const data$ = fromPromise<number>(() => Promise.reject(new Error('Test error')) as Promise<number>);

  await new Promise<void>((resolve) => {
    data$(
      (_d: number) => {},
      (err) => {
        expect((err as Error).message).toBe('Test error');
        resolve();
      }
    );
  });
});

test('fromPromise lazy execution', () => {
  const mock = vi.fn(() => Promise.resolve(1));
  const data$ = fromPromise(mock);

  expect(mock).not.toHaveBeenCalled();
  const unsub = data$((_v: number) => {});
  expect(mock).toHaveBeenCalledTimes(1);
});
