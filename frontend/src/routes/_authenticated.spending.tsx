import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { CashflowChart } from "@/components/dashboard/charts";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { currency } from "@/lib/dashboard-data";
import { useSpending, useProfile, useStatementTransactions, useUploadStatement, useDiscrepancies, useUpdateProfile } from "@/hooks/use-money-lens";
import { cn } from "@/lib/utils";
import { Upload, Shield, CheckCircle2, AlertCircle, Lock, X, FileText, RefreshCw, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/spending")({
  head: () => ({
    meta: [
      { title: "Spending & Statement Intelligence — Monexa" },
      {
        name: "description",
        content:
          "Evidence-based spending insights, category decomposition, subscription detection, and privacy-first statement analysis.",
      },
      { property: "og:title", content: "Spending Intelligence — Monexa" },
      {
        property: "og:description",
        content: "Decomposed outflows, subscription creep, and profile vs statement discrepancy analysis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpendingPage,
});


function SpendingPage() {
  const { data: liveSpending } = useSpending();
  const { data: profile } = useProfile();
  const { data: liveTransactions = [] } = useStatementTransactions();
  const { data: discrepancies = [] } = useDiscrepancies();
  const uploadMutation = useUploadStatement();
  const updateProfileMutation = useUpdateProfile();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const categories = useMemo(() => {
    if (liveSpending?.categories && liveSpending.categories.length > 0) {
      return liveSpending.categories.filter((c) => c.total_amount > 0).map((c, i) => ({
        category: c.category,
        amount: c.total_amount,
        tone: `chart-${(i % 5) + 1}`,
        pct: c.percentage_of_total,
      }));
    }
    return [];
  }, [liveSpending]);

  const total = liveSpending?.total_spending || 0;
  const subsTotal = liveSpending?.recurring_total || 0;

  // Aggregate top merchants from real debit transactions
  const topMerchants = useMemo(() => {
    const debitTxs = liveTransactions.filter((t) => t.type === "debit");
    const merchantMap = new Map<string, { name: string; category: string; amount: number; visits: number }>();

    for (const tx of debitTxs) {
      const cleanName = tx.description.replace(/^UPI-|\/.*$/g, "").trim().slice(0, 32);
      const existing = merchantMap.get(cleanName);
      if (existing) {
        existing.amount += tx.amount;
        existing.visits += 1;
      } else {
        merchantMap.set(cleanName, {
          name: cleanName || "Unknown Merchant",
          category: tx.category,
          amount: tx.amount,
          visits: 1,
        });
      }
    }

    return Array.from(merchantMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [liveTransactions]);

  // Aggregate recurring subscriptions from transactions
  const detectedSubscriptions = useMemo(() => {
    return liveTransactions.filter((t) => t.is_recurring || t.category === "Subscriptions");
  }, [liveTransactions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
      setUploadStatus(null);
      setIsPrivacyModalOpen(true);
    }
  };

  const handleProcessStatement = async (saveRaw: boolean) => {
    if (!selectedFile) return;
    setIsPrivacyModalOpen(false);
    setUploadStatus(null);
    setUploadError(null);

    try {
      await uploadMutation.mutateAsync({ file: selectedFile, saveRaw });
      setUploadStatus(`Statement "${selectedFile.name}" successfully analyzed. Telemetry and metrics synchronized.`);
    } catch (err: any) {
      setUploadError(err.message || "Failed to process statement. Please ensure it is a valid CSV or PDF bank statement.");
    } finally {
      setSelectedFile(null);
    }
  };

  const handleSyncDiscrepancy = async (discrepancy: any) => {
    if (!discrepancy || !discrepancy.statement_value) return;
    await updateProfileMutation.mutateAsync({
      discretionary_expenses: discrepancy.statement_value - (profile?.essential_expenses || 0),
    });
  };

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <PageHeader
          eyebrow="Statement-Enhanced Intelligence"
          title="Evidence-Based Spending Breakdown"
          description="Decomposed monthly outflows across standard categories, merchant trends, and privacy-first statement ingestion."
        />

        <label className="inline-flex items-center gap-2 self-start sm:self-auto rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs">
          {uploadMutation.isPending ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          <span>{uploadMutation.isPending ? "Analyzing Statement..." : "Upload Bank Statement"}</span>
          <input
            type="file"
            accept=".csv,.pdf,.txt"
            onChange={handleFileChange}
            disabled={uploadMutation.isPending}
            className="hidden"
          />
        </label>
      </div>

      {/* Upload Notifications */}
      {uploadMutation.isPending && (
        <div className="mt-4 p-4 rounded-xl border border-primary/30 bg-primary-soft flex items-center gap-3 text-xs text-foreground animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
          <span>Ingesting statement, classifying transactions into standard categories, and computing grounded AI observations...</span>
        </div>
      )}

      {uploadStatus && (
        <div className="mt-4 p-4 rounded-xl border border-border bg-surface-muted flex items-center justify-between text-xs text-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-positive" />
            <span>{uploadStatus}</span>
          </div>
          <button onClick={() => setUploadStatus(null)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {uploadError && (
        <div className="mt-4 p-4 rounded-xl border border-risk/40 bg-risk-soft flex items-center justify-between text-xs text-risk">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Privacy Choice Modal */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-xs">
          <div className="bg-surface-elevated rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center gap-2 text-primary">
              <Lock className="h-5 w-5" />
              <h3 className="font-display text-lg">Bank Statement Privacy Protocol</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              How would you like Money Lens to handle your statement file <span className="font-semibold text-foreground font-mono">{selectedFile?.name}</span>?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleProcessStatement(false)}
                className="w-full text-left p-3.5 rounded-xl border-2 border-primary bg-primary-soft text-foreground hover:opacity-95 transition-opacity cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>DO NOT SAVE MY STATEMENT</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary text-primary-foreground">Recommended</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Process in-memory, extract categorized aggregates and observations, then permanently purge raw file & transactions.
                </p>
              </button>

              <button
                onClick={() => handleProcessStatement(true)}
                className="w-full text-left p-3.5 rounded-xl border border-border bg-background hover:bg-secondary transition-colors cursor-pointer"
              >
                <span className="text-xs font-semibold text-foreground">SAVE MY STATEMENT</span>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Securely retain statement for historical comparison and cross-statement trend analysis.
                </p>
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  setIsPrivacyModalOpen(false);
                  setSelectedFile(null);
                }}
                className="text-xs text-subtle-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile vs Statement Discrepancy Banner */}
      {discrepancies.length > 0 && (
        <section className="mt-6 panel p-5 border-attention/40 bg-attention-soft/20">
          {discrepancies.map((d: any, idx: number) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-attention shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Profile vs Statement Discrepancy Detected
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {d.note}
                  </p>
                  <p className="text-[11px] text-subtle-foreground mt-0.5">{d.recommendation}</p>
                </div>
              </div>

              <button
                onClick={() => handleSyncDiscrepancy(d)}
                disabled={updateProfileMutation.isPending}
                className="inline-flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 rounded-lg bg-surface-elevated border border-border text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer"
              >
                <span>{updateProfileMutation.isPending ? "Updating..." : "Update Profile"}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </section>
      )}

      {/* KPI Overview */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Observed Outflow", value: currency(total) },
          { label: "Essential Living", value: currency(liveSpending?.essential_total || 0) },
          { label: "Subscriptions & Recurring", value: `${currency(subsTotal)} / mo` },
          { label: "Categories Tracked", value: `${categories.length}` },
        ].map((stat) => (
          <div key={stat.label} className="panel p-5">
            <p className="text-xs uppercase tracking-wide text-subtle-foreground">{stat.label}</p>
            <p className="numeric mt-2.5 text-2xl font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* AI Grounded Observations */}
      {liveSpending?.observations && liveSpending.observations.length > 0 && (
        <section className="mt-6 panel p-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">AI Financial Observations (Grounded in Statement Data)</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {liveSpending.observations.map((obs: any, i: number) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-surface-muted/50 space-y-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-primary/10 text-primary">
                  {obs.type || "Observation"}
                </span>
                <h3 className="text-xs font-semibold text-foreground">{obs.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{obs.summary}</p>
                {obs.evidence && (
                  <p className="text-[11px] text-subtle-foreground font-mono bg-background p-2 rounded border border-border/60">
                    Evidence: {obs.evidence}
                  </p>
                )}
                {obs.possible_action && (
                  <p className="text-[11px] text-primary font-medium">
                    &bull; Action: {obs.possible_action}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cashflow vs Category Breakdown */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Cashflow Balance" subtitle="Reported monthly income vs statement debits">
          <div className="mt-6">
            <CashflowChart income={profile?.monthly_income || 0} spending={total} />
          </div>
        </Panel>

        <Panel title="Expenditure by Category" subtitle={`Current Cycle · ${currency(total)}`}>
          {categories.length > 0 ? (
            <ul className="mt-6 space-y-4">
              {categories.map((row) => (
                <li key={row.category}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-semibold">{row.category}</span>
                    <span className="numeric text-muted-foreground">
                      {currency(row.amount)} &bull; {row.pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${total > 0 ? (row.amount / total) * 100 : 0}%`,
                        backgroundColor: `var(--color-${row.tone})`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center border border-dashed border-border rounded-xl mt-6">
              <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No statement categories available yet.</p>
              <p className="text-[11px] text-subtle-foreground mt-1">Upload a CSV or PDF bank statement to decompose spending.</p>
            </div>
          )}
        </Panel>
      </section>

      {/* Top Merchants & Subscriptions */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Top Merchants" subtitle="Ranked by statement transaction volume">
          {topMerchants.length > 0 ? (
            <ul className="mt-4 divide-y divide-border">
              {topMerchants.map((m) => (
                <li key={m.name} className="flex items-center justify-between gap-4 py-3 text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{m.name}</p>
                    <p className="text-[11px] text-subtle-foreground">
                      {m.category} &bull; {m.visits} {m.visits === 1 ? "transaction" : "transactions"}
                    </p>
                  </div>
                  <span className="numeric font-bold text-foreground">{currency(m.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl mt-4">
              No merchant transactions discovered yet.
            </p>
          )}
        </Panel>

        <Panel title="Subscriptions & Recurring" subtitle={`${detectedSubscriptions.length} identified recurring commitments`}>
          {detectedSubscriptions.length > 0 ? (
            <ul className="mt-4 divide-y divide-border">
              {detectedSubscriptions.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 py-3 text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{s.description}</p>
                    <p className="text-[11px] text-subtle-foreground">
                      {s.category} &bull; {s.date}
                    </p>
                  </div>
                  <span className="numeric font-bold text-foreground">{currency(s.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl mt-4">
              No recurring subscriptions identified in current statements.
            </p>
          )}
        </Panel>
      </section>

      {/* Transaction Feed */}
      <section className="mt-6 panel p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-sm font-semibold">Extracted Transactions</h2>
            <p className="text-xs text-subtle-foreground">Categorized debits and credits from statement ingestion</p>
          </div>
          <span className="text-xs text-subtle-foreground font-mono">{liveTransactions.length} records</span>
        </div>
        {liveTransactions.length > 0 ? (
          <ul className="mt-4 divide-y divide-border">
            {liveTransactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between gap-4 py-3 text-xs">
                <div>
                  <p className="font-semibold text-foreground">{tx.description}</p>
                  <p className="text-[11px] text-subtle-foreground">
                    {tx.category} &bull; {tx.date} {tx.is_essential ? "· Essential" : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "numeric font-bold",
                    tx.type === "credit" ? "text-positive" : "text-foreground",
                  )}
                >
                  {tx.type === "credit" ? "+" : "−"}
                  {currency(Math.abs(tx.amount), 2)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 py-8 text-center border border-dashed border-border rounded-xl">
            <FileText className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-medium">No transaction records uploaded.</p>
            <p className="text-[11px] text-subtle-foreground mt-1">
              Click &quot;Upload Bank Statement&quot; above to import your bank statement CSV or PDF.
            </p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
