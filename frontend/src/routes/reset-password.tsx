import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Choose a new password — Money Lens" }, { name: "description", content: "Choose a new password for your Money Lens account." }, { property: "og:title", content: "Choose a new password — Money Lens" }, { property: "og:description", content: "Securely update your account password." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { const recovery = window.location.hash.includes("type=recovery"); supabase.auth.getSession().then(({ data }) => setReady(recovery || Boolean(data.session))); }, []);
  async function submit(event: FormEvent) { event.preventDefault(); setError(""); const { error: updateError } = await supabase.auth.updateUser({ password }); if (updateError) { setError(updateError.message); return; } await navigate({ to: "/dashboard" }); }
  return <AuthShell eyebrow="Secure recovery" title="Choose a new password." description={ready ? "Use at least eight characters and choose something unique." : "Open the reset link from your email to continue."}>{ready ? <form onSubmit={submit} className="space-y-5"><div className="space-y-2"><Label htmlFor="password">New password</Label><Input id="password" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 bg-background" required /></div>{error ? <p role="alert" className="rounded-md bg-risk-soft px-3 py-2 text-sm text-risk">{error}</p> : null}<Button className="h-11 w-full">Update password</Button></form> : <Button asChild variant="outline" className="h-11 w-full"><a href="mailto:">Open email</a></Button>}</AuthShell>;
}