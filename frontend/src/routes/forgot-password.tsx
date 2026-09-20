import { useState, useEffect, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  LoaderCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  KeyRound,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtp, resetPassword } from "@/lib/api-client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Monexa" },
      { name: "description", content: "Request a secure Monexa password reset code." },
      { property: "og:title", content: "Reset password — Monexa" },
      { property: "og:description", content: "Request a secure password reset code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const passwordChecks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>\-_+=[\]\\/`~]/.test(newPassword),
  };

  const isPasswordValid =
    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.lowercase &&
    passwordChecks.number &&
    passwordChecks.special;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "verify" && countdown > 0) {
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

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await sendOtp(email.trim().toLowerCase(), "reset");
      setStep("verify");
      setCountdown(60);
      setCanResend(false);
      setMessage(res.message || `A password reset code was sent to ${email}.`);
    } catch (err: any) {
      setError(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    if (!isPasswordValid) {
      setError("Please ensure your new password satisfies all security criteria.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await resetPassword({
        email: email.trim().toLowerCase(),
        otp_code: otpCode.trim(),
        new_password: newPassword,
      });

      if (res && res.user) {
        localStorage.setItem("monexa_user", JSON.stringify(res.user));
        localStorage.setItem("moneylens_user", JSON.stringify(res.user));
        if (res.token) {
          localStorage.setItem("monexa_token", res.token);
        }
      }

      setMessage("Password updated successfully! Redirecting to workspace...");
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 800);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please check your verification code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!canResend || loading) return;
    setLoading(true);
    setError("");
    try {
      await sendOtp(email.trim().toLowerCase(), "reset");
      setCountdown(60);
      setCanResend(false);
      setMessage(`A fresh 6-digit reset code has been sent to ${email}.`);
    } catch (err: any) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password."
      description={
        step === "email"
          ? "Enter your registered email and we’ll dispatch a secure 6-digit verification code."
          : `Enter the 6-digit code sent to ${email} and choose a strong new password.`
      }
    >
      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="space-y-5 animate-scale-in">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-primary" />
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ranvir@monexa.io"
              className="h-11 bg-background/70 border-border/80 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 transition-all"
              required
              autoFocus
            />
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

          {message && (
            <div
              role="status"
              className="rounded-lg border border-positive/30 bg-positive-soft px-3.5 py-2.5 text-xs text-positive animate-fade-in flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <Button
            type="submit"
            className="h-11 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Send Verification Code
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Remembered your password?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-5 animate-scale-in">
          {/* OTP Code Input */}
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>6-Digit Security Code</span>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                  setMessage("");
                }}
                className="text-[11px] text-muted-foreground hover:text-primary hover:underline"
              >
                Change email
              </button>
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
              className="h-12 text-center font-mono text-xl tracking-[0.4em] bg-background/80 border-border/80 focus:border-primary font-bold"
              required
              autoFocus
            />
          </div>

          {/* New Password Input */}
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-primary" />
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                className="h-11 bg-background/70 border-border/80 pr-11 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Security Checklist */}
            {newPassword.length > 0 && (
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
                    <span>1 number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordChecks.special ? "text-positive" : "text-muted-foreground"}`}>
                    {passwordChecks.special ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 ml-0.5" />}
                    <span>1 special symbol</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleResend}
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

          {message && (
            <div
              role="status"
              className="rounded-lg border border-positive/30 bg-positive-soft px-3.5 py-2.5 text-xs text-positive animate-fade-in flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <Button
            type="submit"
            className="h-11 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
            disabled={loading || otpCode.length !== 6 || !isPasswordValid}
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Update Password & Enter
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Back to{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}