const features = [
  {
    icon: "ri-line-chart-line",
    title: "Real-time click analytics",
    desc: "See clicks stream in live with rich breakdowns by day, hour, and campaign — no waiting, no sampling.",
    tone: "primary",
  },
  {
    icon: "ri-earth-line",
    title: "World map geolocation",
    desc: "Every click plotted on a beautiful world map. City-level accuracy via multi-source geolocation consensus.",
    tone: "accent",
  },
  {
    icon: "ri-qr-code-line",
    title: "Branded links + QR codes",
    desc: "Custom slugs, your own domain, and downloadable QR codes generated client-side in one click.",
    tone: "secondary",
  },
  {
    icon: "ri-smartphone-line",
    title: "Device & browser tracking",
    desc: "Know if it's an iPhone 15 in Chrome or a Pixel 8 in Firefox. Even top phone models are tracked.",
    tone: "secondary",
  },
  {
    icon: "ri-shield-check-line",
    title: "Bot & spam filtering",
    desc: "A scoring engine flags bots, datacenters, and proxies so your real click count stays honest.",
    tone: "primary",
  },
  {
    icon: "ri-time-line",
    title: "Expiring & toggle links",
    desc: "Set expiration dates or flip a link off instantly. Perfect for campaigns, launches, and time-sensitive drops.",
    tone: "accent",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-background-50 py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-4 md:px-10">
        <div className="max-w-2xl">
          <div className="text-xs font-medium tracking-widest uppercase text-primary-600">
            Everything you need
          </div>
          <h2 className="mt-4 font-heading text-4xl md:text-6xl text-foreground-950 tracking-tight">
            Short links that actually <span className="italic">tell you</span> something.
          </h2>
          <p className="mt-6 text-foreground-600 text-lg leading-relaxed">
            Six pillars that turn a plain redirect into a marketing intelligence tool.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const bg =
              f.tone === "primary"
                ? "bg-primary-500 text-background-50"
                : f.tone === "accent"
                ? "bg-accent-500 text-background-50 dark:text-foreground-950"
                : "bg-background-100 text-foreground-950";
            const iconBg =
              f.tone === "primary"
                ? "bg-background-50/15 text-background-50"
                : f.tone === "accent"
                ? "bg-background-50/20 text-background-50"
                : "bg-primary-500 text-background-50";
            const desc =
              f.tone === "primary" || f.tone === "accent"
                ? "text-background-100/85"
                : "text-foreground-600";
            return (
              <div
                key={i}
                className={`rounded-lg p-7 border border-background-200/60 ${bg} transition-transform hover:-translate-y-1 duration-300`}
              >
                <div
                  className={`w-11 h-11 rounded-md flex items-center justify-center ${iconBg}`}
                >
                  <i className={`${f.icon} text-xl`}></i>
                </div>
                <h3 className="mt-6 font-heading text-2xl leading-tight">{f.title}</h3>
                <p className={`mt-3 text-sm leading-relaxed ${desc}`}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}