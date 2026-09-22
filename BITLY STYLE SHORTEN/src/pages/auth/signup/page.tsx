import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/components/feature/AuthShell";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { getCallbackUrl } from "@/lib/auth";

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState<"form" | "checkEmail">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error, needsConfirmation } = await signUp(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // No confirmation needed = account pre-confirmed, signed in already.
    if (!needsConfirmation) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // Confirmation email sent — show the check-your-email screen.
    setStep("checkEmail");
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: getCallbackUrl() },
    });
    setResending(false);
    if (error) setError(error.message);
  };

  const handleContinue = async () => {
    setError(null);
    setLoading(true);
    // Session syncs across tabs, so once the email link is clicked
    // this tab will see the session too.
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      navigate("/dashboard", { replace: true });
      return;
    }
    setError("Not confirmed yet — click the link in your email first, then try again.");
    setLoading(false);
  };

  if (step === "checkEmail") {
    return (
      <AuthShell
        title="Check your email."
        subtitle={`We sent a confirmation link to ${email}. Click it to activate your account, then come back here.`}
      >
        <div className="space-y-5">
          {error && (
            <div className="bg-primary-100/60 border border-primary-200 text-primary-800 rounded-md px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={loading}
            className="w-full bg-foreground-950 hover:bg-foreground-800 disabled:opacity-60 text-background-50 rounded-md py-3 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors"
          >
            {loading ? "Checking..." : "I've clicked the link — continue"}
          </button>

          <div className="text-center text-sm text-foreground-600">
            Didn't get it?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer disabled:opacity-60"
            >
              {resending ? "Resending..." : "Resend email"}
            </button>
            {" "}·{" "}
            <button
              type="button"
              onClick={() => setStep("form")}
              className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
            >
              Change email
            </button>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create your account." subtitle="Start shortening links and tracking every click.">
      <form onSubmit={handleSignup} className="space-y-5">
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground-800 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-background-50 rounded-md py-3 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-xs text-foreground-500 leading-relaxed">
          By signing up you agree to our{" "}
          <a href="#" className="text-foreground-700 underline">Terms</a> and{" "}
          <a href="#" className="text-foreground-700 underline">Privacy Policy</a>.
        </p>
      </form>

      <p className="mt-6 text-sm text-foreground-600 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
