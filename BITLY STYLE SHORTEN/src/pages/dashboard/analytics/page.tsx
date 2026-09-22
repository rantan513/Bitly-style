import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "@/pages/dashboard/components/DashboardHeader";
import TrendChart from "@/pages/dashboard/link-analytics/components/TrendChart";
import Breakdown, { type BreakdownItem } from "@/pages/dashboard/link-analytics/components/Breakdown";
import DashboardActivity from "@/pages/dashboard/components/DashboardActivity";

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

interface TopLink {
  id: string;
  slug: string;
  title: string | null;
  total_clicks: number;
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
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
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

export default function Analytics() {
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [topLinks, setTopLinks] = useState<TopLink[]>([]);
  const [totalLinks, setTotalLinks] = useState(0);
  const [activeLinks, setActiveLinks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [linksRes, clicksRes] = await Promise.all([
          supabase.from("links").select("id, slug, title, active, total_clicks").order("total_clicks", { ascending: false }),
          supabase.from("clicks").select("country, city, region, device, browser, os, referrer, clicked_at").eq("is_bot", false).order("clicked_at", { ascending: false }).limit(5000),
        ]);

        if (cancelled) return;

        if (linksRes.error) throw new Error(linksRes.error.message);
        if (clicksRes.error) throw new Error(clicksRes.error.message);

        const links = (linksRes.data ?? []) as { id: string; slug: string; title: string | null; active: boolean; total_clicks: number }[];
        setTotalLinks(links.length);
        setActiveLinks(links.filter((l) => l.active).length);
        setTopLinks(links.slice(0, 5));
        setClicks((clicksRes.data as ClickRow[]) ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong while loading analytics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalClicks = clicks.length;
  const countries = groupCounts(clicks, (r) => r.country);
  const locations = groupCounts(clicks, (r) => {
    const parts = [r.city, r.region, r.country].filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  });
  const devices = groupCounts(clicks, (r) => r.device);
  const browsers = groupCounts(clicks, (r) => r.browser);
  const oss = groupCounts(clicks, (r) => r.os);
  const referrers = groupCounts(clicks, (r) => r.referrer || "Direct");
  const trend = buildTrend(clicks, 14);

  const stats = [
    { icon: "ri-link-m", value: totalLinks, label: "Total links" },
    { icon: "ri-bar-chart-2-line", value: totalClicks, label: "Total clicks" },
    { icon: "ri-checkbox-circle-line", value: activeLinks, label: "Active links" },
    { icon: "ri-earth-line", value: countries.length, label: "Countries" },
  ];

  return (
    <div className="min-h-screen bg-background-50 lg:pl-64">
      <DashboardHeader />

      <main className="mx-auto px-4 md:px-10 py-8 max-w-5xl">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-foreground-950">Analytics</h1>
          <p className="mt-1 text-foreground-600">A look at performance across all your links.</p>
        </div>

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
            <h3 className="mt-5 font-heading text-2xl text-foreground-950">Couldn't load analytics</h3>
            <p className="mt-2 text-sm text-foreground-500">{error}</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                  Share your short links to start collecting location, device, and browser analytics.
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

                {/* Top links */}
                <section className="mt-6 bg-background-50 border border-background-200 rounded-lg p-5">
                  <div className="flex items-center gap-2">
                    <i className="ri-trophy-line w-5 h-5 flex items-center justify-center text-foreground-500"></i>
                    <h2 className="font-heading text-lg text-foreground-950">Top links</h2>
                  </div>
                  <ul className="mt-4 flex flex-col divide-y divide-background-200">
                    {topLinks.map((link, i) => (
                      <li key={link.id}>
                        <Link
                          to={`/dashboard/links/${link.id}`}
                          className="flex items-center gap-3 py-3 cursor-pointer group"
                        >
                          <span className="w-6 h-6 rounded-md bg-background-100 text-foreground-500 text-xs flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-foreground-950 truncate group-hover:text-primary-700 transition-colors">
                              {link.title || `/${link.slug}`}
                            </span>
                            <span className="block text-xs text-foreground-500 truncate">/{link.slug}</span>
                          </span>
                          <span className="text-sm text-foreground-600 whitespace-nowrap">
                            {link.total_clicks} {link.total_clicks === 1 ? "click" : "clicks"}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Breakdown title="Top locations" icon="ri-map-pin-2-line" items={locations.slice(0, 6)} total={totalClicks} />
                  <Breakdown title="Devices" icon="ri-device-line" items={devices} total={totalClicks} />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Breakdown title="Browsers" icon="ri-window-line" items={browsers.slice(0, 6)} total={totalClicks} />
                  <Breakdown title="Operating systems" icon="ri-macbook-line" items={oss.slice(0, 6)} total={totalClicks} />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Breakdown title="Referrers" icon="ri-share-forward-line" items={referrers.slice(0, 8)} total={totalClicks} />
                  </div>
                </div>
              </>
            )}

            <div className="mt-6">
              <DashboardActivity />
            </div>
          </>
        )}
      </main>
    </div>
  );
}