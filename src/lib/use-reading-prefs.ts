"use client";

/**
 * React access to the reader's stored preferences.
 *
 * `useSyncExternalStore` rather than a mount effect: it returns the server
 * snapshot during SSR and hydration and the real stored value immediately
 * after, with no setState-in-effect and no hydration mismatch. Chapter pages
 * are statically generated in KJV at the default size, so the server snapshots
 * here have to be those defaults.
 */

import { useSyncExternalStore } from "react";
import { TRANSLATIONS, DEFAULT_TRANSLATION, type Translation } from "@/lib/bible-data";
import {
  FONT_SIZES,
  DEFAULT_FONT_INDEX,
  FONT_SIZE_STORAGE_KEY,
  TRANSLATION_STORAGE_KEY,
} from "@/lib/reading-prefs";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

/** Also listens for `storage` so a change in one tab reaches the others. */
function subscribe(onChange: Listener): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // private mode, or storage disabled
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Preference simply won't persist; the in-session value still applies.
  }
  emit();
}

// ── Font size ─────────────────────────────────────────────────────────────────

function getFontIndex(): number {
  const index = parseInt(read(FONT_SIZE_STORAGE_KEY) ?? "", 10);
  return index >= 0 && index < FONT_SIZES.length ? index : DEFAULT_FONT_INDEX;
}

const getFontIndexServer = () => DEFAULT_FONT_INDEX;

export function useFontSizeIndex(): [number, (index: number) => void] {
  const index = useSyncExternalStore(subscribe, getFontIndex, getFontIndexServer);
  return [index, (next: number) => write(FONT_SIZE_STORAGE_KEY, String(next))];
}

// ── Translation ───────────────────────────────────────────────────────────────

function getTranslation(): Translation {
  const value = read(TRANSLATION_STORAGE_KEY);
  return value && (TRANSLATIONS as readonly string[]).includes(value)
    ? (value as Translation)
    : DEFAULT_TRANSLATION;
}

const getTranslationServer = () => DEFAULT_TRANSLATION;

export function useTranslation(): [Translation, (next: Translation) => void] {
  const translation = useSyncExternalStore(
    subscribe,
    getTranslation,
    getTranslationServer
  );
  return [translation, (next: Translation) => write(TRANSLATION_STORAGE_KEY, next)];
}
