'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ScreenId } from '../types';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onNavigate: (screen: ScreenId) => void;
  targetScreen?: ScreenId;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, targetScreen }) => {
  const { login, signup, sendOtp, verifyOtp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [signupStep, setSignupStep] = useState<'form' | 'otp'>('form');

  // Form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState(''); // Email or Username for Login
  const [password, setPassword] = useState('');
  const [income, setIncome] = useState('85000');
  const [expenses, setExpenses] = useState('35000');
  const [savings, setSavings] = useState('150000');

  // 6-digit OTP state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Password validation breakdown
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\/`~]/.test(password);
  const isPasswordStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  // Resend Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (signupStep === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [signupStep, resendTimer]);

  // Handle Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const loginId = identifier.trim() || email.trim();
    if (!loginId || !password) {
      setErrorMessage('Please provide your username/email and password.');
      return;
    }

    setIsAuthenticating(true);
    try {
      await login(loginId, password);
      setIsAuthenticating(false);
      onNavigate('dashboard');
    } catch (err: any) {
      setIsAuthenticating(false);
      setErrorMessage(err?.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  // Step 1 of Signup: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters (letters, numbers, underscores).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!isPasswordStrong) {
      setErrorMessage('Please satisfy all password security requirements before proceeding.');
      return;
    }

    setIsAuthenticating(true);
    try {
      await sendOtp(email.trim(), 'signup');
      setIsAuthenticating(false);
      setSignupStep('otp');
      setResendTimer(60);
      setCanResend(false);
      setInfoMessage(`A 6-digit verification code has been dispatched to ${email.trim()}. Please check your email.`);
      // Focus first OTP input box
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setIsAuthenticating(false);
      setErrorMessage(err?.message || 'Could not send verification code. Please try again.');
    }
  };

  // Step 2 of Signup: Verify OTP and Register Account
  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const code = otpDigits.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsAuthenticating(true);
    try {
      // 1. Verify OTP
      await verifyOtp(email.trim(), code);

      // 2. Register account
      await signup({
        email: email.trim(),
        username: username.trim().toLowerCase(),
        name: name.trim(),
        password,
        otp_code: code,
        monthly_income: parseFloat(income) || 85000,
        monthly_expenses: parseFloat(expenses) || 35000,
        current_savings: parseFloat(savings) || 150000,
      });

      setIsAuthenticating(false);
      onNavigate('dashboard');
    } catch (err: any) {
      setIsAuthenticating(false);
      setErrorMessage(err?.message || 'Verification failed. Please check your 6-digit code.');
    }
  };

  // Handle individual OTP digit change
  const handleOtpDigitChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    if (!clean) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    // Handle full paste
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      const updated = [...otpDigits];
      chars.forEach((c, idx) => {
        if (index + idx < 6) updated[index + idx] = c;
      });
      setOtpDigits(updated);
      const nextIdx = Math.min(index + chars.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    const updated = [...otpDigits];
    updated[index] = clean[0];
    setOtpDigits(updated);

    // Auto focus next box
    if (index < 5 && clean.length > 0) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setErrorMessage(null);
    try {
      await sendOtp(email.trim(), 'signup');
      setResendTimer(60);
      setCanResend(false);
      setInfoMessage(`New 6-digit verification code sent to ${email.trim()}.`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center py-12 px-4 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Branding Banner */}
        <div className="lg:col-span-5 bg-[#002992] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#61CCFF_1px,transparent_1px)] opacity-10 [background-size:20px_20px] pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#61CCFF] text-[24px]">diamond</span>
              <span className="font-display font-extrabold text-lg tracking-wider">MONEY LENS</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold leading-tight">
                {mode === 'signin'
                  ? 'Welcome Back'
                  : signupStep === 'otp'
                  ? 'Security Verification'
                  : 'Create Your Account'}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {mode === 'signin'
                  ? 'Sign in with your username or email to access your synchronized 3D trajectory simulations.'
                  : signupStep === 'otp'
                  ? 'Enter the 6-digit confirmation code dispatched to your verified email address.'
                  : 'Create a unique username and password to secure your AWS RDS PostgreSQL financial portfolio.'}
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 space-y-3 relative z-10 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AWS RDS PostgreSQL Database: Connected</span>
            </div>
            <div className="text-[11px] text-slate-400">
              6-digit OTP verification. 100% deterministic calculus.
            </div>
          </div>
        </div>

        {/* Right Authentication Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 space-y-6 bg-slate-50/50">
          <div className="flex items-center justify-between">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 bg-slate-200/70 rounded-full text-xs font-display font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setSignupStep('form');
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setSignupStep('form');
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            <button
              onClick={() => onNavigate('landing')}
              className="text-xs font-mono text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              ← Back to Site
            </button>
          </div>

          <div>
            <h3 className="text-xl font-display font-bold text-slate-900">
              {mode === 'signin'
                ? 'Sign In to MoneyLens'
                : signupStep === 'otp'
                ? 'Confirm 6-Digit OTP Code'
                : 'Register New Investor Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'signin'
                ? 'Enter your registered email or username with your password.'
                : signupStep === 'otp'
                ? `We sent a 6-digit confirmation code to ${email}`
                : 'Enter your profile details, choose a unique username, and verify your email.'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[16px] shrink-0 text-emerald-600">mark_email_read</span>
              <span>{infoMessage}</span>
            </div>
          )}

          {/* MODE 1: SIGN IN (Accepts Email or Username) */}
          {mode === 'signin' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-slate-600 font-semibold">
                  Username or Email Address
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. ranvir_singh or investor@moneylens.io"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-slate-600 font-semibold">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3.5 bg-[#002992] hover:bg-black text-white font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-75"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isAuthenticating ? 'sync' : 'login'}
                </span>
                <span>{isAuthenticating ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              </button>
            </form>
          )}

          {/* MODE 2 - STEP 1: CREATE ACCOUNT FORM */}
          {mode === 'signup' && signupStep === 'form' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-slate-600 font-semibold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ranvir Singh"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-slate-600 font-semibold">
                    Unique Username
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 font-mono text-sm">@</span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="ranvir_singh"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-slate-600 font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Password Input + Realtime Strength Indicators */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase text-slate-600 font-semibold">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                {/* Password Rules Checklist */}
                <div className="p-3 bg-slate-100/80 rounded-xl space-y-1.5 text-[11px] font-mono border border-slate-200/70">
                  <div className="text-slate-500 font-semibold uppercase text-[10px]">Password Requirements:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {hasMinLength ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>8+ Characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {hasUppercase ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>1 Uppercase (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {hasLowercase ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>1 Lowercase (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {hasNumber ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>1 Number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 sm:col-span-2 ${hasSpecial ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {hasSpecial ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>1 Symbol / Special Character (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Initial Calibrations */}
              <div className="pt-2 border-t border-slate-200/80 space-y-3">
                <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold">
                  Initial Financial Parameters (₹ INR)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500">Monthly Income</label>
                    <input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500">Monthly Expenses</label>
                    <input
                      type="number"
                      value={expenses}
                      onChange={(e) => setExpenses(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500">Current Savings</label>
                    <input
                      type="number"
                      value={savings}
                      onChange={(e) => setSavings(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating || !isPasswordStrong}
                className="w-full py-3.5 bg-[#002992] hover:bg-black text-white font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isAuthenticating ? 'sync' : 'forward_to_inbox'}
                </span>
                <span>{isAuthenticating ? 'Sending OTP Code...' : 'Verify Email & Send OTP Code'}</span>
              </button>
            </form>
          )}

          {/* MODE 2 - STEP 2: 6-DIGIT OTP VERIFICATION */}
          {mode === 'signup' && signupStep === 'otp' && (
            <form onSubmit={handleVerifyAndSignup} className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold bg-white border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 transition-all outline-none"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSignupStep('form');
                      setErrorMessage(null);
                      setInfoMessage(null);
                    }}
                    className="text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
                  >
                    ← Edit Details / Email
                  </button>

                  <button
                    type="button"
                    disabled={!canResend}
                    onClick={handleResendOtp}
                    className={`font-mono text-xs font-semibold cursor-pointer ${
                      canResend ? 'text-blue-600 hover:underline' : 'text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {canResend ? 'Resend OTP Code' : `Resend in ${resendTimer}s`}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating || otpDigits.join('').length < 6}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isAuthenticating ? 'sync' : 'verified_user'}
                </span>
                <span>{isAuthenticating ? 'Verifying with Database...' : 'Confirm OTP & Complete Account'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
