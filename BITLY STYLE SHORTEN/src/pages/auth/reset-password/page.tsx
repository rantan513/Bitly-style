import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "@/components/feature/AuthShell";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      // A recovery session is required to set the password here.
      if (!data.session) {
        navigate("/forgot-password", { replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
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

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-50 px-4">
        <div className="w-8 h-8 rounded-full border-2 border-background-200 border-t-primary-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthShell title="Set a new password." subtitle="Choose a strong password to finish resetting.">
      <form onSubmit={handleSubmit} className="space-y-5">
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