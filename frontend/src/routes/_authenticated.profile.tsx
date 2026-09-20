import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import {
  User,
  Mail,
  Phone,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  LogOut,
  Sparkles,
  Wallet,
  Calendar,
  Check,
  Building,
  KeyRound,
  Shield,
} from "lucide-react";
import {
  getCurrentUser,
  getCurrentUserId,
  fetchUserProfile,
  updateUserProfile,
  logoutUser,
  type MonexaUser,
} from "@/lib/api-client";
import { useProfile, useUpdateProfile } from "@/hooks/use-money-lens";
import { currency } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "User Profile & Security — Monexa" },
      {
        name: "description",
        content: "Manage your personal profile, credentials, security password, and financial settings.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile, refetch: refetchProfile } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const localUser = getCurrentUser();
  const userId = getCurrentUserId();

  // Personal Info Form State
  const [name, setName] = useState(localUser?.name || profile?.name || "");
  const [username, setUsername] = useState(localUser?.username || "");
  const [email, setEmail] = useState(localUser?.email || "");
  const [mobile, setMobile] = useState(localUser?.mobile || "");

  // Financial baseline state
  const [monthlyIncome, setMonthlyIncome] = useState<string>(
    profile?.monthly_income !== undefined ? String(profile.monthly_income) : "0"
  );
  const [essentialExpenses, setEssentialExpenses] = useState<string>(
    profile?.essential_expenses !== undefined ? String(profile.essential_expenses) : "0"
  );
  const [discretionaryExpenses, setDiscretionaryExpenses] = useState<string>(
    profile?.discretionary_expenses !== undefined ? String(profile.discretionary_expenses) : "0"
  );
  const [currentSavings, setCurrentSavings] = useState<string>(
    profile?.current_savings !== undefined ? String(profile.current_savings) : "0"
  );

  // Security / Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [initials, setInitials] = useState("U");

  // Load fresh user data on mount
  useEffect(() => {
    async function loadUser() {
      try {
        if (userId) {
          const fresh = await fetchUserProfile(userId);
          if (fresh) {
            setName(fresh.name || "");
            setUsername(fresh.username || "");
            setEmail(fresh.email || "");
            setMobile(fresh.mobile || "");
          }
        }
      } catch (err) {
        console.warn("Could not fetch user profile details:", err);
      }
    }
    loadUser();
  }, [userId]);

  useEffect(() => {
    if (profile) {
      if (!name) setName(profile.name || "");
      setMonthlyIncome(String(profile.monthly_income || 0));
      setEssentialExpenses(String(profile.essential_expenses || 0));
      setDiscretionaryExpenses(String(profile.discretionary_expenses || 0));
      setCurrentSavings(String(profile.current_savings || 0));
    }
  }, [profile]);

  useEffect(() => {
    const raw = name || localUser?.name || "User";
    const parts = raw.trim().split(" ");
    if (parts.length > 1) {
      setInitials((parts[0][0] + parts[1][0]).toUpperCase());
    } else {
      setInitials(raw.slice(0, 2).toUpperCase());
    }
  }, [name, localUser]);

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\/`~]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
  const passwordsMatch = newPassword && newPassword === confirmPassword;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      // 1. Validate password if provided
      if (newPassword) {
        if (!isPasswordValid) {
          throw new Error("New password does not meet security requirements.");
        }
        if (!passwordsMatch) {
          throw new Error("New passwords do not match.");
        }
        if (!currentPassword) {
          throw new Error("Please enter your current password to set a new password.");
        }
      }

      // 2. Validate financial baseline figures (>= 0)
      const inc = Math.max(0, Number(monthlyIncome) || 0);
      const ess = Math.max(0, Number(essentialExpenses) || 0);
      const disc = Math.max(0, Number(discretionaryExpenses) || 0);
      const sav = Math.max(0, Number(currentSavings) || 0);

      // 3. Update auth user record in RDS PostgreSQL
      const updatedUser = await updateUserProfile(userId, {
        name: name.trim(),
        username: username.trim().toLowerCase() || undefined,
        mobile: mobile.trim() || undefined,
        monthly_income: inc,
        essential_expenses: ess,
        discretionary_expenses: disc,
        current_savings: sav,
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
      });

      // 4. Update financial baseline profile via mutation
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        monthly_income: inc,
        essential_expenses: ess,
        discretionary_expenses: disc,
        current_savings: sav,
      });

      await refetchProfile();

      // Clear password fields on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSaveSuccess("Profile and security settings saved successfully!");
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setSaveError(err?.message || "Failed to update profile details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate({ to: "/login" });
  };

  const handleResetForm = () => {
    setName(localUser?.name || profile?.name || "");
    setUsername(localUser?.username || "");
    setEmail(localUser?.email || "");
    setMobile(localUser?.mobile || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSaveError(null);
    setSaveSuccess(null);
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-page-enter">
        {/* Page Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-positive inline-block animate-pulse" />
              <p className="text-xs font-semibold tracking-wider uppercase text-subtle-foreground">
                Account & Security Management
              </p>
            </div>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl text-foreground font-semibold">
              User Profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review and update your personal details, credentials, and password.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-risk/30 bg-risk-soft px-4 py-2.5 text-xs font-bold text-risk hover:bg-risk hover:text-white transition-all duration-200 cursor-pointer active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </section>

        {/* Feedback Alerts */}
        {saveSuccess && (
          <div className="p-4 rounded-xl border border-positive/30 bg-positive-soft text-positive flex items-center gap-3 animate-fade-in-up">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="text-sm font-semibold">{saveSuccess}</p>
          </div>
        )}

        {saveError && (
          <div className="p-4 rounded-xl border border-risk/30 bg-risk-soft text-risk flex items-center gap-3 animate-fade-in-up">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-semibold">{saveError}</p>
          </div>
        )}

        {/* User Identity Banner Card */}
        <section className="panel p-6 sm:p-8 bg-gradient-to-r from-surface to-surface-muted border-border flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-primary-soft text-2xl sm:text-3xl font-black text-accent-foreground border-2 border-primary/30 shadow-md">
              {initials}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-positive text-white border-2 border-surface shadow-xs">
              <Check className="h-4 w-4 stroke-[3]" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{name || "User"}</h2>
              {username && (
                <span className="text-xs font-mono font-semibold text-primary bg-primary-soft px-2.5 py-1 rounded-md border border-primary/20 self-center sm:self-auto">
                  @{username}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-0.5 rounded-full self-center sm:self-auto">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Monexa Account
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{email}</p>
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-subtle-foreground">
              {mobile && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {mobile}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Deterministic Isolation Active
              </span>
            </div>
          </div>
        </section>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* Personal Information Grid */}
          <section className="panel p-6 sm:p-8 space-y-6">
            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
              </div>
              <p className="text-xs sm:text-sm text-subtle-foreground mt-1">
                Update your display name, username identifier, and contact phone number.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ranvir Singh"
                    className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>Username</span>
                  <span className="text-[11px] text-muted-foreground font-normal">Unique @handle</span>
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ranvir_singh"
                    className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm font-mono text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email (Read-Only Verified) */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[11px] text-positive font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-xl border border-border bg-surface-muted/60 pl-10 pr-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed outline-none select-none"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>Mobile Phone</span>
                  <span className="text-[11px] text-muted-foreground font-normal">For OTP security</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Financial Baseline Parameters Quick Calibration */}
          <section className="panel p-6 sm:p-8 space-y-6">
            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Deterministic Financial Baseline</h2>
              </div>
              <p className="text-xs sm:text-sm text-subtle-foreground mt-1">
                Core monthly cashflow numbers powering your AI radar, runway, and net worth trajectory projections.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Monthly Income */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground">Monthly Net Inflow</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface pl-8 pr-4 py-2.5 text-sm font-bold text-foreground numeric focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Essential Expenses */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground">Essential Expenses</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={essentialExpenses}
                    onChange={(e) => setEssentialExpenses(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface pl-8 pr-4 py-2.5 text-sm font-bold text-foreground numeric focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Discretionary Expenses */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground">Discretionary Spending</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={discretionaryExpenses}
                    onChange={(e) => setDiscretionaryExpenses(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface pl-8 pr-4 py-2.5 text-sm font-bold text-foreground numeric focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Liquid Savings */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground">Liquid Savings</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface pl-8 pr-4 py-2.5 text-sm font-bold text-foreground numeric focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Security & Password Change */}
          <section className="panel p-6 sm:p-8 space-y-6">
            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Change Password</h2>
              </div>
              <p className="text-xs sm:text-sm text-subtle-foreground mt-1">
                Leave blank if you do not wish to change your current password.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-surface pl-10 pr-10 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-surface pl-10 pr-10 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Password Requirements Checklist (shown when typing new password) */}
            {newPassword.length > 0 && (
              <div className="p-4 rounded-xl bg-surface-muted/40 border border-border space-y-2 animate-fade-in-up">
                <p className="text-xs font-bold text-foreground">Password Requirements:</p>
                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  <div className={cn("flex items-center gap-1.5", hasMinLength ? "text-positive font-semibold" : "text-muted-foreground")}>
                    <CheckCircle2 className={cn("h-3.5 w-3.5", hasMinLength ? "text-positive" : "text-muted-foreground/50")} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={cn("flex items-center gap-1.5", hasUpper ? "text-positive font-semibold" : "text-muted-foreground")}>
                    <CheckCircle2 className={cn("h-3.5 w-3.5", hasUpper ? "text-positive" : "text-muted-foreground/50")} />
                    <span>At least 1 uppercase letter (A-Z)</span>
                  </div>
                  <div className={cn("flex items-center gap-1.5", hasLower ? "text-positive font-semibold" : "text-muted-foreground")}>
                    <CheckCircle2 className={cn("h-3.5 w-3.5", hasLower ? "text-positive" : "text-muted-foreground/50")} />
                    <span>At least 1 lowercase letter (a-z)</span>
                  </div>
                  <div className={cn("flex items-center gap-1.5", hasNumber ? "text-positive font-semibold" : "text-muted-foreground")}>
                    <CheckCircle2 className={cn("h-3.5 w-3.5", hasNumber ? "text-positive" : "text-muted-foreground/50")} />
                    <span>At least 1 number (0-9)</span>
                  </div>
                  <div className={cn("flex items-center gap-1.5", hasSpecial ? "text-positive font-semibold" : "text-muted-foreground")}>
                    <CheckCircle2 className={cn("h-3.5 w-3.5", hasSpecial ? "text-positive" : "text-muted-foreground/50")} />
                    <span>At least 1 special character (!@#$%^&*)</span>
                  </div>
                  <div className={cn("flex items-center gap-1.5", passwordsMatch ? "text-positive font-semibold" : "text-muted-foreground")}>
                    <CheckCircle2 className={cn("h-3.5 w-3.5", passwordsMatch ? "text-positive" : "text-muted-foreground/50")} />
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-xs sm:text-sm font-semibold text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Changes</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3 text-xs sm:text-sm font-bold shadow-md hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Profile & Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
