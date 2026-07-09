"use client";

import { useCallback, useState } from "react";
import type { Translation } from "@/components/translation-switcher";

const STORAGE_KEY = "dw-translation";
const VALID: readonly string[] = ["KJV", "WEB", "ASV"];

function readStored(): Translation {
  if (typeof window === "undefined") return "KJV";
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value && VALID.includes(value)) return value as Translation;
  } catch {
    // localStorage unavailable (private mode, etc.) — fall back to KJV
  }
  return "KJV";
}

/**
 * Reader translation preference, persisted to localStorage so the choice
 * survives chapter navigation (the reader remounts per chapter) and reloads.
 *
 * Safe to initialize from localStorage in the lazy initializer because the
 * reader tree renders client-only (its Convex provider ancestor is
 * `dynamic(ssr:false)`), so there is no server render to mismatch against.
 */
export function useTranslation(): [Translation, (t: Translation) => void] {
  const [translation, setTranslationState] = useState<Translation>(readStored);

  const setTranslation = useCallback((next: Translation) => {
    setTranslationState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore persistence failures
    }
  }, []);

  return [translation, setTranslation];
}
