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
  return str === undefined
    ? ""
    : str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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
  lang === "all"
    ? "Multi"
    : lang === "other"
      ? "Other"
      : (IsoLanguages[lang]?.nativeName ?? lang);

export const getLangName = (lang: string) =>
  lang === "all"
    ? "Multi"
    : lang === "other"
      ? "Other"
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

export const fromEpochSeconds = (v: string | number | undefined) =>
  new Date(Number(v) * 1000);
export const fromEpochMillis = (v: string | number | undefined) =>
  new Date(Number(v));

export const timeAgo = (date: Date): string => {
  if (isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y ago`;
};
