import { memoize } from 'lodash';

export function conditionalMemoize(fn: any, p0?: (...args: any[]) => string) {
  let memoizedFn = memoize(fn, (...args) => JSON.stringify(args));
  let cache: { [key: string]: any } = {};

  return function(...args: any) {
    let key = JSON.stringify(args);
    if (key in cache) {
      return cache[key];
    } else {
      let result = memoizedFn(...args);
      if (Array.isArray(result) && result.length > 0) {
        cache[key] = result;
      }
      return result;
    }
  };
}