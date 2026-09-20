import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AuthFields } from "@/components/auth-fields";
import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search) => z.object({ next: z.string().optional() }).parse(search),
  head: () => ({ meta: [{ title: "Sign in — Monexa" }, { name: "description", content: "Sign in securely to your Monexa account." }, { property: "og:title", content: "Sign in — Monexa" }, { property: "og:description", content: "Return to your private financial overview." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: LoginPage,
});


function LoginPage() {
  return <AuthShell eyebrow="Welcome back" title="See your money clearly." description="Sign in to return to your overview, goals and financial decisions."><AuthFields mode="login" /></AuthShell>;
}