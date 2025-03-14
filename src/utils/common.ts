export function isEmpty(obj: any): boolean {
  return Object.keys(obj).length === 0;
}

export function titleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function strNotEmpty(str: string | number | undefined): string {
  return str?.toString() ?? "";
}
