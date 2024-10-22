

export function Retry(retries: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    // Verifica se o método original é uma função
    if (typeof originalMethod !== 'function') {
      throw new Error('O decorador Retry só pode ser aplicado a métodos.');
    }

    descriptor.value = async function (...args: any[]) {
      let attempt = 0;
      while (attempt < retries) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          attempt++;
          if (attempt >= retries) {
            throw error; // Lança erro se atingir o número máximo de tentativas
          }
          console.warn(`Retrying... (${attempt}/${retries})`);
        }
      }
    };

    return descriptor; // Retorna o descriptor alterado
  };
}