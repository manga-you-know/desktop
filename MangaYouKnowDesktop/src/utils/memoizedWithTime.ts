import { memoize } from 'lodash';

export function memoizeWithExpiration(fn: any, ttl: number) {
  const cache: { [key: string]: { result: any; timestamp: number } } = {};

  const memoized = memoize(fn, (...args) => {
    const key = JSON.stringify(args);
    if (cache[key] && (Date.now() - cache[key].timestamp) < ttl * 1000) {
      return cache[key].result; // Return the cached result if still valid
    }
    const result = fn(...args);
    cache[key] = { result, timestamp: Date.now() };

    return result;
  });

  return memoized;
}
