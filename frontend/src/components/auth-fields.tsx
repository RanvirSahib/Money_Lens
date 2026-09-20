import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
  User,
  Phone,
  Lock,
  AtSign,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Wallet,
  PiggyBank,
  Coins,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleMark } from "@/components/auth-shell";
import {
  loginUser,
  registerUser,
  sendOtp,
  verifyOtp,
  type MonexaUser,
} from "@/lib/api-client";

type Mode = "login" | "signup";

interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export function AuthFields({ mode }: { mode: Mode }) {
  const navigate = useNavigate();

  // Login form state
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state - Credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [username, setUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Signup form state - Financial Baseline Parameters (Not auto-filled, user-provided >= 0)
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [essentialExpenses, setEssentialExpenses] = useState("");
  const [discretionaryExpenses, setDiscretionaryExpenses] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");

  // OTP Verification state
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Real-time password validation criteria
  const passwordChecks: PasswordValidation = {
    length: signupPassword.length >= 8,
    uppercase: /[A-Z]/.test(signupPassword),
    lowercase: /[a-z]/.test(signupPassword),
    number: /[0-9]/.test(signupPassword),
    special: /[!@#$%^&*(),.?":{}|<>\-_+=[\]\\/`~]/.test(signupPassword),
  };

  const isPasswordValid =
    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.lowercase &&
    passwordChecks.number &&
    passwordChecks.special;

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  function persistSession(user: MonexaUser, token?: string) {
    localStorage.setItem("monexa_user", JSON.stringify(user));
    localStorage.setItem("moneylens_user", JSON.stringify(user));
    if (token) {
      localStorage.setItem("monexa_token", token);
    }
  }

  // Handle Login submission
  async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!identifier.trim() || !loginPassword) {
      setError("Please provide your email/username and password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await loginUser(identifier.trim(), loginPassword);
      if (res && res.user) {
        persistSession(res.user, res.token);
        setSuccessMessage("Welcome back! Redirecting to workspace...");
        setTimeout(() => {
          navigate({ to: "/dashboard" });
        }, 600);
      } else {
        throw new Error("Invalid login response received from server.");
      }
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to authenticate. Please check your email/username and password."
      );
    } finally {
      setLoading(false);
    }
  }

  // Step 1 of Signup: Validate fields and dispatch OTP
  async function handleSignupFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!username.trim() || username.length < 3) {
      setError("Username must be at least 3 alphanumeric characters.");
      return;
    }
    if (!isPasswordValid) {
      setError("Please satisfy all password security requirements.");
      return;
    }

    // Financial Baseline Parameters Validation (Mandatory, >= 0)
    if (monthlyIncome.trim() === "") {
      setError("Please enter your Monthly Net Income (can be 0 or more).");
      return;
    }
    const parsedIncome = Number(monthlyIncome);
    if (isNaN(parsedIncome) || parsedIncome < 0) {
      setError("Monthly Net Income must be 0 or more (cannot be negative).");
      return;
    }

    if (essentialExpenses.trim() === "") {
      setError("Please enter your Essential Expenses (can be 0 or more).");
      return;
    }
    const parsedEssential = Number(essentialExpenses);
    if (isNaN(parsedEssential) || parsedEssential < 0) {
      setError("Essential Expenses must be 0 or more (cannot be negative).");
      return;
    }

    if (discretionaryExpenses.trim() === "") {
      setError("Please enter your Discretionary Expenses (can be 0 or more).");
      return;
    }
    const parsedDiscretionary = Number(discretionaryExpenses);
    if (isNaN(parsedDiscretionary) || parsedDiscretionary < 0) {
      setError("Discretionary Expenses must be 0 or more (cannot be negative).");
      return;
    }

    if (currentSavings.trim() === "") {
      setError("Please enter your Liquid Cash / Savings (can be 0 or more).");
      return;
    }
    const parsedSavings = Number(currentSavings);
    if (isNaN(parsedSavings) || parsedSavings < 0) {
      setError("Liquid Cash / Savings must be 0 or more (cannot be negative).");
      return;
    }

    setLoading(true);

    try {
      // Dispatch verification OTP to the user's email
      const otpRes = await sendOtp(email.trim().toLowerCase(), "signup");
      setStep("otp");
      setCountdown(60);
      setCanResend(false);
      setSuccessMessage(
        otpRes.message || `A 6-digit verification code was sent to ${email}.`
      );
    } catch (err: any) {
      setError(err.message || "Unable to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2 of Signup: Verify OTP and create user account
  async function handleOtpSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Verify OTP first
      await verifyOtp(email.trim().toLowerCase(), otpCode.trim());

      const incomeVal = Number(monthlyIncome) || 0;
      const essentialVal = Number(essentialExpenses) || 0;
      const discretionaryVal = Number(discretionaryExpenses) || 0;
      const savingsVal = Number(currentSavings) || 0;

      // Register the account with exact user-provided financial parameters
      const res = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim() || undefined,
        username: username.trim().toLowerCase(),
        password: signupPassword,
        otp_code: otpCode.trim(),
        monthly_income: incomeVal,
        essential_expenses: essentialVal,
        discretionary_expenses: discretionaryVal,
        monthly_expenses: essentialVal + discretionaryVal,
        current_savings: savingsVal,
      });

      persistSession(res.user, res.token);
      setSuccessMessage("Account created & verified! Directing to dashboard...");
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 700);
    } catch (err: any) {
      setError(
        err.message || "Failed to complete account registration. Please check the code."
      );
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP handler
  async function handleResendOtp() {
    if (!canResend || loading) return;
    setLoading(true);
    setError("");

    try {
      await sendOtp(email.trim().toLowerCase(), "signup");
      setCountdown(60);
      setCanResend(false);
      setSuccessMessage(`A new 6-digit code has been sent to ${email}.`);
    } catch (err: any) {
      setError(err.message || "Failed to resend verification code.");
    } finally {
      setLoading(false);
    }
  }

  // Demo Google Sign-In
  async function handleGoogle() {
    setLoading(true);
    setError("");
    setTimeout(() => {
      const demoUser: MonexaUser = {
        id: "usr_google_demo",
        email: "google.user@monexa.io",
        name: "Google Member",
        username: "google_member",
        monthly_income: 0,
        monthly_expenses: 0,
        current_savings: 0,
        health_score: 50,
      };
      persistSession(demoUser, "ml_token_google");
      navigate({ to: "/dashboard" });
    }, 600);
  }

  // Render Login Mode
  if (mode === "login") {
    return (
      <div className="space-y-6 animate-scale-in">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full border-border/80 bg-background/50 hover:bg-card hover:border-primary/40 transition-all font-medium"
          onClick={handleGoogle}
          disabled={loading}
        >
          <GoogleMark /> Continue with Google
        </Button>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border/60" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
            or sign in with credentials
          </span>
          <span className="h-px flex-1 bg-border/60" />
        </div>

        <form className="space-y-5" onSubmit={handleLoginSubmit}>
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <AtSign className="h-3.5 w-3.5 text-primary" />
              Email or Username
            </Label>
            <div className="relative">
              <Input
                id="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. ranvir_singh or investor@monexa.io"
                className="h-11 bg-background/70 border-border/80 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" />
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                type={showLoginPassword ? "text" : "password"}
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-11 bg-background/70 border-border/80 pr-11 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
              <button
                type="button"
                aria-label={showLoginPassword ? "Hide password" : "Show password"}
                onClick={() => setShowLoginPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-risk/30 bg-risk-soft px-3.5 py-2.5 text-xs text-risk animate-fade-in flex items-center gap-2"
            >
              <XCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="rounded-lg border border-positive/30 bg-positive-soft px-3.5 py-2.5 text-xs text-positive animate-fade-in flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <Button
            type="submit"
            className="h-11 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            disabled={loading}
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : null}
            Sign in to Workspace
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          New to Monexa?{" "}
          <Link
            to="/create-account"
            className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    );
  }

  // Render Signup Mode - Step 2: OTP Verification
  if (step === "otp") {
    return (
      <div className="space-y-6 animate-scale-in">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Verify Your Email</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            We sent a 6-digit confirmation code to{" "}
            <span className="font-semibold text-primary">{email}</span>
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleOtpSubmit}>
          <div className="space-y-2 text-center">
            <Label htmlFor="otp" className="text-xs font-semibold text-foreground">
              6-Digit Security Code
            </Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="h-14 text-center font-mono text-2xl tracking-[0.5em] bg-background/80 border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 font-bold"
              required
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setStep("form");
                setError("");
                setSuccessMessage("");
              }}
              className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
            >
              ← Edit details
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={!canResend || loading}
              className={`flex items-center gap-1.5 font-medium transition-colors ${
                canResend
                  ? "text-primary hover:underline hover:text-primary/80 cursor-pointer"
                  : "text-muted-foreground/60 cursor-not-allowed"
              }`}
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              {canResend ? "Resend code" : `Resend in ${countdown}s`}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-risk/30 bg-risk-soft px-3.5 py-2.5 text-xs text-risk animate-fade-in flex items-center gap-2"
            >
              <XCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="rounded-lg border border-positive/30 bg-positive-soft px-3.5 py-2.5 text-xs text-positive animate-fade-in flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <Button
            type="submit"
            className="h-11 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
            disabled={loading || otpCode.length !== 6}
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Verify & Activate Account
          </Button>
        </form>
      </div>
    );
  }

  // Render Signup Mode - Step 1: Registration Details Form
  return (
    <div className="space-y-6 animate-scale-in">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full border-border/80 bg-background/50 hover:bg-card hover:border-primary/40 transition-all font-medium"
        onClick={handleGoogle}
        disabled={loading}
      >
        <GoogleMark /> Sign up with Google
      </Button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border/60" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
          or complete your details
        </span>
        <span className="h-px flex-1 bg-border/60" />
      </div>

      <form className="space-y-4" onSubmit={handleSignupFormSubmit}>
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="fullname" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-primary" />
            Full Name
          </Label>
          <Input
            id="fullname"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ranvir Singh"
            className="h-10 bg-background/70 border-border/80 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 transition-all"
            required
          />
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <Label htmlFor="signup-email" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-primary" />
            Email Address <span className="text-[10px] text-muted-foreground font-normal">(must be unique)</span>
          </Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. ranvir@monexa.io"
            className="h-10 bg-background/70 border-border/80 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 transition-all"
            required
          />
        </div>

        {/* Mobile Number & Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="mobile" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-primary" />
              Mobile Number
            </Label>
            <Input
              id="mobile"
              type="tel"
              autoComplete="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+91 98765 43210"
              className="h-10 bg-background/70 border-border/80 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <AtSign className="h-3.5 w-3.5 text-primary" />
              Unique Username
            </Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
              placeholder="ranvir_singh"
              className="h-10 bg-background/70 border-border/80 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="signup-password" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-primary" />
            Password
          </Label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showSignupPassword ? "text" : "password"}
              autoComplete="new-password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="Create a strong password"
              className="h-10 bg-background/70 border-border/80 pr-11 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
            <button
              type="button"
              aria-label={showSignupPassword ? "Hide password" : "Show password"}
              onClick={() => setShowSignupPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Real-time Password Strength Criteria Checklist */}
          {signupPassword.length > 0 && (
            <div className="rounded-lg border border-border/60 bg-card/60 p-2.5 mt-2 space-y-1.5 text-[11px] animate-fade-in">
              <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
                Security Checklist
              </p>
              <div className="grid grid-cols-2 gap-1">
                <div className={`flex items-center gap-1.5 ${passwordChecks.length ? "text-positive" : "text-muted-foreground"}`}>
                  {passwordChecks.length ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 ml-0.5" />}
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.uppercase ? "text-positive" : "text-muted-foreground"}`}>
                  {passwordChecks.uppercase ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 ml-0.5" />}
                  <span>1 uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.number ? "text-positive" : "text-muted-foreground"}`}>
                  {passwordChecks.number ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 ml-0.5" />}
                  <span>1 numeric number</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.special ? "text-positive" : "text-muted-foreground"}`}>
                  {passwordChecks.special ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 ml-0.5" />}
                  <span>1 special symbol (!@#)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Calibrate Financial Baseline Parameters (User-filled, Mandatory >= 0) */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-3 mt-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">Calibrate Financial Parameters</h4>
                <p className="text-[10px] text-muted-foreground">Mandatory baseline to power your intelligence engine (enter 0 or more)</p>
              </div>
            </div>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary uppercase tracking-wider">
              Mandatory (≥ 0)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* Monthly Net Income */}
            <div className="space-y-1">
              <Label htmlFor="monthly-income" className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                <span>Monthly Net Income (₹)</span>
                <span className="text-[10px] text-primary font-mono font-normal">≥ 0</span>
              </Label>
              <Input
                id="monthly-income"
                type="number"
                min="0"
                step="500"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="e.g. 75000 (or 0)"
                className="h-9 text-xs bg-background/80 border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>

            {/* Essential Expenses */}
            <div className="space-y-1">
              <Label htmlFor="essential-expenses" className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                <span>Essential Expenses (₹/mo)</span>
                <span className="text-[10px] text-primary font-mono font-normal">≥ 0</span>
              </Label>
              <Input
                id="essential-expenses"
                type="number"
                min="0"
                step="500"
                value={essentialExpenses}
                onChange={(e) => setEssentialExpenses(e.target.value)}
                placeholder="e.g. 25000 (or 0)"
                className="h-9 text-xs bg-background/80 border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>

            {/* Discretionary Expenses */}
            <div className="space-y-1">
              <Label htmlFor="discretionary-expenses" className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                <span>Discretionary Expenses (₹/mo)</span>
                <span className="text-[10px] text-primary font-mono font-normal">≥ 0</span>
              </Label>
              <Input
                id="discretionary-expenses"
                type="number"
                min="0"
                step="500"
                value={discretionaryExpenses}
                onChange={(e) => setDiscretionaryExpenses(e.target.value)}
                placeholder="e.g. 15000 (or 0)"
                className="h-9 text-xs bg-background/80 border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>

            {/* Liquid Cash / Savings */}
            <div className="space-y-1">
              <Label htmlFor="current-savings" className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                <span>Liquid Cash / Savings (₹)</span>
                <span className="text-[10px] text-primary font-mono font-normal">≥ 0</span>
              </Label>
              <Input
                id="current-savings"
                type="number"
                min="0"
                step="1000"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(e.target.value)}
                placeholder="e.g. 100000 (or 0)"
                className="h-9 text-xs bg-background/80 border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-risk/30 bg-risk-soft px-3.5 py-2.5 text-xs text-risk animate-fade-in flex items-center gap-2"
          >
            <XCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="h-11 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
          disabled={loading || !isPasswordValid}
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Continue to Email Verification
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}