import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/components/feature/AuthShell";
import { supabase } from "@/lib/supabase";
import { getCallbackUrl } from "@/lib/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getCallbackUrl()}?next=/auth/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("code");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({ email, token, type: "recovery" });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setStep("password");
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    navigate("/login", { replace: true });
  };

  if (step === "code") {
    return (
      <AuthShell title="Enter the code." subtitle={`We emailed a recovery code to ${email}.`}>
        <form onSubmit={handleVerify} className="space-y-5">
          {error && (
            <div className="bg-primary-100/60 border border-primary-200 text-primary-800 rounded-md px-4 py-3 text-sm">
              {error}
            </div>
          )}
          <input
            type="text"
            inputMode="numeric"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            placeholder="123456"
            className="w-full bg-background-50 border border-background-300 rounded-md px-4 py-3 text-sm tracking-[0.4em] text-center text-foreground-950 placeholder:text-foreground-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          <button
            type="submit"
            disabled={loading || token.length !== 6}
            className="w-full bg-foreground-950 hover:bg-foreground-800 disabled:opacity-60 text-background-50 rounded-md py-3 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors"
          >
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>
      </AuthShell>
    );
  }

  if (step === "password") {
    return (
      <AuthShell title="Set a new password." subtitle="Choose a new password for your account.">
        <form onSubmit={handleReset} className="space-y-5">
          {error && (
            <div className="bg-primary-100/60 border border-primary-200 text-primary-800 rounded-md px-4 py-3 text-sm">
              {error}
            </div>
          )}
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="New password (6+ characters)"
              className="w-full bg-background-50 border border-background-300 rounded-md px-4 py-3 pr-12 text-sm text-foreground-950 placeholder:text-foreground-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-foreground-400 cursor-pointer"
              aria-label="toggle password"
            >
              <i className={`${showPw ? "ri-eye-off-line" : "ri-eye-line"}`}></i>
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground-950 hover:bg-foreground-800 disabled:opacity-60 text-background-50 rounded-md py-3 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors"
          >
            {loading ? "Saving..." : "Reset password"}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset your password." subtitle="We'll send you a recovery code to verify it's you.">
      <form onSubmit={handleSend} className="space-y-5">
        {error && (
          <div className="bg-primary-100/60 border border-primary-200 text-primary-800 rounded-md px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground-800 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full bg-background-50 border border-background-300 rounded-md px-4 py-3 text-sm text-foreground-950 placeholder:text-foreground-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-foreground-950 hover:bg-foreground-800 disabled:opacity-60 text-background-50 rounded-md py-3 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors"
        >
          {loading ? "Sending..." : "Send recovery code"}
        </button>
        <p className="text-sm text-foreground-600 text-center">
          Remembered it?{" "}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}