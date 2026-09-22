import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "@/pages/dashboard/components/DashboardHeader";
import { buildShortUrl, formatRelativeTime } from "@/lib/links";
import TrendChart from "./components/TrendChart";
import Breakdown, { type BreakdownItem } from "./components/Breakdown";
import LiveActivity from "./components/LiveActivity";

interface LinkDetails {
  id: string;
  slug: string;
  destination_url: string;
  title: string | null;
  active: boolean;
  total_clicks: number;
  created_at: string;
}

interface ClickRow {
  country: string | null;
  city: string | null;
  region: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  clicked_at: string;
}

function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function groupCounts(rows: ClickRow[], getKey: (r: ClickRow) => string | null): BreakdownItem[] {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const raw = getKey(r);
    const key = raw && raw.trim() ? raw.trim() : "Unknown";
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function buildTrend(rows: ClickRow[], days: number): { label: string; count: number }[] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
  const buckets: { key: string; count: number; label: string }[] = [];

  for (let i = 0; i < days; i += 1) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    buckets.push({
      key,
      count: 0,
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    });
  }

  const map = new Map(buckets.map((b) => [b.key, b]));
  rows.forEach((r) => {
    const d = new Date(r.clicked_at);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const bucket = map.get(key);
    if (bucket) bucket.count += 1;
  });

  return buckets.map(({ label, count }) => ({ label, count }));
}

