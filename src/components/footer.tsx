import Link from "next/link";
import { REPO_URL, SITE_NAME } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-auto hidden md:block">
      <div className="container max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <p className="font-semibold mb-3 text-lg">{SITE_NAME}</p>
            <p className="text-sm text-muted-foreground leading-[1.7]">
              Next.js, Convex and Clerk, wired together and ready for the next
              idea. Fork it, open Claude Code, build.
            </p>
          </div>

          <div>
            <p className="font-semibold mb-3 text-[11px] uppercase tracking-[0.2em]">Pages</p>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
            </nav>
          </div>

          <div>
            <p className="font-semibold mb-3 text-[11px] uppercase tracking-[0.2em]">Stack</p>
            <nav className="flex flex-col gap-2">
              <a href="https://nextjs.org/docs" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Next.js
              </a>
              <a href="https://docs.convex.dev" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Convex
              </a>
              <a href="https://clerk.com/docs" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Clerk
              </a>
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Source on GitHub
              </a>
            </nav>
          </div>
        </div>

        <div className="border-t border-border/50 mt-10 pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            MIT licensed. Built by someone who directs AI instead of typing code —
            see the README for how.
          </p>
        </div>
      </div>
    </footer>
  );
}
