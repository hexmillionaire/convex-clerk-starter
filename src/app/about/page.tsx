import type { Metadata } from "next";
import Link from "next/link";
import { Github, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { socialMetadata } from "@/lib/metadata";
import { REPO_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = socialMetadata({
  title: `About — ${SITE_NAME}`,
  description: `Why ${SITE_NAME} exists, what it includes, and how to make it yours.`,
  canonical: "/about",
});

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-2xl px-6 py-16 md:py-20">
      <div className="mb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-2">
          About
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          A starter from someone who ships without hand-writing code.
        </h1>
      </div>

      <div className="space-y-6 text-base leading-[1.8] text-muted-foreground">
        <p>
          This project is the skeleton under a production app, extracted after the
          app was live. Everything in it was built by directing an AI coding agent
          rather than typing the code by hand, and every pattern here survived
          real users: the conditional auth mount, the server-rendered provider,
          the per-user ownership checks in every mutation.
        </p>
        <p>
          It is deliberately small. Two Convex tables, four pages, one
          dashboard. The point is not features; it is that the parts that are
          tedious and easy to get wrong are already right, so the first prompt
          you write is about your idea.
        </p>
        <p>
          The <code className="font-mono text-sm text-foreground">CLAUDE.md</code> at the root
          is written for your agent, not for you. It explains the two invariants
          that will break the app if touched, where new per-user features go,
          and how to add a table without hand-editing generated files. Read{" "}
          <code className="font-mono text-sm text-foreground">docs/WORKFLOW.md</code> for the
          plan-then-execute loop the original was built with.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          <Button className="h-11 gap-2 px-5">
            <Github className="h-4 w-4" />
            Read the source
          </Button>
        </a>
        <Link href="/dashboard">
          <Button variant="outline" className="h-11 gap-2 px-5">
            Try the demo
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
