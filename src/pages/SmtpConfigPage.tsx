import { useState, useEffect, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Send, Check } from "lucide-react";
import api from "@/lib/api";

interface SmtpConfig {
  id: string;
  host: string;
  port: number;
  username: string;
  passwordSet: boolean;
  fromEmail: string;
  fromName: string;
}

export function SmtpConfigPage() {
  const [config, setConfig] = useState<SmtpConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [host, setHost] = useState("");
  const [port, setPort] = useState("587");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [saving, setSaving] = useState(false);

  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/smtp-config");
      const data = res.data.config ?? res.data;
      if (data && data.host) {
        setConfig(data);
        setHost(data.host);
        setPort(String(data.port));
        setUsername(data.username);
        setFromEmail(data.fromEmail);
        setFromName(data.fromName);
      }
      setError("");
    } catch (err: unknown) {
      const axErr = err as { response?: { status?: number } };
      if (axErr.response?.status !== 404) {
        setError("Failed to load SMTP configuration");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const body: Record<string, string | number> = { host, port: parseInt(port, 10), username, fromEmail, fromName };
      if (password) body.password = password;
      else if (!config?.passwordSet) {
        setError("Password is required for initial setup");
        setSaving(false);
        return;
      }

      await api.put("/smtp-config", body);
      setPassword("");
      setSuccess("SMTP configuration saved successfully");
      await fetchConfig();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axErr.response?.data?.error?.message ?? "Failed to save SMTP configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail.trim()) return;
    setTesting(true);
    setTestSuccess(false);
    setError("");
    try {
      await api.post("/smtp-config/test", { recipientEmail: testEmail.trim() });
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axErr.response?.data?.error?.message ?? "Failed to send test email");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-sm text-theme-text-muted">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-theme-text">SMTP Configuration</h2>
        <p className="mt-1 text-sm text-theme-text-muted">Configure email sending settings for user invitations.</p>
      </div>

      {error && (
        <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">{error}</div>
      )}
      {success && (
        <div className="rounded-sm bg-theme-success/10 border border-theme-success/25 px-3 py-2 text-sm text-theme-success">{success}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            <Mail className="mr-2 inline h-5 w-5 text-theme-text-muted" />
            SMTP Settings
          </CardTitle>
          <CardDescription>
            {config ? "Update your SMTP configuration below." : "Set up SMTP to enable email invitations."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">Host</Label>
                <Input id="smtp-host" placeholder="smtp.example.com" value={host} onChange={(e) => setHost(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">Port</Label>
                <Input id="smtp-port" type="number" placeholder="587" value={port} onChange={(e) => setPort(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-username">Username</Label>
                <Input id="smtp-username" placeholder="user@example.com" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">
                  Password {config?.passwordSet && <span className="text-theme-text-dim">(leave blank to keep current)</span>}
                </Label>
                <Input id="smtp-password" type="password" placeholder={config?.passwordSet ? "••••••••" : "Enter password"} value={password} onChange={(e) => setPassword(e.target.value)} required={!config?.passwordSet} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-from-email">Sender Email</Label>
                <Input id="smtp-from-email" type="email" placeholder="noreply@example.com" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-from-name">Sender Name</Label>
                <Input id="smtp-from-name" placeholder="Reviewdoo" value={fromName} onChange={(e) => setFromName(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Configuration"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Send className="mr-2 inline h-5 w-5 text-theme-text-muted" />
            Test Email
          </CardTitle>
          <CardDescription>Send a test email to verify your SMTP configuration.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input type="email" placeholder="recipient@example.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} className="flex-1" />
            <Button onClick={handleTest} disabled={testing || !testEmail.trim()}>
              {testSuccess ? (
                <><Check className="h-4 w-4" /> Sent</>
              ) : testing ? (
                "Sending..."
              ) : (
                <><Send className="h-4 w-4" /> Send Test</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
