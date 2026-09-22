import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type Status = "loading" | "not_found" | "disabled" | "expired" | "server_error" | "redirecting";

export default function RedirectPage() {
  const { slug } = useParams();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!slug) {
      setStatus("not_found");
      return;
    }

    const cacheKey = `linkly:redirect:${slug}`;

    // De-duplicate: refresh in the same session shouldn't double-count.
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        window.location.replace(cached);
        return;
      }
    } catch {
      /* ignore storage errors */
    }

    let cancelled = false;

    (async () => {
      let data: { ok?: boolean; reason?: string; destination_url?: string } | null = null;
      let error: unknown = null;

      // Hard timeout so the page never sits on a blank screen forever.
      try {
        const result = await Promise.race([
          supabase.functions.invoke("redirect-link", {
            body: {
              slug,
              userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
              referrer: typeof document !== "undefined" ? document.referrer : "",
            },
          }),
          new Promise<{ data: null; error: Error }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: new Error("timeout") }), 10000)
          ),
        ]);
        data = result.data;
        error = result.error;
      } catch (e) {
        error = e;
      }

      if (cancelled) return;

      if (error) {
        setStatus("server_error");
        return;
      }

      if (!data || data.ok === false || !data.destination_url) {
        const reason = data?.reason;
        setStatus(
          reason === "disabled"
            ? "disabled"
            : reason === "expired"
              ? "expired"
              : reason === "server_error"
                ? "server_error"
                : "not_found"
        );
        return;
      }

      setStatus("redirecting");
      try {
        sessionStorage.setItem(cacheKey, data.destination_url);
      } catch {
        /* ignore */
      }
      window.location.replace(data.destination_url);
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // While resolving (or mid-redirect) show a plain white page — no branding, no spinner.
  if (status === "loading" || status === "redirecting") {
    return <div className="min-h-screen bg-white" />;
  }

  const config = {
    not_found: {
      icon: "ri-link-unlink-m",
      title: "Link not found",
      desc: "This short link doesn't exist or may have been removed.",
    },
    disabled: {
      icon: "ri-forbid-2-line",
      title: "This link has been disabled",
      desc: "The owner turned this link off. It's not currently active.",
    },
    expired: {
      icon: "ri-time-line",
      title: "This link has expired",
      desc: "The owner set an expiration date that has already passed.",
    },
    server_error: {
      icon: "ri-server-line",
      title: "Something went wrong",
      desc: "We couldn't process this link right now. Please try again in a moment.",
    },
  }[status] || {
    icon: "ri-link-unlink-m",
    title: "Link not found",
    desc: "This short link doesn't exist or may have been removed.",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
          <i className={`${config.icon} text-2xl text-gray-500 w-14 h-14 flex items-center justify-center`}></i>
        </div>
        <h1 className="mt-6 font-heading text-3xl text-foreground-950">{config.title}</h1>
        <p className="mt-3 text-foreground-600 max-w-sm">{config.desc}</p>
      </div>
    </div>
  );
}