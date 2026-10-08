"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Info, User, LogOut, Github } from "lucide-react";
import { useClerk, useUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { REPO_URL, SITE_NAME } from "@/lib/site";

/**
 * Shared by the desktop navbar and the mobile tab bar so the two never drift.
 * `match` decides the active state; keep it a prefix test so nested routes
 * light up their parent.
 */
export const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (p: string) => p.startsWith("/dashboard") || p.startsWith("/login"),
  },
  { href: "/about", label: "About", icon: Info, match: (p: string) => p.startsWith("/about") },
];

export function Navbar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center px-6 mx-auto max-w-6xl gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Logo className="h-7 w-7" />
          <span className="font-semibold tracking-tight text-lg hidden sm:inline whitespace-nowrap">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1 min-w-0 justify-center">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = link.match(pathname);
            return (
              <Tooltip key={link.href}>
                <TooltipTrigger
                  render={
                    <Link href={link.href} aria-current={isActive ? "page" : undefined}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "gap-2 h-9 px-4 text-xs font-mono uppercase tracking-[0.12em] rounded-full",
                          isActive && "font-medium"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {link.label}
                      </Button>
                    </Link>
                  }
                />
                <TooltipContent side="bottom">{link.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Source on GitHub"
            className="hidden sm:inline-flex"
          >
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <Github className="h-4 w-4" />
            </Button>
          </a>
          <ThemeToggle />
          {isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" className="h-9 w-9 hidden md:flex rounded-full" />}
              >
                <User className="h-4 w-4" />
                <span className="sr-only">Account</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user?.primaryEmailAddress && (
                  <>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground truncate max-w-56">
                      {user.primaryEmailAddress.emailAddress}
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <Link href="/dashboard">
                  <DropdownMenuItem className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2"
                  variant="destructive"
                  onClick={() => void signOut({ redirectUrl: "/" })}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="hidden md:flex">
              <Button size="sm" className="h-9 rounded-full px-4">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
