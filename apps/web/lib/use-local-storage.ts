"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Persists a single JSON-serialisable value to `localStorage`, surviving reloads.
 * SSR-safe: falls back to the initial value on the server / first render.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      setValue(initialValue);
    }
  }, [key, initialValue]);

  const setStored = useCallback(
    (next: T) => {
      setValue(next);
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Ignore write failures (e.g. private mode quota).
      }
    },
    [key],
  );

  return [value, setStored];
}
