import type { ReactNode } from "react";

/**
 * Strips the index signature from a Tamagui prop type so that explicitly
 * declared keys (such as `children`) keep their correct types and are not
 * shadowed by the component's `[k: string]` index signature.
 */
export type WithoutIndex<T> = {
  [
    K in keyof T as string extends K
      ? never
      : number extends K
        ? never
        : symbol extends K
          ? never
          : K
  ]: T[K];
};

export type WithChildren<P> = WithoutIndex<P> & {
  children?: ReactNode;
};
