import { NextResponse } from "next/server";

// Legacy Supabase OAuth callback — no longer used (Convex Auth handles this).
// Safe to delete this entire src/app/auth/ directory.
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`);
}