export default function LinkAnalytics() {
  const { id } = useParams();
  const [link, setLink] = useState<LinkDetails | null>(null);
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: linkData, error: linkErr } = await supabase
          .from("links")
          .select("id, slug, destination_url, title, active, total_clicks, created_at")
          .eq("id", id)
          .maybeSingle();

        if (cancelled) return;

        if (linkErr) {
          setError(linkErr.message);
          setLoading(false);
          return;
        }
        if (!linkData) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setLink(linkData as LinkDetails);

        const { data: clickData, error: clickErr } = await supabase
          .from("clicks")
          .select("country, city, region, device, browser, os, referrer, clicked_at")
          .eq("link_id", id)
          .eq("is_bot", false)
          .order("clicked_at", { ascending: true });

        if (cancelled) return;

        if (clickErr) {
          setError(clickErr.message);
        } else {
          setClicks((clickData as ClickRow[]) ?? []);
        }
      } catch {
        if (!cancelled) setError("Something went wrong while loading analytics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(buildShortUrl(link.slug));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const countries = groupCounts(clicks, (r) => r.country);
  const cities = groupCounts(clicks, (r) => r.city);
  const locations = groupCounts(clicks, (r) => {
    const parts = [r.city, r.region, r.country].filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  });
  const devices = groupCounts(clicks, (r) => r.device);
  const browsers = groupCounts(clicks, (r) => r.browser);
  const oss = groupCounts(clicks, (r) => r.os);
  const referrers = groupCounts(clicks, (r) => r.referrer || "Direct");
  const trend = buildTrend(clicks, 14);
  const totalClicks = clicks.length;

  const stats = [
    { icon: "ri-earth-line", value: countries.length, label: "Countries" },
    { icon: "ri-map-pin-2-line", value: cities.length, label: "Cities" },
    { icon: "ri-device-line", value: devices.length, label: "Devices" },
    { icon: "ri-share-forward-line", value: referrers.length, label: "Referrers" },
  ];

  return (
    <div className="min-h-screen bg-background-50 lg:pl-64">
      <DashboardHeader />

      <main className="mx-auto px-4 md:px-10 py-8 max-w-5xl">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-foreground-600 hover:text-foreground-950 cursor-pointer"
        >
          <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
          Back to links
        </Link>

        {loading ? (
          <div className="mt-16 flex flex-col items-center justify-center text-foreground-500">
            <div className="w-8 h-8 rounded-full border-2 border-background-200 border-t-primary-500 animate-spin"></div>
            <p className="mt-4 text-sm">Loading analytics...</p>
          </div>
        ) : error ? (
          <div className="mt-8 border border-background-300 rounded-lg py-16 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-background-100 flex items-center justify-center">
              <i className="ri-error-warning-line text-2xl text-foreground-400 w-14 h-14 flex items-center justify-center"></i>
            </div>
            <h3 className="mt-5 font-heading text-2xl text-foreground-950">Couldn't load this link</h3>
            <p className="mt-2 text-sm text-foreground-500">{error}</p>
          </div>
        ) : notFound ? (
          <div className="mt-8 border border-dashed border-background-300 rounded-lg py-20 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-background-100 flex items-center justify-center">
              <i className="ri-link-unlink-m text-2xl text-foreground-400 w-14 h-14 flex items-center justify-center"></i>
            </div>
            <h3 className="mt-5 font-heading text-2xl text-foreground-950">Link not found</h3>
            <p className="mt-2 text-sm text-foreground-500">
              This link doesn't exist or belongs to another account.
            </p>
          </div>
        ) : link ? (
          <>
            {/* Header card */}
            <div className="mt-5 bg-background-50 border border-background-200 rounded-lg p-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="font-heading text-2xl text-foreground-950 truncate">
                      {link.title || displayHost(link.destination_url)}
                    </h1>
                    {!link.active && (
                      <span className="px-2 py-0.5 rounded-full bg-background-100 text-foreground-500 text-xs font-medium whitespace-nowrap">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-foreground-500 truncate">{link.destination_url}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      onClick={copy}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background-100 hover:bg-background-200 border border-background-200 text-sm text-foreground-700 whitespace-nowrap cursor-pointer transition-colors"
                      title="Copy short link"
                    >
                      <span className="font-medium text-primary-700">{`/${link.slug}`}</span>
                      <i
                        className={`${copied ? "ri-check-line text-primary-700" : "ri-file-copy-line"} w-4 h-4 flex items-center justify-center`}
                      ></i>
                    </button>
                    <span className="text-xs text-foreground-400">
                      Created {formatRelativeTime(link.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5 shrink-0">
                  <span className="font-heading text-4xl text-foreground-950">{link.total_clicks}</span>
                  <span className="text-sm text-foreground-500">
                    {link.total_clicks === 1 ? "click" : "clicks"}
                  </span>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-background-50 border border-background-200 rounded-lg p-4 flex items-center gap-3"
                >
                  <span className="w-10 h-10 rounded-lg bg-background-100 flex items-center justify-center shrink-0">
                    <i className={`${s.icon} text-lg text-foreground-500 w-10 h-10 flex items-center justify-center`}></i>
                  </span>
                  <div>
                    <div className="font-heading text-2xl text-foreground-950 leading-none">{s.value}</div>
                    <div className="text-xs text-foreground-500 mt-1">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {totalClicks === 0 ? (
              <div className="mt-6 border border-dashed border-background-300 rounded-lg py-16 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-background-100 flex items-center justify-center">
                  <i className="ri-bar-chart-2-line text-2xl text-foreground-400 w-14 h-14 flex items-center justify-center"></i>
                </div>
                <h3 className="mt-5 font-heading text-2xl text-foreground-950">No clicks yet</h3>
                <p className="mt-2 text-sm text-foreground-500 max-w-sm mx-auto">
                  Share your short link to start collecting location, device, and browser analytics.
                </p>
              </div>
            ) : (
              <>
                <section className="mt-6 bg-background-50 border border-background-200 rounded-lg p-5">
                  <div className="flex items-center gap-2">
                    <i className="ri-line-chart-line w-5 h-5 flex items-center justify-center text-foreground-500"></i>
                    <h2 className="font-heading text-lg text-foreground-950">Clicks over time</h2>
                  </div>
                  <div className="mt-5">
                    <TrendChart data={trend} />
                  </div>
                </section>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Breakdown
                    title="Top locations"
                    icon="ri-map-pin-2-line"
                    items={locations.slice(0, 6)}
                    total={totalClicks}
                  />
                  <Breakdown
                    title="Devices"
                    icon="ri-device-line"
                    items={devices}
                    total={totalClicks}
                  />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Breakdown
                    title="Browsers"
                    icon="ri-window-line"
                    items={browsers.slice(0, 6)}
                    total={totalClicks}
                  />
                  <Breakdown
                    title="Operating systems"
                    icon="ri-macbook-line"
                    items={oss.slice(0, 6)}
                    total={totalClicks}
                  />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Breakdown
                      title="Referrers"
                      icon="ri-share-forward-line"
                      items={referrers.slice(0, 8)}
                      total={totalClicks}
                    />
                  </div>
                </div>

                <LiveActivity linkId={link.id} />
              </>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}