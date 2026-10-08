import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard } from "lucide-react";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Page not found — ${SITE_NAME}`,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="container mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
      <p className="font-mono text-xs tracking-[0.2em] text-primary mb-4">404</p>
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
        That page isn&apos;t here
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        The link may be broken or the page may have moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button className="h-11 gap-2 px-5">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="h-11 gap-2 px-5">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
