import { memoize } from 'lodash';


export function MemoizeWithExpiration(ttl: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    const cache: { [key: string]: { result: any; timestamp: number } } = {};

    const memoized = memoize(function (this: any, ...args: any[]) { 
      const key = JSON.stringify(args);
      if (cache[key] && (Date.now() - cache[key].timestamp) < ttl * 1000) {
        return cache[key].result;
      }
      const result = originalMethod.apply(this, args); 
      cache[key] = { result, timestamp: Date.now() };

      return result;
    });

    descriptor.value = memoized;
    return descriptor;
  };
}
