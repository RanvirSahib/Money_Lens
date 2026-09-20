import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { NetWorthChart } from "@/components/dashboard/charts";
import { Badge, PageHeader, Panel } from "@/components/dashboard/ui";
import { currency } from "@/lib/dashboard-data";
import {
  useProfile,
  useUpdateProfile,
  useEMIs,
  useCreateEMI,
  useUpdateEMI,
  useDeleteEMI,
  useSubscriptions,
  useCreateSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
  useInvestments,
  useCreateInvestment,
  useUpdateInvestment,
  useDeleteInvestment,
} from "@/hooks/use-money-lens";
import { UserEMI, UserSubscription, UserInvestment } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  Check,
  Edit2,
  ShieldAlert,
  ShieldCheck,
  Wallet,
  TrendingUp,
  CreditCard,
  PieChart,
  Sparkles,
  Plus,
  Trash2,
  Calculator,
  Percent,
  Calendar,
  AlertCircle,
  Building,
  Car,
  Laptop,
  GraduationCap,
  Landmark,
  Tv,
  Cloud,
  Dumbbell,
  Wifi,
  HeartPulse,
  BookOpen,
  Package,
  RefreshCw,
  CalendarDays,
  CheckCircle2,
  Coins,
  PiggyBank,
  LineChart,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/accounts")({
  head: () => ({
    meta: [
      { title: "Financial Profile & Balance Sheet — Monexa" },
      {
        name: "description",
        content:
          "Manage your deterministic financial baseline: income, essential and discretionary spending, liquid savings, active EMIs with interest rates, recurring subscriptions, and monthly investment SIPs.",
      },
      { property: "og:title", content: "Financial Profile — Monexa" },
      {
        property: "og:description",
        content: "Calibrate baseline parameters, loans, subscriptions, and investment SIP portfolios powering the Monexa financial engine.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountsPage,
});


const EMI_CATEGORIES = [
  { label: "Home Loan", icon: Landmark, defaultRate: 8.5 },
  { label: "Auto Loan", icon: Car, defaultRate: 9.0 },
  { label: "Personal Loan", icon: CreditCard, defaultRate: 11.5 },
  { label: "Education Loan", icon: GraduationCap, defaultRate: 9.5 },
  { label: "Consumer / Gadget EMI", icon: Laptop, defaultRate: 14.0 },
  { label: "Credit Card EMI", icon: CreditCard, defaultRate: 16.0 },
  { label: "Other Loan", icon: Building, defaultRate: 10.0 },
];

const SUB_CATEGORIES = [
  { label: "Streaming", icon: Tv },
  { label: "Tech & Cloud", icon: Cloud },
  { label: "Fitness & Wellness", icon: Dumbbell },
  { label: "Utilities & Wifi", icon: Wifi },
  { label: "Insurance & Health", icon: HeartPulse },
  { label: "News & Learning", icon: BookOpen },
  { label: "Other Subscription", icon: Package },
];

const POPULAR_SUB_PRESETS = [
  { name: "Netflix Premium", category: "Streaming", frequency: "monthly", amount: 649 },
  { name: "Amazon Prime", category: "Streaming", frequency: "yearly", amount: 1499 },
  { name: "Spotify Duo / Family", category: "Streaming", frequency: "monthly", amount: 199 },
  { name: "YouTube Premium", category: "Streaming", frequency: "monthly", amount: 149 },
  { name: "Apple iCloud+ (200GB)", category: "Tech & Cloud", frequency: "monthly", amount: 219 },
  { name: "Cult.fit Elite Pass", category: "Fitness & Wellness", frequency: "yearly", amount: 14500 },
  { name: "ChatGPT Plus", category: "Tech & Cloud", frequency: "monthly", amount: 1999 },
  { name: "Disney+ Hotstar", category: "Streaming", frequency: "yearly", amount: 1499 },
  { name: "JioFiber / Airtel Broadband", category: "Utilities & Wifi", frequency: "monthly", amount: 999 },
];

const INVESTMENT_CATEGORIES = [
  { label: "Mutual Fund SIP", icon: TrendingUp, defaultRate: 13.5, defaultAsset: "Equity" },
  { label: "Direct Stocks / Smallcase", icon: LineChart, defaultRate: 15.0, defaultAsset: "Equity" },
  { label: "PPF / EPF / VPF", icon: ShieldCheck, defaultRate: 7.1, defaultAsset: "Retirement / Pension" },
  { label: "NPS / Pension Tier-1", icon: Landmark, defaultRate: 10.5, defaultAsset: "Retirement / Pension" },
  { label: "Fixed / Recurring Deposit", icon: Wallet, defaultRate: 7.2, defaultAsset: "Debt / Fixed Income" },
  { label: "Gold / Silver ETF / SGB", icon: Sparkles, defaultRate: 9.5, defaultAsset: "Commodities / Gold" },
  { label: "Other SIP / Alternative", icon: Coins, defaultRate: 11.0, defaultAsset: "Hybrid / Balanced" },
];

const ASSET_CLASSES = [
  "Equity",
  "Debt / Fixed Income",
  "Hybrid / Balanced",
  "Commodities / Gold",
  "Retirement / Pension",
];

const POPULAR_INVESTMENT_PRESETS = [
  { name: "Nifty 50 Index Fund SIP", category: "Mutual Fund SIP", asset_class: "Equity", monthly_amount: 5000, expected_return_pct: 12.5, sip_date: 5 },
  { name: "Parag Parikh Flexi Cap SIP", category: "Mutual Fund SIP", asset_class: "Equity", monthly_amount: 5000, expected_return_pct: 14.0, sip_date: 10 },
  { name: "Public Provident Fund (PPF)", category: "PPF / EPF / VPF", asset_class: "Retirement / Pension", monthly_amount: 12500, expected_return_pct: 7.1, sip_date: 1 },
  { name: "National Pension Scheme (NPS)", category: "NPS / Pension Tier-1", asset_class: "Retirement / Pension", monthly_amount: 4166, expected_return_pct: 10.5, sip_date: 5 },
  { name: "HDFC Top 100 Bluechip", category: "Mutual Fund SIP", asset_class: "Equity", monthly_amount: 3000, expected_return_pct: 13.0, sip_date: 15 },
  { name: "Nippon India Gold ETF", category: "Gold / Silver ETF / SGB", asset_class: "Commodities / Gold", monthly_amount: 2000, expected_return_pct: 9.0, sip_date: 10 },
  { name: "Recurring Deposit (RD)", category: "Fixed / Recurring Deposit", asset_class: "Debt / Fixed Income", monthly_amount: 5000, expected_return_pct: 7.2, sip_date: 1 },
];

function getEmiCategoryIcon(catName: string) {
  const match = EMI_CATEGORIES.find((c) => c.label.toLowerCase() === catName.toLowerCase());
  return match ? match.icon : CreditCard;
}

function getSubCategoryIcon(catName: string) {
  const match = SUB_CATEGORIES.find((c) => c.label.toLowerCase() === catName.toLowerCase());
  return match ? match.icon : Package;
}

function getInvestmentCategoryIcon(catName: string) {
  const match = INVESTMENT_CATEGORIES.find((c) => c.label.toLowerCase() === catName.toLowerCase());
  return match ? match.icon : TrendingUp;
}

function computeLiveEMI(principal: number, interestPct: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (interestPct <= 0) return Math.round(principal / tenureMonths);
  const r = interestPct / 100 / 12;
  const n = tenureMonths;
  const emi = (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

function AccountsPage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  
  // EMIs Hooks
  const { data: emisList = [], isLoading: isLoadingEMIs } = useEMIs();
  const createEMIMutation = useCreateEMI();
  const updateEMIMutation = useUpdateEMI();
  const deleteEMIMutation = useDeleteEMI();

  // Subscriptions Hooks
  const { data: subsList = [], isLoading: isLoadingSubs } = useSubscriptions();
  const createSubMutation = useCreateSubscription();
  const updateSubMutation = useUpdateSubscription();
  const deleteSubMutation = useDeleteSubscription();

  // Investments Hooks
  const { data: invList = [], isLoading: isLoadingInv } = useInvestments();
  const createInvMutation = useCreateInvestment();
  const updateInvMutation = useUpdateInvestment();
  const deleteInvMutation = useDeleteInvestment();

  const [isEditing, setIsEditing] = useState(false);

  // Form states for Core Financial Profile Baseline
  const [name, setName] = useState(profile?.name || "User");
  const [income, setIncome] = useState(profile?.monthly_income || 0);
  const [essential, setEssential] = useState(profile?.essential_expenses || 0);
  const [discretionary, setDiscretionary] = useState(profile?.discretionary_expenses || 0);
  const [savings, setSavings] = useState(profile?.current_savings || 0);
  const [investments, setInvestments] = useState(profile?.monthly_investments || 0);

  // EMI modal / drawer state
  const [isAddingEMI, setIsAddingEMI] = useState(false);
  const [editingEMIId, setEditingEMIId] = useState<string | null>(null);
  const [emiName, setEmiName] = useState("");
  const [emiCategory, setEmiCategory] = useState("Home Loan");
  const [emiPrincipal, setEmiPrincipal] = useState<number>(500000);
  const [emiInterestRate, setEmiInterestRate] = useState<number>(8.5);
  const [emiTenureMonths, setEmiTenureMonths] = useState<number>(36);
  const [emiRemainingMonths, setEmiRemainingMonths] = useState<number>(36);
  const [emiCustomMonthly, setEmiCustomMonthly] = useState<string>("");

  // Subscription modal / drawer state
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subName, setSubName] = useState("");
  const [subCategory, setSubCategory] = useState("Streaming");
  const [subFreq, setSubFreq] = useState<string>("monthly");
  const [subAmount, setSubAmount] = useState<number>(649);
  const [subRenewalDate, setSubRenewalDate] = useState<string>("");
  const [subAutoRenew, setSubAutoRenew] = useState<boolean>(true);

  // Investment modal / drawer state
  const [isAddingInv, setIsAddingInv] = useState(false);
  const [editingInvId, setEditingInvId] = useState<string | null>(null);
  const [invName, setInvName] = useState("");
  const [invCategory, setInvCategory] = useState("Mutual Fund SIP");
  const [invAssetClass, setInvAssetClass] = useState("Equity");
  const [invMonthlyAmount, setInvMonthlyAmount] = useState<number>(5000);
  const [invExpectedReturnPct, setInvExpectedReturnPct] = useState<number>(12.5);
  const [invSipDate, setInvSipDate] = useState<number | undefined>(5);
  const [invStatus, setInvStatus] = useState("active");

  const emiSectionRef = useRef<HTMLDivElement>(null);
  const subSectionRef = useRef<HTMLDivElement>(null);
  const invSectionRef = useRef<HTMLDivElement>(null);


  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || "User");
      setIncome(profile.monthly_income || 0);
      setEssential(profile.essential_expenses || 0);
      setDiscretionary(profile.discretionary_expenses || 0);
      setSavings(profile.current_savings || 0);
      setInvestments(profile.monthly_investments || 0);
    }
  }, [profile]);

  const liquidAssets = profile?.current_savings || 0;
  const investedAssets = (profile?.monthly_investments || 0) * 12;
  const totalAssets = liquidAssets + investedAssets;
  const totalLiabilities = profile?.active_loans || 0;
  const netWorth = totalAssets - totalLiabilities;
  const monthlyExpenses = profile?.total_monthly_expenses || 0;
  const monthlySurplus = profile?.monthly_surplus || 0;
  const savingsRate = profile?.savings_rate_pct || 0;
  const dti = profile?.dti_ratio_pct || 0;
  const runway = profile?.emergency_fund_runway_months || 0;

  // Active EMIs metrics
  const totalEMIBurden = emisList.reduce((acc, curr) => acc + curr.monthly_emi, 0);
  const totalOutstandingLoan = emisList.reduce((acc, curr) => acc + curr.principal_amount, 0);
  const weightedInterestRate =
    totalOutstandingLoan > 0
      ? (
          emisList.reduce((acc, curr) => acc + curr.interest_rate_pct * curr.principal_amount, 0) /
          totalOutstandingLoan
        ).toFixed(1)
      : "0.0";
  const totalInterestPayableAll = emisList.reduce((acc, curr) => acc + curr.total_interest_payable, 0);

  // Subscriptions metrics
  const activeSubs = subsList.filter((s) => s.status.toLowerCase() !== "cancelled");
  const totalMonthlySubs = activeSubs.reduce((acc, curr) => acc + curr.monthly_equivalent, 0);
  const totalAnnualSubs = activeSubs.reduce((acc, curr) => acc + curr.annual_cost, 0);

  // Investments metrics
  const activeInvestments = invList.filter((i) => i.status.toLowerCase() !== "completed");
  const totalMonthlyInvestments = activeInvestments.reduce((acc, curr) => acc + curr.monthly_amount, 0);
  const totalAnnualInvested = activeInvestments.reduce((acc, curr) => acc + curr.annual_contribution, 0);
  const weightedExpectedReturn =
    totalMonthlyInvestments > 0
      ? (
          activeInvestments.reduce((acc, curr) => acc + curr.expected_return_pct * curr.monthly_amount, 0) /
          totalMonthlyInvestments
        ).toFixed(1)
      : "0.0";

  // Live estimated EMI in form
  const liveEstimatedEMI = computeLiveEMI(emiPrincipal, emiInterestRate, emiTenureMonths);
  const liveTotalInterest = Math.max(0, liveEstimatedEMI * emiRemainingMonths - emiPrincipal);

  // Live estimated subscription monthly cost
  const liveSubMonthlyEquiv =
    subFreq === "yearly" ? Math.round((subAmount / 12) * 100) / 100 : subFreq === "quarterly" ? Math.round((subAmount / 3) * 100) / 100 : subAmount;
  const liveSubAnnualCost =
    subFreq === "yearly" ? subAmount : subFreq === "quarterly" ? subAmount * 4 : subAmount * 12;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileMutation.mutateAsync({
      name: name.trim() || "User",
      monthly_income: Math.max(0, Number(income) || 0),
      essential_expenses: Math.max(0, Number(essential) || 0),
      discretionary_expenses: Math.max(0, Number(discretionary) || 0),
      current_savings: Math.max(0, Number(savings) || 0),
    });
    setIsEditing(false);
  };

  const handleOpenAddEMI = () => {
    setEditingEMIId(null);
    setEmiName("Home Loan");
    setEmiCategory("Home Loan");
    setEmiPrincipal(500000);
    setEmiInterestRate(8.5);
    setEmiTenureMonths(36);
    setEmiRemainingMonths(36);
    setEmiCustomMonthly("");
    setIsAddingEMI(true);
    setTimeout(() => {
      emiSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const handleOpenEditEMI = (emi: UserEMI) => {
    setEditingEMIId(emi.id);
    setEmiName(emi.name);
    setEmiCategory(emi.category);
    setEmiPrincipal(emi.principal_amount);
    setEmiInterestRate(emi.interest_rate_pct);
    setEmiTenureMonths(emi.tenure_months);
    setEmiRemainingMonths(emi.remaining_months);
    setEmiCustomMonthly(emi.monthly_emi ? String(emi.monthly_emi) : "");
    setIsAddingEMI(true);
    setTimeout(() => {
      emiSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const handleSaveEMI = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = emiName.trim() || `${emiCategory} (${currency(emiPrincipal)})`;

    const payload = {
      name: finalName,
      category: emiCategory,
      principal_amount: Number(emiPrincipal),
      interest_rate_pct: Number(emiInterestRate),
      tenure_months: Number(emiTenureMonths),
      remaining_months: Number(emiRemainingMonths),
      monthly_emi: emiCustomMonthly ? Number(emiCustomMonthly) : undefined,
    };

    try {
      if (editingEMIId) {
        await updateEMIMutation.mutateAsync({ emiId: editingEMIId, payload });
      } else {
        await createEMIMutation.mutateAsync(payload);
      }
      setIsAddingEMI(false);
      setEditingEMIId(null);
    } catch (err: any) {
      console.error("Failed to save ongoing EMI:", err);
      alert(err?.message || "Failed to save EMI obligation. Please check the entered values.");
    }
  };

  const handleDeleteEMI = async (emiId: string) => {
    if (confirm("Are you sure you want to close/remove this ongoing EMI?")) {
      await deleteEMIMutation.mutateAsync(emiId);
    }
  };

  const handleOpenAddSub = () => {
    setEditingSubId(null);
    setSubName("Netflix Premium");
    setSubCategory("Streaming");
    setSubFreq("monthly");
    setSubAmount(649);
    setSubRenewalDate("");
    setSubAutoRenew(true);
    setIsAddingSub(true);
    setTimeout(() => {
      subSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const handleOpenEditSub = (sub: UserSubscription) => {
    setEditingSubId(sub.id);
    setSubName(sub.name);
    setSubCategory(sub.category);
    setSubFreq(sub.billing_frequency);
    setSubAmount(sub.amount);
    setSubRenewalDate(sub.renewal_date || "");
    setSubAutoRenew(sub.auto_renew);
    setIsAddingSub(true);
    setTimeout(() => {
      subSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const handleSaveSub = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = subName.trim() || subCategory;

    const payload = {
      name: finalName,
      category: subCategory,
      billing_frequency: subFreq,
      amount: Number(subAmount),
      renewal_date: subRenewalDate || undefined,
      auto_renew: subAutoRenew,
      status: "active",
    };

    try {
      if (editingSubId) {
        await updateSubMutation.mutateAsync({ subId: editingSubId, payload });
      } else {
        await createSubMutation.mutateAsync(payload);
      }
      setIsAddingSub(false);
      setEditingSubId(null);
    } catch (err: any) {
      console.error("Failed to save subscription:", err);
      alert(err?.message || "Failed to save subscription. Please check the entered values.");
    }
  };

  const handleDeleteSub = async (subId: string) => {
    if (confirm("Are you sure you want to remove this subscription?")) {
      await deleteSubMutation.mutateAsync(subId);
    }
  };

  const handleOpenAddInvestment = () => {
    setEditingInvId(null);
    setInvName("Nifty 50 Index Fund SIP");
    setInvCategory("Mutual Fund SIP");
    setInvAssetClass("Equity");
    setInvMonthlyAmount(5000);
    setInvExpectedReturnPct(12.5);
    setInvSipDate(5);
    setInvStatus("active");
    setIsAddingInv(true);
    setTimeout(() => {
      invSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const handleOpenEditInvestment = (inv: UserInvestment) => {
    setEditingInvId(inv.id);
    setInvName(inv.name);
    setInvCategory(inv.category);
    setInvAssetClass(inv.asset_class);
    setInvMonthlyAmount(inv.monthly_amount);
    setInvExpectedReturnPct(inv.expected_return_pct);
    setInvSipDate(inv.sip_date || undefined);
    setInvStatus(inv.status);
    setIsAddingInv(true);
    setTimeout(() => {
      invSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const handleSaveInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = invName.trim() || invCategory;

    const payload = {
      name: finalName,
      category: invCategory,
      asset_class: invAssetClass,
      monthly_amount: Number(invMonthlyAmount),
      expected_return_pct: Number(invExpectedReturnPct),
      sip_date: invSipDate ? Number(invSipDate) : undefined,
      status: invStatus,
    };

    try {
      if (editingInvId) {
        await updateInvMutation.mutateAsync({ invId: editingInvId, payload });
      } else {
        await createInvMutation.mutateAsync(payload);
      }
      setIsAddingInv(false);
      setEditingInvId(null);
    } catch (err: any) {
      console.error("Failed to save investment:", err);
      alert(err?.message || "Failed to save investment. Please check the entered values.");
    }
  };

  const handleDeleteInvestment = async (invId: string) => {
    if (confirm("Are you sure you want to remove this investment / SIP?")) {
      await deleteInvMutation.mutateAsync(invId);
    }
  };

  const hasConfiguredProfile = (profile?.monthly_income || 0) > 0 || (profile?.current_savings || 0) > 0;

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <PageHeader
          eyebrow="Deterministic Financial Profile"
          title="Financial Baseline & Balance Sheet"
          description="Your verified cashflow parameters, active loans, recurring subscriptions, and investment SIP portfolio. All calculations use these deterministic values."
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenAddInvestment}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-500 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Monthly SIP</span>
          </button>
          <button
            onClick={handleOpenAddEMI}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Ongoing EMI</span>
          </button>
          <button
            onClick={handleOpenAddSub}
            className="inline-flex items-center gap-1.5 rounded-lg bg-info text-info-foreground px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Subscription</span>
          </button>
          <button
            onClick={() => {
              if (profile) {
                setName(profile.name || "User");
                setIncome(profile.monthly_income);
                setEssential(profile.essential_expenses);
                setDiscretionary(profile.discretionary_expenses);
                setSavings(profile.current_savings);
              }
              setIsEditing(!isEditing);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5 text-primary" />
            <span>{isEditing ? "Cancel" : hasConfiguredProfile ? "Edit Baseline" : "Setup Baseline"}</span>
          </button>
        </div>
      </div>

      {/* Calibrate Financial Parameters Form (Cleaned: EMIs, Subscriptions & Investments managed in dedicated elements) */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="mt-6 panel p-6 border-primary/30 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Calibrate Financial Parameters</h2>
              <p className="text-xs text-subtle-foreground mt-0.5">
                Core baseline income, living expenses, and liquid cash. EMIs, Subscriptions, and Monthly Investments/SIPs are automatically tracked in their dedicated modules below.
              </p>
            </div>
            <span className="text-[11px] text-positive bg-positive-soft px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" />
              Secure Isolation
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide font-semibold">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide font-semibold">Monthly Net Income (₹)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                min={0}
                placeholder="e.g. 85000"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium numeric focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide font-semibold">Essential Expenses (₹/mo)</label>
              <input
                type="number"
                value={essential}
                onChange={(e) => setEssential(Number(e.target.value))}
                min={0}
                placeholder="Rent, food, utilities"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium numeric focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide font-semibold">Discretionary Expenses (₹/mo)</label>
              <input
                type="number"
                value={discretionary}
                onChange={(e) => setDiscretionary(Number(e.target.value))}
                min={0}
                placeholder="Dining, leisure, shopping"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium numeric focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-subtle-foreground uppercase tracking-wide font-semibold">Liquid Cash / Savings (₹)</label>
              <input
                type="number"
                value={savings}
                onChange={(e) => setSavings(Number(e.target.value))}
                min={0}
                placeholder="Bank accounts, emergency cash"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium numeric focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{updateProfileMutation.isPending ? "Saving to Database..." : "Save Baseline"}</span>
            </button>
          </div>
        </form>
      )}


      {/* Primary KPI Metrics */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel p-5">
          <p className="text-xs uppercase tracking-wide text-subtle-foreground">Net Worth</p>
          <p className={cn("numeric mt-3 text-2xl font-semibold", netWorth >= 0 ? "text-foreground" : "text-risk")}>
            {currency(netWorth)}
          </p>
          <p className="text-[11px] text-subtle-foreground mt-2">
            Assets ({currency(totalAssets)}) − Debt ({currency(totalLiabilities)})
          </p>
        </div>

        <div className="panel p-5">
          <p className="text-xs uppercase tracking-wide text-subtle-foreground">Monthly Surplus</p>
          <p className={cn("numeric mt-3 text-2xl font-semibold", monthlySurplus > 0 ? "text-positive" : "text-attention")}>
            {currency(monthlySurplus)}
          </p>
          <p className="text-[11px] text-subtle-foreground mt-2">
            Income ({currency(profile?.monthly_income || 0)}) − Outflows ({currency(monthlyExpenses + (profile?.monthly_investments || 0))})
          </p>
        </div>

        <div className="panel p-5">
          <p className="text-xs uppercase tracking-wide text-subtle-foreground">Emergency Runway</p>
          <p className="numeric mt-3 text-2xl font-semibold text-foreground">
            {runway} <span className="text-base font-normal text-subtle-foreground">months</span>
          </p>
          <p className="text-[11px] text-subtle-foreground mt-2">
            {runway >= 6 ? "🟢 Strong safety buffer" : runway >= 3 ? "🟡 Moderate buffer" : "🔴 Low liquidity buffer"}
          </p>
        </div>

        <div className="panel p-5">
          <p className="text-xs uppercase tracking-wide text-subtle-foreground">Debt-to-Income (DTI)</p>
          <p className={cn("numeric mt-3 text-2xl font-semibold", dti <= 20 ? "text-positive" : dti <= 40 ? "text-attention" : "text-risk")}>
            {dti}%
          </p>
          <p className="text-[11px] text-subtle-foreground mt-2">
            {dti === 0 ? "No active EMI obligations" : dti <= 35 ? "Within healthy threshold (<35%)" : "High debt burden (>40%)"}
          </p>
        </div>
      </section>

      {/* 12-Month Net Worth Trajectory Chart */}
      <section className="mt-6 panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">12-Month Net Worth Trajectory Projection</h2>
            <p className="text-xs text-subtle-foreground mt-0.5">
              Deterministic wealth accumulation factoring monthly surplus (+{currency(monthlySurplus)}/mo), SIP compounding, and debt paydown.
            </p>
          </div>
          <span className={cn("numeric text-base font-bold", netWorth < 0 ? "text-risk" : "text-positive")}>
            {currency(netWorth)} (Current)
          </span>
        </div>
        <div className="mt-6">
          <NetWorthChart
            currentValue={netWorth}
            monthlySurplus={monthlySurplus}
            monthlyInvestments={totalMonthlyInvestments}
            totalDebt={totalLiabilities}
          />
        </div>
      </section>

      {/* DEDICATED ACTIVE EMIs & ONGOING LOAN PORTFOLIO */}
      <section ref={emiSectionRef} className="mt-8">
        <Panel
          title="Active EMIs & Ongoing Loan Portfolio"
          subtitle="Track all ongoing loans with explicit interest rates (% p.a.), remaining tenures, and monthly cashflow drag."
          className="border-border"
          action={
            <button
              onClick={handleOpenAddEMI}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Ongoing EMI</span>
            </button>
          }
        >
          {/* Inline Add / Edit Ongoing EMI Form */}
          {isAddingEMI && (
            <form onSubmit={handleSaveEMI} className="mt-2 mb-6 panel p-6 border-primary/40 bg-surface-elevated shadow-xl space-y-6 animate-in fade-in rounded-2xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary-soft text-primary">
                    <Calculator className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">
                      {editingEMIId ? "Edit Ongoing Loan / EMI" : "Add Ongoing Loan / EMI Obligation"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Enter loan details with annual interest rate. Monthly installments and interest totals are computed deterministically.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary-soft px-2.5 py-1 rounded-full">
                  Reducing Balance Math
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    Loan / EMI Name <span className="text-risk">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={emiName}
                    onChange={(e) => setEmiName(e.target.value)}
                    placeholder="e.g. HDFC Home Loan, Swift Car Loan"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    Loan Category
                  </label>
                  <select
                    value={emiCategory}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setEmiCategory(newCat);
                      if (!editingEMIId && (!emiName || EMI_CATEGORIES.some(c => c.label === emiName))) {
                        setEmiName(newCat);
                      }
                      const matched = EMI_CATEGORIES.find((c) => c.label === newCat);
                      if (matched && !editingEMIId) {
                        setEmiInterestRate(matched.defaultRate);
                      }
                    }}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {EMI_CATEGORIES.map((cat) => (
                      <option key={cat.label} value={cat.label}>
                        {cat.label} (~{cat.defaultRate}% p.a.)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    Loan Principal / Balance (₹) <span className="text-risk">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="any"
                    value={emiPrincipal}
                    onChange={(e) => setEmiPrincipal(Number(e.target.value))}
                    placeholder="e.g. 50000"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium numeric focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                      Interest Rate (% p.a.) <span className="text-risk">*</span>
                    </label>
                    <span className="text-xs font-bold text-primary">{emiInterestRate}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <input
                      type="range"
                      min={1.0}
                      max={30.0}
                      step={0.1}
                      value={emiInterestRate}
                      onChange={(e) => setEmiInterestRate(Number(e.target.value))}
                      className="flex-1 accent-primary cursor-pointer"
                    />
                    <input
                      type="number"
                      min={0.1}
                      max={50.0}
                      step={0.1}
                      value={emiInterestRate}
                      onChange={(e) => setEmiInterestRate(Number(e.target.value))}
                      className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-xs font-bold text-right focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    Total Tenure (Months) <span className="text-risk">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={360}
                    value={emiTenureMonths}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEmiTenureMonths(val);
                      if (emiRemainingMonths > val || !editingEMIId) {
                        setEmiRemainingMonths(val);
                      }
                    }}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium numeric focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    Remaining Months to Pay
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={emiTenureMonths}
                    value={emiRemainingMonths}
                    onChange={(e) => setEmiRemainingMonths(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium numeric focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Live Calculated Output Card */}
              <div className="p-4 rounded-xl border border-primary/30 bg-primary-soft/20 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-semibold text-subtle-foreground uppercase">Calculated Monthly EMI</p>
                  <p className="numeric text-xl font-bold text-primary mt-1">
                    {currency(emiCustomMonthly ? Number(emiCustomMonthly) : liveEstimatedEMI)} / mo
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Reducing balance installment</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-subtle-foreground uppercase">Total Interest to Pay</p>
                  <p className="numeric text-xl font-bold text-foreground mt-1">
                    {currency(liveTotalInterest)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Over {emiRemainingMonths} remaining months</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-subtle-foreground uppercase">Total Outflow (P + I)</p>
                  <p className="numeric text-xl font-bold text-risk mt-1">
                    {currency(emiPrincipal + liveTotalInterest)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Principal + Interest</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingEMI(false);
                    setEditingEMIId(null);
                  }}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createEMIMutation.isPending || updateEMIMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Check className="h-4 w-4" />
                  <span>
                    {createEMIMutation.isPending || updateEMIMutation.isPending
                      ? "Saving EMI..."
                      : editingEMIId
                      ? "Update EMI Obligation"
                      : "Save Ongoing EMI"}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Summary stats bar for EMIs */}
          <div className="grid gap-3 sm:grid-cols-4 p-4 rounded-xl bg-surface-muted/50 border border-border text-xs">
            <div>
              <span className="text-subtle-foreground uppercase tracking-wide text-[10px] font-semibold">Total Monthly EMI</span>
              <p className="numeric text-lg font-bold text-foreground mt-0.5">{currency(totalEMIBurden)} / mo</p>
              <span className="text-[10px] text-muted-foreground">{emisList.length} active loan{emisList.length === 1 ? "" : "s"}</span>
            </div>

            <div>
              <span className="text-subtle-foreground uppercase tracking-wide text-[10px] font-semibold">Total Outstanding Principal</span>
              <p className="numeric text-lg font-bold text-risk mt-0.5">{currency(totalOutstandingLoan)}</p>
              <span className="text-[10px] text-muted-foreground">Principal remaining</span>
            </div>

            <div>
              <span className="text-subtle-foreground uppercase tracking-wide text-[10px] font-semibold">Weighted Avg Interest</span>
              <p className="numeric text-lg font-bold text-primary mt-0.5">{weightedInterestRate}% p.a.</p>
              <span className="text-[10px] text-muted-foreground">Portfolio interest rate</span>
            </div>

            <div>
              <span className="text-subtle-foreground uppercase tracking-wide text-[10px] font-semibold">Total Future Interest</span>
              <p className="numeric text-lg font-bold text-attention mt-0.5">{currency(totalInterestPayableAll)}</p>
              <span className="text-[10px] text-muted-foreground">Interest over tenure</span>
            </div>
          </div>

          {/* EMI List */}
          <div className="mt-6 space-y-3">
            {emisList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">No Ongoing EMIs Added Yet</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                    Add your ongoing loans (home, car, personal, education, or gadget EMIs) along with their interest rates to see exact cashflow deductions and payoff timelines.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddEMI}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add First Ongoing EMI</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {emisList.map((emi) => {
                  const Icon = getEmiCategoryIcon(emi.category);
                  const progressPct = Math.round(
                    ((emi.tenure_months - emi.remaining_months) / emi.tenure_months) * 100
                  );
                  return (
                    <div
                      key={emi.id}
                      className="rounded-xl border border-border bg-surface p-4 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground leading-tight">{emi.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-semibold bg-surface-muted border border-border px-2 py-0.5 rounded text-subtle-foreground">
                                {emi.category}
                              </span>
                              <span className="text-[11px] font-bold text-primary flex items-center gap-0.5">
                                <Percent className="h-3 w-3" />
                                {emi.interest_rate_pct}% p.a.
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditEMI(emi)}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors cursor-pointer"
                            title="Edit EMI"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEMI(emi.id)}
                            className="p-1.5 text-muted-foreground hover:text-risk rounded-md hover:bg-risk-soft transition-colors cursor-pointer"
                            title="Close / Delete EMI"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Numbers Grid */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-xs">
                        <div>
                          <p className="text-[10px] text-subtle-foreground uppercase">Monthly EMI</p>
                          <p className="numeric text-sm font-bold text-foreground">{currency(emi.monthly_emi)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-subtle-foreground uppercase">Principal</p>
                          <p className="numeric text-sm font-bold text-subtle-foreground">{currency(emi.principal_amount)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-subtle-foreground uppercase">Interest Left</p>
                          <p className="numeric text-sm font-bold text-attention">{currency(emi.total_interest_payable)}</p>
                        </div>
                      </div>

                      {/* Tenure Progress */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Tenure Progress</span>
                          <span className="font-semibold text-foreground">
                            {emi.remaining_months} of {emi.tenure_months} mos remaining
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(5, progressPct)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Panel>
      </section>

      {/* DEDICATED ACTIVE SUBSCRIPTIONS & RECURRING OUTFLOWS */}
      <section ref={subSectionRef} className="mt-8">
        <Panel
          title="Active Subscriptions & Recurring Memberships"
          subtitle="Manage recurring services (Netflix, Amazon, Spotify, Gym, Cloud) with monthly or yearly billing cycles and auto-amortization."
          className="border-border"
          action={
            <button
              onClick={handleOpenAddSub}
              className="inline-flex items-center gap-1.5 rounded-lg bg-info text-info-foreground px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Subscription</span>
            </button>
          }
        >
          {/* Inline Add / Edit Subscription Form */}
          {isAddingSub && (
            <form onSubmit={handleSaveSub} className="mt-2 mb-6 panel p-6 border-info/40 bg-surface-elevated shadow-xl space-y-6 animate-in fade-in rounded-2xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-info-soft text-info">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">
                      {editingSubId ? "Edit Subscription / Recurring Outflow" : "Add Subscription / Recurring Outflow"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Track recurring services like Netflix, Amazon Prime, Spotify, Gym, or iCloud with monthly or yearly billing cycles.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-info bg-info-soft px-2.5 py-1 rounded-full">
                  Amortized Monthly
                </span>
              </div>

              {/* Quick Presets */}
              {!editingSubId && (
                <div>
                  <span className="text-[11px] font-semibold text-subtle-foreground uppercase tracking-wide block mb-2">
                    Quick Popular Presets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SUB_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setSubName(p.name);
                          setSubCategory(p.category);
                          setSubFreq(p.frequency);
                          setSubAmount(p.amount);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-border bg-surface-muted hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
                      >
                        <span>{p.name}</span>
                        <span className="text-muted-foreground font-mono">({currency(p.amount)}/{p.frequency === "yearly" ? "yr" : "mo"})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    Subscription Name <span className="text-risk">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="e.g. Netflix, Amazon Prime, Cult.fit"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    Category
                  </label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {SUB_CATEGORIES.map((c) => (
                      <option key={c.label} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    Billing Cycle <span className="text-risk">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setSubFreq("monthly")}
                      className={cn(
                        "py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer",
                        subFreq === "monthly"
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-surface text-muted-foreground border-border hover:bg-secondary"
                      )}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubFreq("yearly")}
                      className={cn(
                        "py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer",
                        subFreq === "yearly"
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-surface text-muted-foreground border-border hover:bg-secondary"
                      )}
                    >
                      Yearly / Annual
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    Billed Amount (₹ / {subFreq === "yearly" ? "year" : "month"}) <span className="text-risk">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="any"
                    value={subAmount}
                    onChange={(e) => setSubAmount(Number(e.target.value))}
                    placeholder={subFreq === "yearly" ? "e.g. 1499" : "e.g. 649"}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium numeric focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    Next Renewal Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={subRenewalDate}
                    onChange={(e) => setSubRenewalDate(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={subAutoRenew}
                      onChange={(e) => setSubAutoRenew(e.target.checked)}
                      className="accent-primary cursor-pointer h-4 w-4"
                    />
                    <span>Auto-renews automatically</span>
                  </label>
                </div>
              </div>

              {/* Live Amortization Output */}
              <div className="p-4 rounded-xl border border-info/30 bg-info-soft/20 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold text-subtle-foreground uppercase">Monthly Amortized Cost</p>
                  <p className="numeric text-xl font-bold text-info mt-1">
                    {currency(liveSubMonthlyEquiv)} / mo
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {subFreq === "yearly" ? `Amortized from ${currency(subAmount)}/year` : "Exact monthly outflow"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-subtle-foreground uppercase">Annual Financial Impact</p>
                  <p className="numeric text-xl font-bold text-foreground mt-1">
                    {currency(liveSubAnnualCost)} / yr
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Cumulative yearly cost</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingSub(false);
                    setEditingSubId(null);
                  }}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubMutation.isPending || updateSubMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-info text-info-foreground px-5 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Check className="h-4 w-4" />
                  <span>
                    {createSubMutation.isPending || updateSubMutation.isPending
                      ? "Saving Subscription..."
                      : editingSubId
                      ? "Update Subscription"
                      : "Save Subscription"}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Summary stats bar for Subscriptions */}
          <div className="grid gap-3 sm:grid-cols-3 p-4 rounded-xl bg-surface-muted/50 border border-border text-xs">
            <div>
              <span className="text-subtle-foreground uppercase tracking-wide text-[10px] font-semibold">Total Monthly Outflow</span>
              <p className="numeric text-lg font-bold text-info mt-0.5">{currency(totalMonthlySubs)} / mo</p>
              <span className="text-[10px] text-muted-foreground">{activeSubs.length} active subscription{activeSubs.length === 1 ? "" : "s"}</span>
            </div>

            <div>
              <span className="text-subtle-foreground uppercase tracking-wide text-[10px] font-semibold">Total Yearly Outflow</span>
              <p className="numeric text-lg font-bold text-foreground mt-0.5">{currency(totalAnnualSubs)} / yr</p>
              <span className="text-[10px] text-muted-foreground">Annualized recurring cost</span>
            </div>

            <div>
              <span className="text-subtle-foreground uppercase tracking-wide text-[10px] font-semibold">Average Per Service</span>
              <p className="numeric text-lg font-bold text-primary mt-0.5">
                {activeSubs.length > 0 ? currency(Math.round(totalMonthlySubs / activeSubs.length)) : "₹0"} / mo
              </p>
              <span className="text-[10px] text-muted-foreground">Average monthly commitment</span>
            </div>
          </div>

          {/* Subscriptions List */}
          <div className="mt-6 space-y-3">
            {subsList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-info-soft text-info">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">No Subscriptions Added Yet</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                    Add recurring services (Netflix, Amazon Prime, Spotify, Gym, Cloud storage, Broadband) to keep your baseline monthly cashflow 100% accurate.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddSub}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-info text-info-foreground px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add First Subscription</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subsList.map((sub) => {
                  const Icon = getSubCategoryIcon(sub.category);
                  const isYearly = sub.billing_frequency.toLowerCase() === "yearly";
                  return (
                    <div
                      key={sub.id}
                      className="rounded-xl border border-border bg-surface p-4 shadow-xs hover:border-info/40 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-soft text-info shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground leading-tight">{sub.name}</h4>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-semibold bg-surface-muted border border-border px-1.5 py-0.5 rounded text-subtle-foreground">
                                {sub.category}
                              </span>
                              <span className="text-[10px] font-bold text-info uppercase tracking-wider">
                                {sub.billing_frequency}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditSub(sub)}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors cursor-pointer"
                            title="Edit Subscription"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSub(sub.id)}
                            className="p-1.5 text-muted-foreground hover:text-risk rounded-md hover:bg-risk-soft transition-colors cursor-pointer"
                            title="Remove Subscription"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Pricing Details */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
                        <div>
                          <p className="text-[10px] text-subtle-foreground uppercase">Monthly Cost</p>
                          <p className="numeric text-sm font-bold text-foreground">{currency(sub.monthly_equivalent)} / mo</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-subtle-foreground uppercase">Billed Cycle</p>
                          <p className="numeric text-sm font-bold text-subtle-foreground">
                            {currency(sub.amount)} / {isYearly ? "yr" : "mo"}
                          </p>
                        </div>
                      </div>

                      {/* Renewal metadata */}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {sub.renewal_date ? `Renews on ${sub.renewal_date}` : "Ongoing auto-cycle"}
                        </span>
                        {sub.auto_renew && (
                          <span className="text-positive font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Auto
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Panel>
      </section>

      {/* DEDICATED ACTIVE MONTHLY INVESTMENTS & SYSTEMATIC INVESTMENT PLANS (SIP) */}
      <section ref={invSectionRef} className="mt-8">
        <Panel
          title="Active Monthly Investments & Systematic Investment Plans (SIP)"
          subtitle="Track mutual fund SIPs, direct equities, PPF/EPF, NPS, recurring deposits, and gold investments with expected return projections."
          className="border-border"
          action={
            <button
              onClick={handleOpenAddInvestment}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-500 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Monthly SIP</span>
            </button>
          }
        >
          {/* Inline Add / Edit Investment Form */}
          {isAddingInv && (
            <form onSubmit={handleSaveInvestment} className="mt-2 mb-6 panel p-6 border-emerald-500/40 bg-surface-elevated shadow-xl space-y-6 animate-in fade-in rounded-2xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">
                      {editingInvId ? "Edit Monthly Investment / SIP" : "Add Monthly Investment / SIP"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Add Systematic Investment Plans (SIP), index funds, PPF, NPS, or recurring deposits to build long-term wealth.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  Wealth Compounding
                </span>
              </div>

              {/* Quick Presets */}
              {!editingInvId && (
                <div>
                  <span className="text-[11px] font-semibold text-subtle-foreground uppercase tracking-wide block mb-2">
                    Popular Indian Investment Presets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_INVESTMENT_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setInvName(p.name);
                          setInvCategory(p.category);
                          setInvAssetClass(p.asset_class);
                          setInvMonthlyAmount(p.monthly_amount);
                          setInvExpectedReturnPct(p.expected_return_pct);
                          setInvSipDate(p.sip_date);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-border bg-surface-muted hover:border-emerald-500/40 hover:text-emerald-500 transition-all cursor-pointer"
                      >
                        <span>{p.name}</span>
                        <span className="text-muted-foreground font-mono">({currency(p.monthly_amount)}/mo @ {p.expected_return_pct}%)</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    Investment / SIP Name <span className="text-risk">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={invName}
                    onChange={(e) => setInvName(e.target.value)}
                    placeholder="e.g. Nifty 50 Index Fund, PPF, Parag Parikh Flexi Cap"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    Category
                  </label>
                  <select
                    value={invCategory}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setInvCategory(newCat);
                      const catConfig = INVESTMENT_CATEGORIES.find((c) => c.label === newCat);
                      if (catConfig) {
                        setInvExpectedReturnPct(catConfig.defaultRate);
                        setInvAssetClass(catConfig.defaultAsset);
                      }
                    }}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {INVESTMENT_CATEGORIES.map((c) => (
                      <option key={c.label} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    Asset Class
                  </label>
                  <select
                    value={invAssetClass}
                    onChange={(e) => setInvAssetClass(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {ASSET_CLASSES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    Monthly SIP Amount (₹ / mo) <span className="text-risk">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    step="any"
                    value={invMonthlyAmount}
                    onChange={(e) => setInvMonthlyAmount(Number(e.target.value))}
                    placeholder="e.g. 5000"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium numeric focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    Expected Return (% p.a.) <span className="text-risk">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    step={0.1}
                    value={invExpectedReturnPct}
                    onChange={(e) => setInvExpectedReturnPct(Number(e.target.value))}
                    placeholder="e.g. 12.5"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium numeric focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-subtle-foreground uppercase tracking-wide">
                    SIP Deduction Day (1-31)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={invSipDate || ""}
                    onChange={(e) => setInvSipDate(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 5th of each month"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium numeric focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Live Future Value Projections */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-semibold text-subtle-foreground uppercase">Annual Invested Capital</p>
                  <p className="numeric text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {currency(invMonthlyAmount * 12)} / yr
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">12 months contribution</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-subtle-foreground uppercase">Projected 5-Year Value</p>
                  <p className="numeric text-xl font-bold text-foreground mt-1">
                    {currency(
                      Math.round(
                        invMonthlyAmount > 0
                          ? invMonthlyAmount *
                              ((Math.pow(1 + invExpectedReturnPct / 100 / 12, 60) - 1) /
                                (invExpectedReturnPct / 100 / 12)) *
                              (1 + invExpectedReturnPct / 100 / 12)
                          : 0
                      )
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Invested: {currency(invMonthlyAmount * 60)}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-subtle-foreground uppercase">Projected 10-Year Value</p>
                  <p className="numeric text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {currency(
                      Math.round(
                        invMonthlyAmount > 0
                          ? invMonthlyAmount *
                              ((Math.pow(1 + invExpectedReturnPct / 100 / 12, 120) - 1) /
                                (invExpectedReturnPct / 100 / 12)) *
                              (1 + invExpectedReturnPct / 100 / 12)
                          : 0
                      )
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Invested: {currency(invMonthlyAmount * 120)}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingInv(false);
                    setEditingInvId(null);
                  }}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createInvMutation.isPending || updateInvMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-5 py-2 text-xs font-semibold hover:bg-emerald-500 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Check className="h-4 w-4" />
                  <span>
                    {createInvMutation.isPending || updateInvMutation.isPending
                      ? "Saving SIP..."
                      : editingInvId
                      ? "Update SIP / Investment"
                      : "Save Monthly SIP"}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Summary stats bar for Investments */}
          <div className="grid gap-3 sm:grid-cols-4 p-4 rounded-xl bg-surface-muted/50 border border-border text-xs">
            <div>
              <span className="text-subtle-foreground uppercase tracking-wide text-[10px] font-semibold">Total Monthly SIP</span>
              <p className="numeric text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{currency(totalMonthlyInvestments)} / mo</p>
              <span className="text-[10px] text-muted-foreground">{activeInvestments.length} active portfolio investment{activeInvestments.length === 1 ? "" : "s"}</span>
            </div>

            <div>
              <span className="text-subtle-foreground uppercase tracking-wide text-[10px] font-semibold">Annual Capital Outflow</span>
              <p className="numeric text-lg font-bold text-foreground mt-0.5">{currency(totalAnnualInvested)} / yr</p>
              <span className="text-[10px] text-muted-foreground">Cumulative yearly savings</span>
            </div>

            <div>
              <span className="text-subtle-foreground uppercase tracking-wide text-[10px] font-semibold">Weighted Avg Return</span>
              <p className="numeric text-lg font-bold text-primary mt-0.5">{weightedExpectedReturn}% p.a.</p>
              <span className="text-[10px] text-muted-foreground">Portfolio blended return</span>
            </div>

            <div>
              <span className="text-subtle-foreground uppercase tracking-wide text-[10px] font-semibold">10-Yr Projected Wealth</span>
              <p className="numeric text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {currency(
                  Math.round(
                    totalMonthlyInvestments > 0
                      ? totalMonthlyInvestments *
                          ((Math.pow(1 + Number(weightedExpectedReturn) / 100 / 12, 120) - 1) /
                            (Number(weightedExpectedReturn) / 100 / 12)) *
                          (1 + Number(weightedExpectedReturn) / 100 / 12)
                      : 0
                  )
                )}
              </p>
              <span className="text-[10px] text-muted-foreground">Compounded portfolio growth</span>
            </div>
          </div>

          {/* Investments List */}
          <div className="mt-6 space-y-3">
            {invList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">No Monthly Investments or SIPs Added Yet</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                    Add your Systematic Investment Plans (Nifty 50, Flexi Cap, PPF, NPS, Recurring Deposits, Stocks) to track wealth compounding and auto-calibrate your financial profile.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddInvestment}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-4 py-2 text-xs font-semibold hover:bg-emerald-500 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add First Monthly SIP</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {invList.map((inv) => {
                  const Icon = getInvestmentCategoryIcon(inv.category);
                  return (
                    <div
                      key={inv.id}
                      className="rounded-xl border border-border bg-surface p-4 shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground leading-tight">{inv.name}</h4>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[10px] font-semibold bg-surface-muted border border-border px-1.5 py-0.5 rounded text-subtle-foreground">
                                {inv.category}
                              </span>
                              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                {inv.asset_class}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditInvestment(inv)}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors cursor-pointer"
                            title="Edit Investment"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvestment(inv.id)}
                            className="p-1.5 text-muted-foreground hover:text-risk rounded-md hover:bg-risk-soft transition-colors cursor-pointer"
                            title="Remove Investment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Pricing / Return Details */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
                        <div>
                          <p className="text-[10px] text-subtle-foreground uppercase">Monthly SIP</p>
                          <p className="numeric text-sm font-bold text-emerald-600 dark:text-emerald-400">{currency(inv.monthly_amount)} / mo</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-subtle-foreground uppercase">Expected Return</p>
                          <p className="numeric text-sm font-bold text-foreground flex items-center gap-0.5">
                            <Percent className="h-3 w-3 text-primary" />
                            {inv.expected_return_pct}% p.a.
                          </p>
                        </div>
                      </div>

                      {/* Annual Capital & Deduction Day */}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                        <span>Annual: {currency(inv.annual_contribution)}</span>
                        {inv.sip_date ? (
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            Deducted on {inv.sip_date}{inv.sip_date === 1 ? "st" : inv.sip_date === 2 ? "nd" : inv.sip_date === 3 ? "rd" : "th"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Flexible SIP</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Panel>
      </section>

      {/* Net Worth Chart */}
      <Panel title="Net Worth Trajectory" subtitle="Dynamic baseline tracking assets vs debt obligations" className="mt-6">
        <div className="mt-6">
          <NetWorthChart currentValue={netWorth} />
        </div>
      </Panel>

      {/* Detailed Real Financial Balance Sheet Structure */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Assets & Cashflow Breakdown */}
        <Panel title="Assets & Inflows" subtitle="Liquid reserves, monthly earnings, and SIP growth">
          <ul className="mt-4 divide-y divide-border text-sm">
            <li className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-positive-soft text-positive">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Liquid Savings & Cash</p>
                  <p className="text-xs text-subtle-foreground">Immediate emergency buffer</p>
                </div>
              </div>
              <span className="numeric font-semibold text-foreground">{currency(liquidAssets)}</span>
            </li>

            <li className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info-soft text-info">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Monthly Investment (SIP)</p>
                  <p className="text-xs text-subtle-foreground">Savings rate: {savingsRate}% of income</p>
                </div>
              </div>
              <span className="numeric font-semibold text-foreground">{currency(profile?.monthly_investments || 0)} / mo</span>
            </li>

            <li className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface-muted text-subtle-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Monthly Net Income</p>
                  <p className="text-xs text-subtle-foreground">Primary cashflow driver</p>
                </div>
              </div>
              <span className="numeric font-semibold text-positive">+{currency(profile?.monthly_income || 0)} / mo</span>
            </li>
          </ul>
        </Panel>

        {/* Liabilities & Outflows Breakdown */}
        <Panel title="Liabilities & Outflows" subtitle="Essential, discretionary, and recurring obligations">
          <ul className="mt-4 divide-y divide-border text-sm">
            <li className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-risk-soft text-risk">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Outstanding Debt Principal</p>
                  <p className="text-xs text-subtle-foreground">Total remaining loan obligations</p>
                </div>
              </div>
              <span className="numeric font-semibold text-risk">{currency(totalLiabilities)}</span>
            </li>

            <li className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-attention-soft text-attention">
                  <PieChart className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Active Monthly EMIs</p>
                  <p className="text-xs text-subtle-foreground">DTI ratio: {dti}%</p>
                </div>
              </div>
              <span className="numeric font-semibold text-foreground">{currency(profile?.active_emis || 0)} / mo</span>
            </li>

            <li className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info-soft text-info">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Active Subscriptions & Recurring</p>
                  <p className="text-xs text-subtle-foreground">{activeSubs.length} active service{activeSubs.length === 1 ? "" : "s"}</p>
                </div>
              </div>
              <span className="numeric font-semibold text-foreground">{currency(profile?.other_recurring_expenses || 0)} / mo</span>
            </li>

            <li className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface-muted text-subtle-foreground">
                  <PieChart className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Essential Living Costs</p>
                  <p className="text-xs text-subtle-foreground">Housing, utilities, groceries, healthcare</p>
                </div>
              </div>
              <span className="numeric font-semibold text-foreground">{currency(profile?.essential_expenses || 0)} / mo</span>
            </li>

            <li className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface-muted text-subtle-foreground">
                  <PieChart className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Discretionary Spending</p>
                  <p className="text-xs text-subtle-foreground">Dining, shopping, leisure</p>
                </div>
              </div>
              <span className="numeric font-semibold text-foreground">{currency(profile?.discretionary_expenses || 0)} / mo</span>
            </li>
          </ul>
        </Panel>
      </section>
    </AppShell>
  );
}
