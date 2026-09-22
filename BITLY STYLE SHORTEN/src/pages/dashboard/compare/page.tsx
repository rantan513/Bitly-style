import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "@/pages/dashboard/components/DashboardHeader";
import { formatRelativeTime } from "@/lib/links";

interface LinkRow {
  id: string;
  slug: string;
  destination_url: string;
  title: string | null;
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
}

interface LinkStats {
  clicks: number;
  countries: number;
  cities: number;
  topLocation: string;
  topDevice: string;
  topBrowser: string;
  topOs: string;
  topReferrer: string;
}

const EMPTY_STATS: LinkStats = {
  clicks: 0,
  countries: 0,
  cities: 0,
  topLocation: "—",
  topDevice: "—",
  topBrowser: "—",
  topOs: "—",
  topReferrer: "—",
};

function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function topItem(rows: ClickRow[], getKey: (r: ClickRow) => string | null): string {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const v = getKey(r);
    if (v && v.trim()) map.set(v.trim(), (map.get(v.trim()) ?? 0) + 1);
  });
  let best = "";
  let bestN = 0;
  map.forEach((n, v) => {
    if (n > bestN) {
      bestN = n;
      best = v;
    }
  });
  return best || "—";
}

function distinctCount(rows: ClickRow[], getKey: (r: ClickRow) => string | null): number {
  return new Set(rows.map(getKey).filter((v): v is string => Boolean(v && v.trim()))).size;
}

function computeStats(rows: ClickRow[]): LinkStats {
  if (rows.length === 0) return { ...EMPTY_STATS };
  return {
    clicks: rows.length,
    countries: distinctCount(rows, (r) => r.country),
    cities: distinctCount(rows, (r) => r.city),
    topLocation: topItem(rows, (r) => [r.city, r.region, r.country].filter(Boolean).join(", ")),
    topDevice: topItem(rows, (r) => r.device),
    topBrowser: topItem(rows, (r) => r.browser),
    topOs: topItem(rows, (r) => r.os),
    topReferrer: topItem(rows, (r) => (r.referrer && r.referrer !== "Direct" ? r.referrer : null)),
  };
}

