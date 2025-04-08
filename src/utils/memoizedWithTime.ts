import { memoize, type MemoizedFunction } from "lodash";

export function memoizeExpiring(fn: any, ttl: number) {
  const cache: { [key: string]: { result: any; timestamp: number } } = {};

  const resolver = (...args: any[]) => JSON.stringify(args);

  const memoized = memoize((...args: any[]) => {
    const key = resolver(...args);
    if (cache[key] && Date.now() - cache[key].timestamp < ttl * 1000) {
      return cache[key].result;
    }

    const result = fn(...args);
    cache[key] = { result, timestamp: Date.now() };
    return result;
  }, resolver) as ((...args: Parameters<typeof fn>) => ReturnType<typeof fn>) &
    MemoizedFunction & {
      clear: () => void;
      delete: (...args: Parameters<typeof fn>) => void;
    };

  memoized.clear = () => {
    memoized.cache.clear?.();
    Object.keys(cache).forEach((key) => delete cache[key]);
  };

  memoized.delete = (...args: any[]) => {
    const key = resolver(...args);
    memoized.cache.delete?.(key);
    delete cache[key];
  };

  return memoized;
}
