import { IsoLanguages } from "@/constants";
import { repoInfo } from "@/states";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any }
  ? Omit<T, "children">
  : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null;
};

export function titleCase(str: string | undefined): string {
  return str === undefined ? "" : str.charAt(0).toUpperCase() + str.slice(1);
}

export const removeOrigin = (url: string) => {
  const { pathname, search, hash } = new URL(url);
  return pathname + search + hash;
};

export const getBasePath = (url: string) => {
  const { href } = new URL(url);

  return href.substring(0, href.lastIndexOf("/") + 1);
};

export const getLangNative = (lang: string) =>
  lang === "all" || lang === "other"
    ? titleCase(lang)
    : (IsoLanguages[lang]?.nativeName ?? lang);

export const getLangName = (lang: string) =>
  lang === "all" || lang === "other"
    ? titleCase(lang)
    : (IsoLanguages[lang]?.name ?? lang);

export const prettifyRepo = (repo: string) =>
  repoInfo.value[getBasePath(repo)]?.name ?? removeOrigin(repo);

export const slugify = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};
