import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "@/components/feature/AuthShell";
import { useAuth } from "@/context/AuthContext";
import { validateOrdinaryPostAuthNext } from "@/lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const next = searchParams.get("next");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const error = await signIn(email, password);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("not confirmed") || msg.includes("not been confirmed")) {
        setError(
          "Your email hasn't been verified yet. Verification emails require email sending to be configured in Backend Authentication settings. Ask the site owner to either disable email verification or set up SMTP/Resend."
        );
      } else if (msg.includes("invalid login")) {
        setError("That email or password doesn't match an account. Double-check both, or create a new account.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    navigate(validateOrdinaryPostAuthNext(next), { replace: true });
  };

  return (
    <AuthShell title="Welcome back." subtitle="Sign in to manage your links and see your analytics.">
      <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-foreground-800">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 cursor-pointer">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
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
          className="w-full bg-foreground-950 hover:bg-foreground-800 disabled:opacity-60 text-background-50 rounded-md py-3 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-foreground-600 text-center">
        New to Linkly?{" "}
        <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}