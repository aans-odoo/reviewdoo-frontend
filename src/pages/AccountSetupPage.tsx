import { useState, FormEvent, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/ui/logo";
import api from "@/lib/api";

type TokenState = "validating" | "valid" | "invalid" | "expired";

export function AccountSetupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { setSession } = useAuth();

  const [tokenState, setTokenState] = useState<TokenState>("validating");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenState("invalid");
      return;
    }

    api.get(`/auth/setup/validate?token=${encodeURIComponent(token)}`)
      .then(() => setTokenState("valid"))
      .catch((err) => {
        const message = err.response?.data?.error?.message ?? "";
        setTokenState(message.includes("expired") ? "expired" : "invalid");
      });
  }, [token]);

  if (tokenState === "validating") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-theme-body px-4">
        <Card className="w-full max-w-sm py-5 px-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3"><Logo /></div>
            <CardDescription>Validating invitation...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (tokenState === "expired") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-theme-body px-4">
        <Card className="w-full max-w-sm py-5 px-2">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-theme-danger">Invitation Expired</CardTitle>
            <CardDescription>
              This invitation link has expired. Please contact your administrator for a new invitation.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (tokenState === "invalid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-theme-body px-4">
        <Card className="w-full max-w-sm py-5 px-2">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-theme-danger">Invalid Link</CardTitle>
            <CardDescription>
              This invitation link is invalid or has already been used. Please contact your administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/auth/setup", { inviteToken: token, password });
      const { token: jwt, user } = res.data;
      setSession(jwt, user);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message ?? "Setup failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-theme-body px-4">
      <Card className="w-full max-w-sm py-5 px-2">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3">
            <Logo className="scale-110" />
            <CardDescription>Create a password to activate your account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-center text-theme-danger">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <Button type="submit" className="w-full mt-4" disabled={submitting}>
                {submitting ? "Setting up..." : "Activate Account"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
