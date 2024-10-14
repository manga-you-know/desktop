import { memoize } from 'lodash';

export function conditionalMemoize(fn: any, p0?: (...args: any[]) => string) {
  const memoizedFn = memoize(fn, (...args) => JSON.stringify(args));
  const cache: { [key: string]: any } = {};

  return (...args: any) => {
    const key = JSON.stringify(args);
    if (key in cache) {
      return cache[key];
    } else {
      const result = memoizedFn(...args);
      if (Array.isArray(result) && result.length > 0) {
        cache[key] = result;
      }
      return result;
    }
  };
}
