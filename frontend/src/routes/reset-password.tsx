import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Choose a new password — Monexa" },
      { name: "description", content: "Choose a new password for your Monexa account." },
      { property: "og:title", content: "Choose a new password — Monexa" },
      { property: "og:description", content: "Securely update your account password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordRedirectPage,
});

function ResetPasswordRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/forgot-password" });
  }, [navigate]);

  return null;
}