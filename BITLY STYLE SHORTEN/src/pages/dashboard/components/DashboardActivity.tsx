import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface ActivityRow {
  id: string;
  country: string | null;
  city: string | null;
  region: string | null;
  device: string | null;
  device_model: string | null;
  browser: string | null;
  os: string | null;
  isp: string | null;
  ip_address: string | null;
  referrer: string | null;
  clicked_at: string;
  links: { id: string; slug: string; title: string | null } | null;
}

function locationLabel(r: ActivityRow): string {
  const parts = [r.city, r.region, r.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Unknown location";
}

function deviceLabel(r: ActivityRow): string {
  const model = r.device_model ? `${r.device_model} · ` : "";
  return `${model}${r.device || "Unknown device"}${r.browser ? ` on ${r.browser}` : ""}${
    r.os ? ` · ${r.os}` : ""
  }`;
}

function deviceIcon(device: string | null): string {
  const d = (device || "").toLowerCase();
  if (d.includes("mobile") || d.includes("phone")) return "ri-smartphone-line";
  if (d.includes("tablet")) return "ri-tablet-line";
  return "ri-computer-line";
}

function timeAgo(iso: string): string {
  const sec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function referrerLabel(ref: string | null): string {
  if (!ref || ref === "Direct") return "";
  try {
    return new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    return ref;
  }
}

export default function DashboardActivity() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const { data, error: err } = await supabase
        .from("clicks")
        .select(
          "id, country, city, region, device, device_model, browser, os, isp, ip_address, referrer, clicked_at, links(id, slug, title)"
        )
        .eq("is_bot", false)
        .order("clicked_at", { ascending: false })
        .limit(30);

      if (err) {
        setError(err.message);
      } else {
        setRows((data as ActivityRow[]) ?? []);
        setError(null);
      }
    } catch {
      setError("Couldn't load live activity.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-background-50 border border-background-200 rounded-lg p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <i className="ri-radar-line w-5 h-5 flex items-center justify-center text-foreground-500"></i>
          <h2 className="font-heading text-lg text-foreground-950">Live activity</h2>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-100 text-accent-900 text-xs font-medium whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse"></span>
            Live
          </span>
        </div>
        <span className="text-xs text-foreground-400">Refreshes automatically</span>
      </div>

      {loading ? (
        <div className="mt-6 flex flex-col items-center justify-center py-10 text-foreground-500">
          <div className="w-6 h-6 rounded-full border-2 border-background-200 border-t-primary-500 animate-spin"></div>
          <p className="mt-3 text-sm">Loading activity...</p>
        </div>
      ) : error ? (
        <div className="mt-6 flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm text-foreground-500">{error}</p>
          <button
            onClick={load}
            className="mt-3 px-4 py-2 rounded-md bg-background-100 hover:bg-background-200 border border-background-200 text-sm text-foreground-700 whitespace-nowrap cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-background-100 flex items-center justify-center">
            <i className="ri-pulse-line text-xl text-foreground-400 w-12 h-12 flex items-center justify-center"></i>
          </div>
          <p className="mt-3 text-sm text-foreground-500">No activity yet — clicks will appear here live.</p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-background-200">
          {rows.map((r) => (
            <li key={r.id} className="py-3 flex items-start gap-3">
              <span className="w-9 h-9 rounded-full bg-background-100 flex items-center justify-center shrink-0">
                <i
                  className={`${deviceIcon(r.device)} text-foreground-500 w-9 h-9 flex items-center justify-center`}
                ></i>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <i className="ri-map-pin-2-line w-4 h-4 flex items-center justify-center text-accent-600"></i>
                  <span className="text-sm text-foreground-900 font-medium truncate">
                    {locationLabel(r)}
                  </span>
                  {r.links && (
                    <Link
                      to={`/dashboard/links/${r.links.id}`}
                      title={r.links.slug}
                      className="px-1.5 py-0.5 rounded bg-background-100 border border-background-200 text-[11px] text-foreground-600 hover:text-primary-700 hover:border-primary-300 whitespace-nowrap transition-colors"
                    >
                      {r.links.title || `/${r.links.slug}`}
                    </Link>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-foreground-500 truncate">{deviceLabel(r)}</p>
                {r.referrer && r.referrer !== "Direct" && (
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-foreground-400 truncate">
                    <i className="ri-arrow-right-up-line w-3.5 h-3.5 flex items-center justify-center shrink-0"></i>
                    <span className="truncate">{referrerLabel(r.referrer)}</span>
                  </p>
                )}
                <div className="mt-1 flex items-center gap-3 flex-wrap text-[11px] text-foreground-400">
                  {r.ip_address && (
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <i className="ri-global-line w-3.5 h-3.5 flex items-center justify-center"></i>
                      {r.ip_address}
                    </span>
                  )}
                  {r.isp && <span className="truncate">{r.isp}</span>}
                </div>
              </div>
              <span className="shrink-0 text-xs text-foreground-400 whitespace-nowrap">
                {timeAgo(r.clicked_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}