import { createFileRoute } from "@tanstack/react-router";
import { AuthFields } from "@/components/auth-fields";
import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/create-account")({
  head: () => ({ meta: [{ title: "Create account — Money Lens" }, { name: "description", content: "Create your secure Money Lens account and start building a clearer financial picture." }, { property: "og:title", content: "Create account — Money Lens" }, { property: "og:description", content: "Start building a clearer view of your money." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: CreateAccountPage,
});

function CreateAccountPage() {
  return <AuthShell eyebrow="Start with clarity" title="Create your account." description="No profile setup required. Your private financial workspace is ready when you are."><AuthFields mode="signup" /></AuthShell>;
}