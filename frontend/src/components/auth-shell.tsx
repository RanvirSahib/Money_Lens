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
        className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:-translate-x-1 active:scale-95 md:left-8 md:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Monexa</span>
      </Link>

      <section className="animate-scale-in relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lift sm:p-8 transition-all duration-300">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary shadow-xs transition-transform duration-200 hover:scale-110">
          <ShieldCheck className="h-5 w-5" strokeWidth={2} />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-foreground">{title}</h1>
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
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