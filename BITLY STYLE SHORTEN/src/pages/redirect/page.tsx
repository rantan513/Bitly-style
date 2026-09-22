import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type Status = "loading" | "not_found" | "disabled" | "redirecting";

function parseDevice(ua: string): string {
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  if (/mobile|iphone|android/i.test(ua)) return "Mobile";
  return "Desktop";
}

function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|chromium|crios/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

function parseOs(ua: string): string {
  if (/windows/i.test(ua)) return "Windows";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/macintosh|mac os/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Other";
}

export default function RedirectPage() {
  const { slug } = useParams();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!slug) {
      setStatus("not_found");
      return;
    }

    const cacheKey = `linkly:redirect:${slug}`;
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
      const { data: link, error } = await supabase
        .from("links")
        .select("id, destination_url, active, total_clicks")
        .eq("slug", slug)
        .maybeSingle();

      if (cancelled) return;
      if (error || !link) {
        setStatus("not_found");
        return;
      }
      if (!link.active) {
        setStatus("disabled");
        return;
      }

      const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
      const isBot = /bot|crawl|spider|slurp|preview/i.test(ua);
      const referrer =
        typeof document !== "undefined" && document.referrer ? document.referrer : "Direct";

      try {
        await supabase.from("clicks").insert({
          link_id: link.id,
          device: parseDevice(ua),
          browser: parseBrowser(ua),
          os: parseOs(ua),
          referrer,
          is_bot: isBot,
          clicked_at: new Date().toISOString(),
        });
        await supabase
          .from("links")
          .update({ total_clicks: (link.total_clicks ?? 0) + 1 })
          .eq("id", link.id);
      } catch {
        /* analytics are best-effort */
      }

      if (cancelled) return;
      setStatus("redirecting");
      try {
        sessionStorage.setItem(cacheKey, link.destination_url);
      } catch {
        /* ignore */
      }
      window.location.replace(link.destination_url);
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

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
  }[status];

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
