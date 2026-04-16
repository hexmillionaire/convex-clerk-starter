import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";

const BLOCKED_BOTS =
  /AhrefsBot|SemrushBot|MJ12bot|DotBot|BLEXBot|DataForSeoBot|serpstatbot|PetalBot|YandexBot|Baiduspider/i;

const clerk = clerkMiddleware();

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const ua = request.headers.get("user-agent") || "";
  if (BLOCKED_BOTS.test(ua)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  return clerk(request, event);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|icons/|manifest\\.json|sw\\.js).*)"],
};
