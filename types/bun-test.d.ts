declare module 'bun:test' {
  type TestFn = () => void | Promise<void>;

  interface Matchers {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
  }

  interface Expect {
    (actual: unknown): Matchers;
  }

  export const describe: (label: string, fn: TestFn) => void;
  export const expect: Expect;
  export const it: (label: string, fn: TestFn) => void;
}
