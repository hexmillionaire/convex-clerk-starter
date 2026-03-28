"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

export default function LoginPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return null;
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <p className="text-primary text-lg mb-2">&#10022;</p>
        <h1 className="text-2xl font-heading font-semibold mb-1">Welcome</h1>
        <p className="text-sm text-muted-foreground italic">
          Sign in to save bookmarks, highlights, and notes
        </p>
      </div>

      <Card>
        <CardContent className="p-6 flex flex-col gap-4">
          <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
            <Button className="w-full" size="lg">
              Sign In
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
              Create Account
            </Button>
          </SignUpButton>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-6">
        You can read the Bible without an account.{" "}
        <Link
          href="/bible"
          className="text-primary hover:underline"
        >
          Start reading &rarr;
        </Link>
      </p>
    </div>
  );
}
