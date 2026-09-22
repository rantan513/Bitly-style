export default function AnalyticsPreview() {
  const bars = [82, 65, 90, 74, 58, 96, 71, 84, 69, 88, 62, 79];
  const days = ["M", "T", "W", "T", "F", "S", "S", "M", "T", "W", "T", "F"];

  const devices = [
    { label: "Mobile", pct: 62, cls: "bg-primary-500" },
    { label: "Desktop", pct: 31, cls: "bg-foreground-800" },
    { label: "Tablet", pct: 7, cls: "bg-accent-500" },
  ];

  const countries = [
    { c: "United States", pct: 34, count: "12,842" },
    { c: "Germany", pct: 18, count: "6,780" },
    { c: "Japan", pct: 12, count: "4,512" },
    { c: "Brazil", pct: 9, count: "3,391" },
    { c: "Canada", pct: 7, count: "2,634" },
  ];

  return (
    <section id="analytics" className="bg-background-100 py-24 md:py-32 border-y border-background-200">
      <div className="max-w-6xl mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs font-medium tracking-widest uppercase text-primary-600">
              A dashboard worth watching
            </div>
            <h2 className="mt-4 font-heading text-4xl md:text-6xl text-foreground-950 tracking-tight leading-[1.05]">
              Every click, <span className="italic">visualized</span>.
            </h2>
            <p className="mt-6 text-foreground-600 text-lg leading-relaxed">
              Trend charts, device splits, browser breakdowns, referrer sources, and a live
              world map — all in one clean view. Compare two links side-by-side to see
              which campaign actually worked.
            </p>
            <ul className="mt-8 space-y-3 text-foreground-800 text-sm">
              {[
                "Clicks-per-day area chart with anomaly highlighting",
                "City-level world map with clustered pins",
                "Top phone models — iPhone 15 vs Pixel 8 vs Galaxy S24",
                "Bot-filtered click history table with full audit trail",
              ].map((x) => (
                <li key={x} className="flex gap-3">
                  <i className="ri-check-line text-primary-600 w-5 h-5 flex items-center justify-center mt-0.5"></i>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mock dashboard card */}
          <div className="bg-background-50 rounded-xl border border-background-200 p-6 md:p-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-foreground-500">Link</div>
                <div className="font-mono-custom text-sm text-foreground-950 mt-0.5">
                  linkly.co/r/summer-drop
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs rounded-full bg-accent-100 text-accent-900 border border-accent-200">
                Live
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { l: "Clicks", v: "28,417" },
                { l: "Unique", v: "19,204" },
                { l: "Today", v: "1,832" },
              ].map((s) => (
                <div key={s.l} className="bg-background-100 rounded-lg p-3 border border-background-200/70">
                  <div className="text-[11px] text-foreground-500 uppercase tracking-wide">{s.l}</div>
                  <div className="font-heading text-2xl mt-1 text-foreground-950">{s.v}</div>
                </div>
              ))}
            </div>

            {/* bar chart */}
            <div className="mt-6">
              <div className="flex items-end gap-1.5 h-32">
                {bars.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-sm ${i === 5 ? "bg-primary-500" : "bg-foreground-950"}`}
                      style={{ height: `${h}%` }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-1.5">
                {days.map((d, i) => (
                  <div key={i} className="flex-1 text-center text-[10px] text-foreground-400">
                    {d}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-5">
              <div>
                <div className="text-[11px] text-foreground-500 uppercase tracking-wide mb-3">
                  Devices
                </div>
                <div className="space-y-2.5">
                  {devices.map((d) => (
                    <div key={d.label}>
                      <div className="flex justify-between text-xs text-foreground-700 mb-1">
                        <span>{d.label}</span>
                        <span className="font-medium">{d.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-background-200 rounded-full overflow-hidden">
                        <div className={`h-full ${d.cls} rounded-full`} style={{ width: `${d.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-foreground-500 uppercase tracking-wide mb-3">
                  Top countries
                </div>
                <div className="space-y-2 text-xs">
                  {countries.map((c) => (
                    <div key={c.c} className="flex items-center justify-between text-foreground-700">
                      <span>{c.c}</span>
                      <span className="font-mono-custom text-foreground-500">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}