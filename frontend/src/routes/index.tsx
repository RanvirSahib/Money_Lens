import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Sparkles,
  TrendingUp,
  Shield,
  RotateCcw,
  ShoppingBag,
  CreditCard,
  Layers,
  Phone,
  Mail,
  Star,
  Send,
  Lock,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/dashboard-data";
import { submitFeedback } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Monexa — Personal Financial Intelligence Platform" },
      {
        name: "description",
        content:
          "Model major purchases, simulate EMIs, solve goal timelines backwards, and analyze bank statements with zero-storage privacy.",
      },
      { property: "og:title", content: "Monexa — Personal Financial Intelligence" },
      {
        property: "og:description",
        content:
          "Understand your money. See the consequences of decisions before committing capital. Plan with deterministic certainty.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

type DemoTab = "radar" | "timemachine" | "reverse" | "spending";

function LandingPage() {
  const [activeTab, setActiveTab] = useState<DemoTab>("radar");
  
  // Interactive Live Demo States
  const [demoPurchaseAmt, setDemoPurchaseAmt] = useState(85000);
  const [demoGoalTarget, setDemoGoalTarget] = useState(500000);
  const [demoGoalMonths, setDemoGoalMonths] = useState(12);
  const [demoPrivacySaved, setDemoPrivacySaved] = useState(false);

  // Customer Care & Feedback Form States
  const [fbName, setFbName] = useState("");
  const [fbEmail, setFbEmail] = useState("");
  const [fbCategory, setFbCategory] = useState("Feature Request");
  const [fbRating, setFbRating] = useState(5);
  const [fbMessage, setFbMessage] = useState("");
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbSuccess, setFbSuccess] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbMessage.trim()) return;
    setFbSubmitting(true);
    setFbError(null);
    try {
      await submitFeedback({
        name: fbName || undefined,
        email: fbEmail || undefined,
        category: fbCategory,
        rating: fbRating,
        message: fbMessage,
      });
      setFbSuccess(true);
      setFbMessage("");
    } catch (err: any) {
      setFbError(err.message || "Failed to submit feedback. Please try again.");
    } finally {
      setFbSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/20">
      {/* Top Glassmorphic Navigation */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md transition-all">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
              M
            </span>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-foreground leading-none">
                Monexa
              </span>
              <span className="text-[10px] text-primary font-medium tracking-wider uppercase mt-0.5">
                Financial Intelligence
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Core Capabilities</a>
            <a href="#interactive-demo" className="hover:text-foreground transition-colors">Live Sandbox</a>
            <a href="#privacy" className="hover:text-foreground transition-colors">Privacy Shield</a>
            <a href="#customer-care" className="hover:text-foreground transition-colors">Customer Care & Helpline</a>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="text-xs font-semibold">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="text-xs font-semibold shadow-xs">
              <Link to="/create-account">
                Open Monexa <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>


      {/* Hero Section */}
      <section className="relative overflow-hidden px-5 pt-16 pb-20 md:px-8 md:pt-24 md:pb-28">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute top-96 right-10 -z-10 h-72 w-72 rounded-full bg-info/10 blur-2xl" />

        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-soft/60 px-4 py-1.5 text-xs font-medium text-primary shadow-xs backdrop-blur-sm animate-in fade-in slide-in-from-top-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Deterministic Math Engine &bull; Zero Calculation Hallucination</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-7 max-w-4xl font-display text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.05]">
            Understand your money. <br className="hidden sm:inline" />
            <span className="text-primary underline decoration-primary/30 underline-offset-8">
              See the consequences
            </span>{" "}
            before you spend.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Monexa turns complex cashflows into plain mathematical clarity. Simulate purchases, model loan commitments, solve goals backwards, and upload bank statements with strict privacy-by-design.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Button asChild size="lg" className="h-12 px-7 text-sm font-semibold shadow-md">
              <Link to="/create-account">
                Start Free Analysis <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 bg-surface px-6 text-sm font-semibold border-border shadow-xs hover:bg-secondary">
              <a href="#interactive-demo">
                Explore Live Demo <Sliders className="ml-1.5 h-4 w-4 text-primary" />
              </a>
            </Button>
          </div>

          {/* Trust Value Badges */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 w-full max-w-3xl text-left">
            {[
              { label: "100% Deterministic", desc: "No AI calculation guesses" },
              { label: "Ephemeral Privacy", desc: "Zero stored statement data" },
              { label: "Indian Banking", desc: "UPI, EMI, SIP & DTI math" },
              { label: "Goal Time Machine", desc: "Backwards feasibility solver" },
            ].map((badge, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-surface p-3.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-positive font-bold text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{badge.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* INTERACTIVE HERO PRODUCT SHOWCASE (Replacing the static empty mockup box) */}
        <div id="interactive-demo" className="mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
            {/* Window Topbar */}
            <div className="flex flex-wrap items-center justify-between border-b border-border bg-surface-muted/60 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80 inline-block" />
                <span className="ml-2 text-xs font-semibold text-foreground font-mono">monexa.app &bull; Interactive Sandbox</span>
              </div>


              {/* Interactive Tabs */}
              <div className="flex flex-wrap gap-1 mt-2 sm:mt-0">
                {[
                  { id: "radar", label: "Financial Radar", icon: Activity },
                  { id: "timemachine", label: "Time Machine Simulator", icon: ShoppingBag },
                  { id: "reverse", label: "Reverse Goal Solver", icon: RotateCcw },
                  { id: "spending", label: "Spending & Privacy", icon: Shield },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as DemoTab)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-surface text-muted-foreground hover:text-foreground border border-border"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Contents */}
            <div className="p-6 md:p-8">
              {/* TAB 1: RADAR */}
              {activeTab === "radar" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="p-4 rounded-xl border border-border bg-surface-muted/50">
                      <p className="text-[11px] font-semibold text-subtle-foreground uppercase">Estimated Net Worth</p>
                      <p className="numeric text-2xl font-bold text-foreground mt-1">₹24,16,500</p>
                      <span className="text-[10px] text-positive font-semibold mt-1 inline-block">+4.8% this cycle</span>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-surface-muted/50">
                      <p className="text-[11px] font-semibold text-subtle-foreground uppercase">Uncommitted Surplus</p>
                      <p className="numeric text-2xl font-bold text-positive mt-1">₹95,000 / mo</p>
                      <span className="text-[10px] text-muted-foreground mt-1 inline-block">63.3% savings rate</span>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-surface-muted/50">
                      <p className="text-[11px] font-semibold text-subtle-foreground uppercase">Emergency Runway</p>
                      <p className="numeric text-2xl font-bold text-foreground mt-1">6.9 months</p>
                      <span className="text-[10px] text-positive font-semibold mt-1 inline-block">Above 3-month safety bar</span>
                    </div>

                    <div className="p-4 rounded-xl border border-primary/30 bg-primary-soft/30 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-primary uppercase">Financial Health</p>
                        <p className="numeric text-3xl font-extrabold text-foreground mt-1">84<span className="text-sm font-normal text-muted-foreground">/100</span></p>
                        <span className="text-[10px] text-primary font-semibold">Healthy & Disciplined</span>
                      </div>
                      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin-slow flex items-center justify-center font-bold text-xs text-primary">
                        84%
                      </div>
                    </div>
                  </div>

                  {/* Radar Alerts List */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Radar Telemetry</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="p-3.5 rounded-xl border border-positive/30 bg-positive-soft/20 flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-positive shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-foreground">Healthy Debt-to-Income (DTI: 0.0%)</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">No active EMIs or high-interest unsecured loans dragging cashflow.</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-primary/30 bg-primary-soft/20 flex items-start gap-3">
                        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-foreground">Surplus Deployment Capacity</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">₹95,000 monthly surplus available for SIP compounding or goal acceleration.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TIME MACHINE */}
              {activeTab === "timemachine" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="p-4 rounded-xl bg-surface-muted/60 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Interactive Purchase Outflow Slider</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Drag to simulate how an instant purchase impacts cash buffers and recovery time.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <input
                        type="range"
                        min={10000}
                        max={300000}
                        step={5000}
                        value={demoPurchaseAmt}
                        onChange={(e) => setDemoPurchaseAmt(Number(e.target.value))}
                        className="w-48 accent-primary cursor-pointer"
                      />
                      <span className="text-sm font-bold numeric text-primary bg-surface px-3 py-1 rounded-lg border border-border">
                        {currency(demoPurchaseAmt)}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="p-4 rounded-xl border border-border bg-surface">
                      <p className="text-[11px] text-subtle-foreground uppercase">Post-Purchase Savings</p>
                      <p className="numeric text-2xl font-bold text-foreground mt-1">
                        {currency(Math.max(0, 380000 - demoPurchaseAmt))}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">From initial ₹3,80,000 buffer</p>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-surface">
                      <p className="text-[11px] text-subtle-foreground uppercase">Emergency Runway Impact</p>
                      <p className="numeric text-2xl font-bold text-primary mt-1">
                        {(Math.max(0, 380000 - demoPurchaseAmt) / 55000).toFixed(1)} <span className="text-xs font-normal">months</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">Covers ₹55,000 monthly expenses</p>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-surface">
                      <p className="text-[11px] text-subtle-foreground uppercase">Surplus Replenishment Time</p>
                      <p className="numeric text-2xl font-bold text-positive mt-1">
                        {Math.ceil(demoPurchaseAmt / 95000)} <span className="text-xs font-normal">months</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">At ₹95,000/mo surplus pace</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: REVERSE GOAL SOLVER */}
              {activeTab === "reverse" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-xl bg-surface-muted/60 border border-border">
                    <div>
                      <label className="text-xs font-bold text-subtle-foreground uppercase">Target Corpus (₹)</label>
                      <div className="flex items-center gap-3 mt-1.5">
                        <input
                          type="range"
                          min={100000}
                          max={2000000}
                          step={50000}
                          value={demoGoalTarget}
                          onChange={(e) => setDemoGoalTarget(Number(e.target.value))}
                          className="flex-1 accent-primary cursor-pointer"
                        />
                        <span className="numeric text-xs font-bold text-foreground bg-surface px-2.5 py-1 rounded border border-border">
                          {currency(demoGoalTarget)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-subtle-foreground uppercase">Target Horizon (Months)</label>
                      <div className="flex items-center gap-3 mt-1.5">
                        <input
                          type="range"
                          min={3}
                          max={36}
                          step={1}
                          value={demoGoalMonths}
                          onChange={(e) => setDemoGoalMonths(Number(e.target.value))}
                          className="flex-1 accent-primary cursor-pointer"
                        />
                        <span className="numeric text-xs font-bold text-foreground bg-surface px-2.5 py-1 rounded border border-border">
                          {demoGoalMonths} months
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="p-4 rounded-xl border border-border bg-surface">
                      <p className="text-[11px] text-subtle-foreground uppercase">Required Monthly Pace</p>
                      <p className="numeric text-2xl font-bold text-primary mt-1">
                        {currency(Math.round(demoGoalTarget / demoGoalMonths))} / mo
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">To reach in {demoGoalMonths} months</p>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-surface">
                      <p className="text-[11px] text-subtle-foreground uppercase">Monthly Surplus Gap</p>
                      <p className={cn("numeric text-2xl font-bold mt-1", (95000 - Math.round(demoGoalTarget / demoGoalMonths)) >= 0 ? "text-positive" : "text-risk")}>
                        {(95000 - Math.round(demoGoalTarget / demoGoalMonths)) >= 0
                          ? `+${currency(95000 - Math.round(demoGoalTarget / demoGoalMonths))}`
                          : `−${currency(Math.abs(95000 - Math.round(demoGoalTarget / demoGoalMonths)))}`}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {(95000 - Math.round(demoGoalTarget / demoGoalMonths)) >= 0 ? "Fully covered by surplus" : "Monthly shortfall"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-surface">
                      <p className="text-[11px] text-subtle-foreground uppercase">Alternative Pace Timeline</p>
                      <p className="numeric text-2xl font-bold text-foreground mt-1">
                        {Math.ceil(demoGoalTarget / 95000)} <span className="text-xs font-normal">months</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">At your ₹95,000/mo pace</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SPENDING & PRIVACY */}
              {activeTab === "spending" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-primary-soft/30 border border-primary/30">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Zero-Storage Ephemeral Privacy Switch</h4>
                        <p className="text-[11px] text-muted-foreground">Toggle privacy consent to see how Monexa parses statements in-memory without saving raw data.</p>
                      </div>
                    </div>
                    <label className="inline-flex items-center gap-2 cursor-pointer bg-surface px-3 py-1.5 rounded-lg border border-border text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={demoPrivacySaved}
                        onChange={(e) => setDemoPrivacySaved(e.target.checked)}
                        className="accent-primary cursor-pointer"
                      />
                      <span>{demoPrivacySaved ? "Persistent Mode" : "🔒 Ephemeral (Purge Data)"}</span>
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4 text-xs">
                    {[
                      { cat: "Food & Groceries", amt: "₹18,400", pct: "33.5%", tone: "text-primary" },
                      { cat: "Utilities & Bills", amt: "₹12,200", pct: "22.1%", tone: "text-info" },
                      { cat: "Dining & Delivery", amt: "₹9,800", pct: "17.8%", tone: "text-attention" },
                      { cat: "Subscriptions", amt: "₹4,200", pct: "7.6%", tone: "text-positive" },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-border bg-surface">
                        <p className="text-subtle-foreground font-medium">{item.cat}</p>
                        <p className="numeric text-lg font-bold text-foreground mt-1">{item.amt}</p>
                        <span className="text-[10px] text-muted-foreground">{item.pct} of monthly spend</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="px-5 py-20 md:px-8 md:py-28 border-t border-border bg-surface-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 scroll-reveal">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Purpose-Built for Exact Mathematical Clarity</p>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
              Engineered for financial confidence.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Every decision you make compounds. Monexa provides deterministic instruments designed to protect your wealth and simulate real-life decisions.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Activity,
                title: "Deterministic Financial Radar",
                desc: "Real-time evaluation of DTI ratio, emergency runway, surplus capture, and risk indicators with clear math breakdown.",
              },
              {
                icon: ShoppingBag,
                title: "Purchase Time Machine",
                desc: "Simulate cash vs EMI purchases. See exact runway depletion and long-term consequences on your net worth trajectory.",
              },
              {
                icon: RotateCcw,
                title: "Reverse Goal Engineering",
                desc: "Input target amounts and timeframes. Monexa back-solves the exact monthly savings, trade-offs, and timeline adjustments required.",
              },
              {
                icon: TrendingUp,
                title: "Scenario Experimenter",
                desc: "Compare up to 4 financial choices side-by-side: loan tenures, SIP investments, career breaks, or lifestyle upgrades.",
              },
              {
                icon: Shield,
                title: "Privacy-First Statement Pipeline",
                desc: "Upload bank statements with an explicit Save vs Discard switch. In-memory processing extracts patterns and purges raw statements.",
              },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="group rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary/40 hover:shadow-lift hover:-translate-y-1 transition-all duration-300 cursor-default scroll-reveal card-hover-lift"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 shadow-xs">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-foreground transition-colors duration-200 group-hover:text-primary">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRIVACY & SECURITY SECTION */}
      <section id="privacy" className="px-5 py-20 md:px-8 md:py-24 border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl rounded-3xl border border-primary/20 bg-primary-soft/20 p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-surface px-3 py-1 text-xs font-semibold text-primary">
                <Lock className="h-3.5 w-3.5" /> Privacy-First Architecture
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl text-foreground">
                Your bank statement is optional. Your privacy is absolute.
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Monexa does not require bank credentials or automated screen scraping. You control whether your statement is saved to your private database or parsed purely in-memory and discarded.
              </p>
              <div className="mt-6 space-y-2.5">
                {[
                  "No net banking passwords or OTP access requested",
                  "Ephemeral in-memory parsing with automatic raw data purging",
                  "Encrypted storage on AWS RDS PostgreSQL",
                  "Zero data sharing with third-party advertisers",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Check className="h-4 w-4 text-positive shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold text-foreground">Statement Privacy Mode</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-positive-soft text-positive px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-muted border border-border">
                  <span className="font-semibold text-foreground">1. User Uploads PDF/CSV Statement</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Parsed for debit/credit transactions and merchant patterns.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-muted border border-border">
                  <span className="font-semibold text-foreground">2. Telemetry Aggregation</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Calculates category totals and uncommitted monthly surplus.</p>
                </div>
                <div className="p-3 rounded-lg bg-primary-soft border border-primary/30">
                  <span className="font-semibold text-primary">3. Immediate In-Memory File Destruction</span>
                  <p className="text-[11px] text-foreground mt-0.5">Raw file is purged immediately unless explicitly saved by you.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER CARE, HELPLINE & DIRECT FEEDBACK HUB */}
      <section id="customer-care" className="px-5 py-20 md:px-8 md:py-28 border-t border-border bg-surface-muted/40">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Customer Care & Product Feedback</p>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
              We're here to help you grow.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Have questions about your financial modeling, need assistance with bank statement formats, or want to suggest new features? Reach out directly to the Monexa team.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
            {/* Direct Contact Cards */}
            <div className="space-y-4">
              {/* Toll Free Card */}
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">Toll-Free Helpline</p>
                    <p className="text-lg font-bold text-foreground font-mono">1800-890-MONEXA</p>
                    <p className="text-[11px] text-primary font-medium">(1800-890-6663)</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Available Monday through Saturday, 9:00 AM – 8:00 PM IST. Direct assistance for platform and calculation inquiries.
                </p>
              </div>

              {/* Email Support Card */}
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-soft text-info">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">Email Support & Feedback</p>
                    <a href="mailto:support@monexa.in" className="text-sm font-bold text-primary hover:underline block font-mono">
                      support@monexa.in
                    </a>
                    <a href="mailto:feedback@monexa.in" className="text-xs text-muted-foreground hover:underline block font-mono">
                      feedback@monexa.in
                    </a>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Guaranteed response within 4 business hours from our senior engineering and financial analysis team.
                </p>
              </div>
            </div>

            {/* Interactive Feedback & Message Box */}
            <div className="rounded-2xl border border-border bg-surface p-6 md:p-8 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h3 className="text-base font-bold text-foreground">Direct Product Feedback & Message Box</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Tell us what features you would like to see, report a calculation edge case, or share your thoughts.
              </p>

              {fbSuccess ? (
                <div className="rounded-xl border border-positive/30 bg-positive-soft/30 p-6 text-center space-y-3 animate-in fade-in">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-positive-soft text-positive">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Thank You for Your Feedback!</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Your message has been directly submitted to the Monexa core product team. We review every note to build the best financial platform.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFbSuccess(false)}
                    className="text-xs cursor-pointer"
                  >
                    Send Another Feedback
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  {fbError && (
                    <div className="p-3 rounded-lg bg-risk-soft border border-risk/30 text-xs text-risk">
                      {fbError}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-subtle-foreground">Your Name (Optional)</label>
                      <input
                        type="text"
                        value={fbName}
                        onChange={(e) => setFbName(e.target.value)}
                        placeholder="e.g. Aarnav"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-subtle-foreground">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={fbEmail}
                        onChange={(e) => setFbEmail(e.target.value)}
                        placeholder="e.g. user@monexa.in"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-subtle-foreground">Category</label>
                      <select
                        value={fbCategory}
                        onChange={(e) => setFbCategory(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="Feature Request">💡 Feature Request</option>
                        <option value="Bug Report">🐞 Bug / Calculation Issue</option>
                        <option value="Product Experience">💬 General Product Feedback</option>
                        <option value="Customer Care">❓ Customer Care Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-subtle-foreground">Experience Rating</label>
                      <div className="mt-1 flex items-center gap-1 py-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFbRating(star)}
                            className="cursor-pointer p-1 text-muted-foreground hover:text-amber-400 transition-colors"
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                star <= fbRating ? "fill-amber-400 text-amber-400" : "text-border"
                              )}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-muted-foreground ml-2">{fbRating} / 5 Stars</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-subtle-foreground">Your Feedback Message <span className="text-risk">*</span></label>
                    <textarea
                      value={fbMessage}
                      onChange={(e) => setFbMessage(e.target.value)}
                      placeholder="Write your feedback, feature suggestion, or question here..."
                      rows={4}
                      required
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={fbSubmitting || !fbMessage.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{fbSubmitting ? "Sending Feedback..." : "Submit Message to Monexa Team"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="border-t border-border bg-surface px-5 py-20 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Zap className="h-4 w-4" /> Ready for Calm Financial Intelligence?
            </div>
            <h2 className="mt-3 max-w-xl font-display text-4xl font-bold sm:text-5xl text-foreground">
              See consequences before you commit capital.
            </h2>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-positive" /> Free to start</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-positive" /> Zero fake data</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-positive" /> Indian banking calibrated</span>
            </div>
          </div>
          <Button asChild size="lg" className="h-12 px-8 text-sm font-semibold shadow-md">
            <Link to="/create-account">
              Create Your Account <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-background px-5 py-12 md:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                M
              </span>
              <span className="font-display text-xl font-bold text-foreground">
                Monexa
              </span>
            </div>
            <div className="flex flex-wrap gap-6 text-xs text-muted-foreground font-medium">
              <a href="#features" className="hover:text-foreground transition-colors">Core Capabilities</a>
              <a href="#interactive-demo" className="hover:text-foreground transition-colors">Live Sandbox</a>
              <a href="#privacy" className="hover:text-foreground transition-colors">Privacy Shield</a>
              <a href="#customer-care" className="hover:text-foreground transition-colors">Customer Care & Helpline</a>
              <Link to="/login" className="text-primary hover:underline font-semibold transition-colors">Sign In</Link>
              <Link to="/create-account" className="text-primary hover:underline font-semibold transition-colors">Create Account</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border text-xs text-subtle-foreground">
            <p>© 2026 Monexa Technologies Pvt. Ltd. All rights reserved.</p>
            <p>Built with deterministic mathematical models & privacy-by-design.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}