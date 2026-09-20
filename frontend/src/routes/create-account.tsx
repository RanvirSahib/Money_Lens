import { createFileRoute } from "@tanstack/react-router";
import { AuthFields } from "@/components/auth-fields";
import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/create-account")({
  head: () => ({ meta: [{ title: "Create account — Monexa" }, { name: "description", content: "Create your secure Monexa account and start building a clearer financial picture." }, { property: "og:title", content: "Create account — Monexa" }, { property: "og:description", content: "Start building a clearer view of your money." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: CreateAccountPage,
});


function CreateAccountPage() {
  return (
    <AuthShell
      eyebrow="Start with clarity"
      title="Create your account."
      description="Calibrate your baseline financial parameters and create your secure account. Your private workspace is isolated and protected."
    >
      <AuthFields mode="signup" />
    </AuthShell>
  );
}