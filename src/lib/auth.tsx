"use client";

/**
 * Auth access that works with or without Clerk loaded.
 *
 * A stranger arriving from Google on /bible/john/3 was downloading Clerk's
 * entire sign-in interface — around 759KB, roughly a third of the JavaScript
 * on the page — before reading a word, on a page that needs no account.
 *
 * So Clerk is now mounted only when it can matter: on auth-dependent routes,
 * or when Clerk's own client cookie says a session may exist. Everywhere else
 * the tree gets an anonymous context and no Clerk script at all.
 *
 * Components must import `useUser` and `useClerk` from here rather than from
 * `@clerk/nextjs`, because Clerk's hooks throw outside a ClerkProvider and a
 * hook call can't be made conditional.
 *
 * Note the asymmetry on purpose: when Clerk *is* mounted, the tree is exactly
 * what it was before this change, so nothing about the signed-in path moves.
 * Only the signed-out tree is new.
 */

import { createContext, useContext, type ReactNode } from "react";
import type { useUser as useClerkUser, useClerk as useClerkClerk } from "@clerk/nextjs";

/**
 * Derived from Clerk's own hook rather than hand-modelled, so the dashboard
 * keeps full access to the user resource (`update`, `delete`, `lastName`) and
 * this can't drift from Clerk's shape. Type-only import: erased at build, so
 * it pulls in no Clerk runtime.
 */
export type AuthUser = ReturnType<typeof useClerkUser>["user"] | null;

/** Clerk's own signature, so call sites can pass `{ redirectUrl }`. */
export type SignOut = ReturnType<typeof useClerkClerk>["signOut"];

export type AuthState = {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: AuthUser;
  signOut: SignOut;
};

const ANONYMOUS: AuthState = {
  isSignedIn: false,
  // `true` because this is a settled answer, not a pending one: Clerk was
  // deliberately not loaded. Callers gate their skeletons on `isLoaded`, and
  // an anonymous visitor should get the signed-out view immediately.
  isLoaded: true,
  user: null,
  // Nobody is signed in, so there is nothing to sign out of.
  signOut: (async () => {}) as SignOut,
};

export const AuthContext = createContext<AuthState>(ANONYMOUS);

export function AnonymousAuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={ANONYMOUS}>{children}</AuthContext.Provider>;
}

/** Mirrors Clerk's `useUser()` shape for the fields this app actually reads. */
export function useUser(): Pick<AuthState, "isSignedIn" | "isLoaded" | "user"> {
  const { isSignedIn, isLoaded, user } = useContext(AuthContext);
  return { isSignedIn, isLoaded, user };
}

/** Mirrors the one member of Clerk's `useClerk()` this app uses. */
export function useClerk(): Pick<AuthState, "signOut"> {
  const { signOut } = useContext(AuthContext);
  return { signOut };
}

/**
 * Routes that always mount Clerk, whether or not a cookie is present — either
 * they require an account, or they're where someone signs in.
 */
const AUTH_ROUTES = [
  "/login",
  "/dashboard",
  "/journal",
  "/bookmarks",
  "/prayers",
  "/plans",
  "/stats",
  "/support",
];

export function routeNeedsAuth(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Clerk's client-side session hint. `__client_uat` is readable by script (it
 * exists for exactly this purpose) and holds a timestamp — "0" means signed
 * out. A false positive costs a Clerk load; a false negative resolves on the
 * next navigation, and both auth routes and the sign-in entry points mount
 * Clerk regardless.
 */
export function hasClerkSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith("__client_uat=") && c.slice(14) !== "0");
}
