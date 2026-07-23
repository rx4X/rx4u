export type NextAction<T = void> = (value: T) => void;
export type ErrorAction = (error: unknown) => void;
export type CompleteAction = () => void;

export type Subscriber<T> = readonly [next?: NextAction<T> | undefined, error?: ErrorAction | undefined, complete?: CompleteAction | undefined];

// Unsubscribe function type
export type Unsub = () => void;

export type Sub<T> = (...subscriber: Subscriber<T>) => Unsub;

// Operator function type
export type Operator<T, R> = (source: Sub<T>) => Sub<R>;

export type StateSetter<T> = {
  (value: Exclude<T, Function> | ((prev: T) => T) | (() => T)): void;
};

export type Timer = ReturnType<typeof setTimeout>;
