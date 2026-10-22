import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";

const BLOCKED_BOTS =
  /AhrefsBot|SemrushBot|MJ12bot|DotBot|BLEXBot|DataForSeoBot|serpstatbot|PetalBot|YandexBot|Baiduspider/i;

const clerk = clerkMiddleware();

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const ua = request.headers.get("user-agent") || "";
  if (BLOCKED_BOTS.test(ua)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  return clerk(request, event);
}

export const config = {
  // Clerk's recommended matcher: skip Next.js internals and static files,
  // and always run for API routes so `auth()` works in the first `/api`
  // handler a fork adds instead of throwing or running unauthenticated.
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
