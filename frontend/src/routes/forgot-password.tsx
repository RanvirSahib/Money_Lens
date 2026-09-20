import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Money Lens" }, { name: "description", content: "Request a secure Money Lens password reset link." }, { property: "og:title", content: "Reset password — Money Lens" }, { property: "og:description", content: "Request a secure password reset link." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setError(""); const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); setLoading(false); if (resetError) setError(resetError.message); else setMessage("Check your email for a secure reset link."); }
  return <AuthShell eyebrow="Account recovery" title="Reset your password." description="Enter your email and we’ll send you a secure link."><form onSubmit={submit} className="space-y-5"><div className="space-y-2"><Label htmlFor="email">Email address</Label><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 bg-background" required /></div>{error ? <p role="alert" className="rounded-md bg-risk-soft px-3 py-2 text-sm text-risk">{error}</p> : null}{message ? <p role="status" className="rounded-md bg-positive-soft px-3 py-2 text-sm text-positive">{message}</p> : null}<Button className="h-11 w-full" disabled={loading}>{loading ? <LoaderCircle className="animate-spin" /> : null}Send reset link</Button><p className="text-center text-sm text-muted-foreground">Remembered it? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link></p></form></AuthShell>;
}