"use client";

import { useCallback, useEffect, useState } from "react";

const ONE_HOUR_MS = 60 * 60 * 1000;

interface PersistedData<T> {
  value: T;
  timestamp: number;
}

interface UsePersistedStateOptions<T> {
  key: string;
  defaultValue: T;
  expirationMs?: number; // default: 1 hour
}

/**
 * A hook for managing localStorage-based state with automatic expiration.
 *
 * @param options - Configuration options
 * @param options.key - localStorage key
 * @param options.defaultValue - Default value when no persisted data exists or data is expired
 * @param options.expirationMs - Expiration time in milliseconds (default: 1 hour)
 *
 * @returns Tuple of [value, setValue, clearValue]
 */
export function usePersistedState<T>(
  options: UsePersistedStateOptions<T>,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { key, defaultValue, expirationMs = ONE_HOUR_MS } = options;

  const [value, setValueInternal] = useState<T>(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Check if data is expired
  const isExpired = useCallback(
    (timestamp: number): boolean => {
      return Date.now() - timestamp > expirationMs;
    },
    [expirationMs],
  );

  // Load persisted data on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedData = localStorage.getItem(key);

      if (storedData) {
        const parsed: PersistedData<T> = JSON.parse(storedData);

        if (!isExpired(parsed.timestamp)) {
          setValueInternal(parsed.value);
        } else {
          // Data is expired, clear it
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error(`Error loading persisted state for key "${key}":`, error);
      localStorage.removeItem(key);
    }

    setIsHydrated(true);
  }, [key, isExpired]);

  // Persist value to localStorage
  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValueInternal((prev) => {
        const resolvedValue =
          typeof newValue === "function"
            ? (newValue as (prev: T) => T)(prev)
            : newValue;

        if (typeof window !== "undefined") {
          try {
            const dataToStore: PersistedData<T> = {
              value: resolvedValue,
              timestamp: Date.now(),
            };
            localStorage.setItem(key, JSON.stringify(dataToStore));
          } catch (error) {
            console.error(`Error persisting state for key "${key}":`, error);
          }
        }

        return resolvedValue;
      });
    },
    [key],
  );

  // Clear persisted data
  const clearValue = useCallback(() => {
    setValueInternal(defaultValue);
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  }, [key, defaultValue]);

  return [value, setValue, clearValue];
}

/**
 * Check if a navigation flag exists in sessionStorage and optionally clear it.
 *
 * @param flagKey - The sessionStorage key to check
 * @param shouldClear - Whether to clear the flag after reading (default: true)
 * @returns boolean indicating if the flag was set
 */
export function checkNavigationFlag(
  flagKey: string,
  shouldClear: boolean = true,
): boolean {
  if (typeof window === "undefined") return false;

  try {
    const flag = sessionStorage.getItem(flagKey);
    if (flag === "true") {
      if (shouldClear) {
        sessionStorage.removeItem(flagKey);
      }
      return true;
    }
  } catch (error) {
    console.error(`Error checking navigation flag "${flagKey}":`, error);
  }

  return false;
}

/**
 * Set a navigation flag in sessionStorage.
 *
 * @param flagKey - The sessionStorage key to set
 */
export function setNavigationFlag(flagKey: string): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(flagKey, "true");
  } catch (error) {
    console.error(`Error setting navigation flag "${flagKey}":`, error);
  }
}