export default function Compare() {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [selA, setSelA] = useState("");
  const [selB, setSelB] = useState("");
  const [statsA, setStatsA] = useState<LinkStats>(EMPTY_STATS);
  const [statsB, setStatsB] = useState<LinkStats>(EMPTY_STATS);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingLinks(true);
      try {
        const { data, error: err } = await supabase
          .from("links")
          .select("id, slug, destination_url, title, total_clicks, created_at")
          .order("created_at", { ascending: false });
        if (cancelled) return;
        if (err) {
          setError(err.message);
        } else {
          const list = (data as LinkRow[]) ?? [];
          setLinks(list);
          if (list.length >= 2) {
            setSelA(list[0].id);
            setSelB(list[1].id);
          } else if (list.length === 1) {
            setSelA(list[0].id);
          }
        }
      } catch {
        if (!cancelled) setError("Something went wrong while loading your links.");
      } finally {
        if (!cancelled) setLoadingLinks(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selA) {
      setStatsA(EMPTY_STATS);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("clicks")
        .select("country, city, region, device, browser, os, referrer")
        .eq("link_id", selA)
        .eq("is_bot", false);
      if (!cancelled) setStatsA(computeStats((data as ClickRow[]) ?? []));
    })();
    return () => {
      cancelled = true;
    };
  }, [selA]);

  useEffect(() => {
    if (!selB) {
      setStatsB(EMPTY_STATS);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("clicks")
        .select("country, city, region, device, browser, os, referrer")
        .eq("link_id", selB)
        .eq("is_bot", false);
      if (!cancelled) setStatsB(computeStats((data as ClickRow[]) ?? []));
    })();
    return () => {
      cancelled = true;
    };
  }, [selB]);

  const linkA = links.find((l) => l.id === selA) ?? null;
  const linkB = links.find((l) => l.id === selB) ?? null;

  const rows: { key: keyof LinkStats; label: string; numeric: boolean }[] = [
    { key: "clicks", label: "Total clicks", numeric: true },
    { key: "countries", label: "Countries", numeric: true },
    { key: "cities", label: "Cities", numeric: true },
    { key: "topLocation", label: "Top location", numeric: false },
    { key: "topDevice", label: "Top device", numeric: false },
    { key: "topBrowser", label: "Top browser", numeric: false },
    { key: "topOs", label: "Top OS", numeric: false },
    { key: "topReferrer", label: "Top referrer", numeric: false },
  ];

  return (
    <div className="min-h-screen bg-background-50 lg:pl-64">
      <DashboardHeader />

      <main className="mx-auto px-4 md:px-10 py-8 max-w-5xl">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-foreground-950">Compare links</h1>
          <p className="mt-1 text-foreground-600">Pick two links and see how they stack up side by side.</p>
        </div>

        {loadingLinks ? (
          <div className="mt-16 flex flex-col items-center justify-center text-foreground-500">
            <div className="w-8 h-8 rounded-full border-2 border-background-200 border-t-primary-500 animate-spin"></div>
            <p className="mt-4 text-sm">Loading links...</p>
          </div>
        ) : error ? (
          <div className="mt-8 border border-background-300 rounded-lg py-16 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-background-100 flex items-center justify-center">
              <i className="ri-error-warning-line text-2xl text-foreground-400 w-14 h-14 flex items-center justify-center"></i>
            </div>
            <h3 className="mt-5 font-heading text-2xl text-foreground-950">Couldn't load your links</h3>
            <p className="mt-2 text-sm text-foreground-500">{error}</p>
          </div>
        ) : links.length < 2 ? (
          <div className="mt-8 border border-dashed border-background-300 rounded-lg py-20 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-background-100 flex items-center justify-center">
              <i className="ri-scales-3-line text-2xl text-foreground-400 w-14 h-14 flex items-center justify-center"></i>
            </div>
            <h3 className="mt-5 font-heading text-2xl text-foreground-950">Need two links to compare</h3>
            <p className="mt-2 text-sm text-foreground-500 max-w-sm mx-auto">
              Create at least two short links, then come back here to compare their performance.
            </p>
          </div>
        ) : (
          <>
            {/* Selectors */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: selA, set: setSelA, link: linkA, side: "A" },
                { id: selB, set: setSelB, link: linkB, side: "B" },
              ].map(({ id, set, link, side }) => (
                <div key={side} className="bg-background-50 border border-background-200 rounded-lg p-5">
                  <label className="text-xs font-medium text-foreground-500 uppercase tracking-wide">
                    Link {side}
                  </label>
                  <select
                    value={id}
                    onChange={(e) => set(e.target.value)}
                    className="mt-2 w-full px-3 py-2 rounded-md border border-background-300 bg-background-50 text-sm text-foreground-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400"
                  >
                    {links.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title || displayHost(l.destination_url)} (/{l.slug})
                      </option>
                    ))}
                  </select>

                  {link && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-foreground-950 truncate">
                          {link.title || displayHost(link.destination_url)}
                        </span>
                        <span className="text-sm text-foreground-600 whitespace-nowrap">
                          {link.total_clicks} {link.total_clicks === 1 ? "click" : "clicks"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-foreground-500 truncate">{link.destination_url}</div>
                      <div className="mt-1 text-xs text-foreground-400">Created {formatRelativeTime(link.created_at)}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <div className="mt-6 bg-background-50 border border-background-200 rounded-lg overflow-hidden">
              {rows.map((r, i) => {
                const a = statsA[r.key];
                const b = statsB[r.key];
                const aWin = r.numeric && (a as number) > (b as number);
                const bWin = r.numeric && (b as number) > (a as number);
                return (
                  <div
                    key={r.key}
                    className={`grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-6 py-3 ${
                      i > 0 ? "border-t border-background-200" : ""
                    }`}
                  >
                    <span className={`text-left font-medium ${aWin ? "text-primary-700" : "text-foreground-950"}`}>
                      {String(a)}
                    </span>
                    <span className="text-center text-xs text-foreground-500 uppercase tracking-wide whitespace-nowrap">
                      {r.label}
                    </span>
                    <span className={`text-right font-medium ${bWin ? "text-primary-700" : "text-foreground-950"}`}>
                      {String(b)}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}