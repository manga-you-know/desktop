import { conditionalMemoize } from './conditionalMemoize';

export function memoizeWithExpiration(fn: any, ttl: number) {
  const cache: { [key: string]: { result: any; timestamp: number } } = {};

  const memoized = conditionalMemoize(fn, (...args) => {
    const key = JSON.stringify(args);
    if (cache[key] && Date.now() - cache[key].timestamp < ttl) {
      return cache[key].result; // Return the cached result if still valid
    }
    const result = fn(...args);
    cache[key] = { result, timestamp: Date.now() };

    return result;
  });

  return memoized;
}
