import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Github, Lock, Zap, Moon, Rocket, Bot, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { socialMetadata } from "@/lib/metadata";
import { REPO_URL, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = socialMetadata({
  title: `${SITE_NAME} — Next.js + Convex + Clerk starter`,
  description: SITE_DESCRIPTION,
  canonical: "/",
});

const FEATURES = [
  {
    icon: Lock,
    title: "Auth that costs nothing on public pages",
    body: "Clerk mounts only on routes that need it or when a session cookie exists. Visitors never download the sign-in bundle.",
  },
  {
    icon: Zap,
    title: "Realtime per-user data",
    body: "Two Convex tables show the only two shapes you need: many rows per user, and one settings row per user.",
  },
  {
    icon: Moon,
    title: "UI shell done",
    body: "shadcn/ui, Tailwind v4, light/dark/system theme, navbar, mobile tab bar, loading and error states.",
  },
  {
    icon: Smartphone,
    title: "Mobile-first",
    body: "Responsive layout, bottom tab bar with safe-area padding, installable PWA manifest and service worker.",
  },
  {
    icon: Rocket,
    title: "Deploy path",
    body: "Vercel-ready with security headers, sitemap, robots, dynamic OG images and analytics already wired.",
  },
  {
    icon: Bot,
    title: "Built for AI-assisted dev",
    body: "CLAUDE.md explains the architecture to your agent. Skills cover the common tasks. The workflow doc shows how it was actually built.",
  },
];

const STEPS = [
  { n: "01", title: "Clone", code: "git clone " + REPO_URL },
  { n: "02", title: "Setup", code: "npm install && npm run setup" },
  { n: "03", title: "Run", code: "npm run dev" },
];

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-5xl px-6">
      <section className="pt-20 pb-16 md:pt-28 md:pb-20 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-6">
          Next.js 16 · Convex · Clerk · Tailwind v4
        </p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-balance">
          Skip the first week.
          <br />
          <span className="text-primary">Start on the idea.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed text-pretty">
          {SITE_DESCRIPTION}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard">
            <Button size="lg" className="h-11 gap-2 px-6">
              Try the demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            <Button size="lg" variant="outline" className="h-11 gap-2 px-6">
              <Github className="h-4 w-4" />
              View source
            </Button>
          </a>
        </div>
      </section>

      <section className="pb-16 md:pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <Card key={s.n} className="card-hover">
              <CardContent className="p-5">
                <p className="font-mono text-xs text-primary mb-2">{s.n}</p>
                <p className="font-semibold mb-3">{s.title}</p>
                <code className="block rounded-md bg-muted px-3 py-2 font-mono text-xs break-all">
                  {s.code}
                </code>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center mb-10">
          What&apos;s already wired
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="card-hover">
                <CardContent className="p-5">
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="font-semibold mb-1.5">{f.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
