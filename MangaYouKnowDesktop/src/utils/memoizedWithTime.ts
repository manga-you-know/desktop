import { conditionalMemoize } from './conditionalMemoize';


export function memoizeWithExpiration(fn: any, ttl: number) {
  let cache: { [key: string]: any } = {};
  const memoized = conditionalMemoize(fn, (...args) => {
    const key = JSON.stringify(args);
    if (cache[key] && (Date.now() - cache[key].timestamp) < ttl) {
      return key;
    }
    cache[key] = { timestamp: Date.now() };
    return key;
  });
  return memoized;
}