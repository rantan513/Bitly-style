import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { validateOrdinaryPostAuthNext } from "@/lib/auth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Signing you in...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      setMessage("Missing authorization code.");
      return;
    }

    let cancelled = false;

    (async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (cancelled) return;

      if (error) {
        setMessage(error.message);
        return;
      }

      // Recovery (password reset) takes priority.
      if (data.redirectType === "recovery") {
        navigate("/auth/reset-password", { replace: true });
        return;
      }

      const next = params.get("next");
      navigate(validateOrdinaryPostAuthNext(next), { replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-50 px-4">
      <div className="w-8 h-8 rounded-full border-2 border-background-200 border-t-primary-500 animate-spin"></div>
      <p className="mt-4 text-sm text-foreground-600">{message}</p>
    </div>
  );
}