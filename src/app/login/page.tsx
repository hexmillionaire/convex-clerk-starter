"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { useUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo";

/**
 * `/login` is in AUTH_ROUTES, so Clerk is always mounted here and the
 * `SignInButton` / `SignUpButton` components are safe to use directly. The
 * `useUser` hook still comes from `@/lib/auth` so this file matches every
 * other one in the app.
 */
export default function LoginPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) return null;

  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <Logo className="h-10 w-10 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to see your dashboard and saved items.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 flex flex-col gap-4">
          <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
            <Button className="w-full" size="lg">
              Sign in
            </Button>
          </SignInButton>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
            <Button variant="outline" className="w-full" size="lg">
              Create account
            </Button>
          </SignUpButton>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Just looking?{" "}
        <Link href="/" className="text-primary hover:underline">
          Back to the homepage &rarr;
        </Link>
      </p>
    </div>
  );
}
