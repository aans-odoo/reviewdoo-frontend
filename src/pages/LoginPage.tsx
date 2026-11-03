import { useEffect, useState, FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/errors";
import { Logo } from "@/components/ui/logo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BadgeHelp, UserRoundCheckIcon } from "lucide-react";

export function LoginPage() {
  const { loginAsGuest, login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const [guestRevealed, setGuestRevealed] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    const timeout = window.setTimeout(() => setGuestRevealed(true), 700);
    return () => window.clearTimeout(timeout);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-theme-body">
        <div className="text-sm text-theme-text-muted">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
      setError("Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    setGuestSubmitting(true);
    try {
      await loginAsGuest();
    } catch (err) {
      setError(getApiErrorMessage(err, "Guest login is unavailable. Please try again."));
    } finally {
      setGuestSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-theme-body px-4">
      <div className="relative">
        <Card className="w-full max-w-[27rem] py-8 px-2 relative z-20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3">
              <Logo className="scale-110" />
              <CardDescription className="mt-1">Sign in to your account</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div role="alert" className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-center text-theme-danger">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div>
                <Button type="submit" className="w-full mt-4" disabled={submitting || guestSubmitting}>
                  {submitting ? "Signing in..." : "Sign in"}
                </Button>
              </div>
              <div className="text-center flex items-center justify-center gap-3">
                <a
                  href="/forgot-password"
                  className="text-sm text-theme-text-muted hover:text-theme-text transition-colors shrink-0"
                >
                  Forgot your password?
                </a>
                <span className="h-4 flex w-px bg-muted-foreground/60 shrink-0" />
                <a
                  href="/about"
                  className="text-sm text-theme-text-muted hover:text-theme-text transition-colors shrink-0"
                >
                  More about Reviewdoo
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
        <div className={`absolute left-0 ${guestRevealed ? "top-[98%]" : "top-[80%]"} z-10 w-full rounded-b-xl border border-theme-text-dim/10 pt-4 pb-1.5 bg-theme-bg-card/80 backdrop-blur-xl backdrop-saturate-150 transition-[top] [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] motion-reduce:!top-[98%] motion-reduce:transition-none`}>
          <div className="flex items-center justify-center gap-1.5">
            <span className="italic text-theme-text-dim mr-1">or</span>
            <Button type="button" variant="link" className="px-0 text-theme-accent focus-visible:ring-theme-accent" onClick={handleGuestLogin} disabled={submitting || guestSubmitting}>
              {guestSubmitting ? "Entering as guest..." : "Continue as Guest"}
            </Button>
            <UserRoundCheckIcon className="size-4 text-theme-accent-light/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
