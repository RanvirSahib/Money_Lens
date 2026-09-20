import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Money Lens — See your money clearly" },
      { name: "description", content: "Understand spending, grow savings and test life's big decisions with one calm financial view." },
      { property: "og:title", content: "Money Lens — See your money clearly" },
      { property: "og:description", content: "A calmer, clearer way to understand your money and plan what comes next." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <section className="landing-hero relative min-h-[92vh] overflow-hidden border-b border-border px-5 pb-12 pt-5 md:px-8 md:pt-7">
        <div className="landing-grid absolute inset-0" aria-hidden="true" />
        <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">M</span>
            <span className="font-display text-2xl">Money Lens</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost"><Link to="/login">Sign in</Link></Button>
            <Button asChild><Link to="/create-account">Get started <ArrowRight /></Link></Button>
          </div>
        </nav>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center pt-20 text-center md:pt-24">
          <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1.5 text-xs text-muted-foreground shadow-card backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Clear answers, built around your numbers
          </div>
          <h1 className="animate-rise-delay mt-7 max-w-4xl font-display text-6xl leading-[0.96] sm:text-7xl lg:text-8xl">Money Lens</h1>
          <p className="animate-rise-delay-2 mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            See where you stand, understand what changed, and test your next move before money changes hands.
          </p>
          <div className="animate-rise-delay-2 mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-6"><Link to="/create-account">Create your free account <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline" className="h-12 bg-surface/80 px-6"><Link to="/login">Sign in</Link></Button>
          </div>

          <div className="dashboard-scene animate-dashboard-in relative mt-16 w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-surface p-3 text-left shadow-lift md:p-5">
            <div className="grid gap-3 md:grid-cols-[180px_1fr]">
              <aside className="hidden rounded-lg bg-surface-muted p-4 md:block">
                <div className="flex items-center gap-2 font-display text-lg"><span className="h-6 w-6 rounded-md bg-primary" />Money Lens</div>
                <div className="mt-8 space-y-2">{["Overview", "Spending", "Accounts", "Goals"].map((item, index) => <div key={item} className={`rounded-md px-3 py-2 text-xs ${index === 0 ? "bg-primary-soft text-primary" : "text-muted-foreground"}`}>{item}</div>)}</div>
              </aside>
              <div className="p-3 md:p-5">
                <p className="text-xs text-subtle-foreground">Your financial picture</p>
                <h2 className="mt-2 font-display text-3xl">Good morning, Aarnav.</h2>
                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[['Net worth', '$241,650'], ['Cash', '$38,420'], ['Monthly spend', '$5,960'], ['Savings rate', '37%']].map(([label, value]) => <div key={label} className="rounded-lg border border-border p-3"><p className="text-[10px] uppercase text-subtle-foreground">{label}</p><p className="numeric mt-2 text-base font-semibold md:text-lg">{value}</p></div>)}
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-[1.65fr_1fr]">
                  <div className="relative h-44 overflow-hidden rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between"><span className="text-xs font-medium">Net worth</span><span className="text-xs text-positive">+3.3%</span></div>
                    <div className="chart-lines absolute inset-x-4 bottom-4 top-12" aria-hidden="true"><span /><span /><span /><span /><i /></div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs font-medium">Financial health</p>
                    <div className="mx-auto mt-5 flex h-24 w-24 items-center justify-center rounded-full border-[12px] border-primary-soft text-center"><span className="numeric text-2xl font-semibold text-primary">76</span></div>
                    <p className="mt-3 text-center text-xs text-muted-foreground">Healthy and improving</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div><p className="text-xs font-medium uppercase tracking-wide text-primary">One clear view</p><h2 className="mt-4 max-w-md font-display text-4xl md:text-5xl">Less tracking. Better decisions.</h2></div>
          <div className="grid gap-8 sm:grid-cols-2">
            {[['Know what changed', 'See spending patterns, net worth and cash flow without assembling another spreadsheet.'], ['Test the big choices', 'Model a home purchase, a sabbatical or a savings change before committing.'], ['Move toward goals', 'Turn distant targets into monthly steps and realistic completion dates.'], ['Act on the signal', 'Get focused observations ranked by what they could be worth to you.']].map(([title, body], index) => <article key={title} className="reveal-item border-t border-border pt-5"><span className="numeric text-xs text-primary">0{index + 1}</span><h3 className="mt-5 text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface px-5 py-20 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <div><TrendingUp className="h-6 w-6 text-primary" /><h2 className="mt-5 max-w-xl font-display text-4xl md:text-5xl">Start with clarity. Build from there.</h2><div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">{['Free to start', 'Secure by design', 'No profile required'].map((item) => <span key={item} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-positive" />{item}</span>)}</div></div>
          <Button asChild size="lg" className="h-12"><Link to="/create-account">Open Money Lens <ArrowRight /></Link></Button>
        </div>
      </section>
      <footer className="px-5 py-8 md:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between text-xs text-subtle-foreground"><span>© 2026 Money Lens</span><Link to="/login" className="transition-colors hover:text-foreground">Sign in</Link></div></footer>
    </main>
  );
}