import type { StringChain } from "lodash";

export function isEmpty(obj: any): boolean {
  return Object.keys(obj).length === 0;
}

export function titleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function strNotEmpty(str: string | number | undefined): string {
  return str?.toString() ?? "";
}

export function imageFail(id: string) {
  const coverElement = document.getElementById(id);
  if (coverElement instanceof HTMLImageElement) {
    coverElement.src = "/myk.png";
  }
}

export function limitStr(text: string, max: number = 17): string {
  return text.length > max ? text.substring(0, max) + "..." : text;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry(
  func: () => Promise<any>,
  message?: string,
  times = 3,
  timeoutMs = 300
): Promise<any> {
  let count = 0;
  while (count < times) {
    try {
      return await func();
    } catch (e) {
      count++;
      console.log(e);
      if (count < times) {
        console.log("Retrying again...");
        await delay(timeoutMs);
      }
    }
  }

  throw new Error(message ?? `Function failed after ${times} retries.`);
}
