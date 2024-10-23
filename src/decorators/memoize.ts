import { memoize } from "lodash";


export function Memoize() {
	return function (
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> | void {
    const originalMethod = descriptor.value;

    // Verifica se o método original é uma função
    if (typeof originalMethod !== 'function') {
      throw new Error('O decorador Memoize só pode ser aplicado a métodos.');
    }

    // Substitui o método original pelo memoizado
    descriptor.value = memoize(function (this: any, ...args: any[]) {
      return originalMethod.apply(this, args); // 'this' aqui garante que o contexto da classe seja mantido
    });

    return descriptor; // Retorna o descriptor alterado
  };
}