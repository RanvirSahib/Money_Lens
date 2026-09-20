import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="auth-canvas relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <div className="auth-grid absolute inset-0 opacity-50" aria-hidden="true" />
      <Link
        to="/"
        className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:left-8 md:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Money Lens
      </Link>

      <section className="animate-auth-in relative z-10 w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-lift sm:p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <p className="mt-6 text-xs font-medium uppercase tracking-wide text-primary">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-7">{children}</div>
      </section>
    </main>
  );
}

export function GoogleMark() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface text-xs font-semibold text-foreground">
      G
    </span>
  );
}