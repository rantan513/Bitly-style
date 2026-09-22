import { useState } from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  const [url, setUrl] = useState("");

  return (
    <section className="relative min-h-[780px] w-full overflow-hidden">
      <img
        src="https://readdy.ai/api/search-image?query=Warm%20abstract%20editorial%20background%20with%20soft%20terracotta%20and%20muted%20olive%20gradient%20blending%20into%20deep%20charcoal%2C%20organic%20flowing%20curves%2C%20subtle%20grain%20texture%2C%20minimalist%20art%20direction%2C%20cinematic%20warm%20lighting%2C%20high%20contrast%20with%20readable%20negative%20space%20on%20left%20side%2C%20refined%20magazine%20style%20composition&width=1800&height=1100&seq=hero-linkly-01&orientation=landscape"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground-950/60 via-foreground-950/45 to-foreground-950/70"></div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-10 pt-40 md:pt-48 pb-20">
        <div className="max-w-3xl animate-rise">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background-50/10 border border-background-50/25 text-background-100 text-xs font-medium backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400"></span>
            Trusted by 12,400+ marketers &amp; creators
          </span>
          <h1 className="mt-6 font-heading text-5xl md:text-7xl leading-[1.05] text-background-50 tracking-tight">
            Short links.<br />
            <span className="italic text-accent-300">Loud</span> insights.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-background-100/90 max-w-2xl leading-relaxed">
            Turn every long URL into a branded short link — then see exactly who
            clicks, from where, and on what device. Real analytics, real fast.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="mt-10 bg-background-50 rounded-xl p-2 flex flex-col sm:flex-row gap-2 shadow-none border border-background-50/20 max-w-2xl"
          >
            <div className="flex-1 flex items-center gap-2 px-3">
              <i className="ri-links-line text-foreground-500 text-lg w-5 h-5 flex items-center justify-center"></i>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your long URL here..."
                className="flex-1 bg-transparent outline-none py-3 text-sm text-foreground-950 placeholder:text-foreground-400"
              />
            </div>
            <Link
              to="/signup"
              className="bg-foreground-950 hover:bg-foreground-800 text-background-50 px-6 py-3 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer text-center transition-colors flex items-center justify-center gap-2"
            >
              Shorten it
              <i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center"></i>
            </Link>
          </form>

          <div className="mt-6 flex flex-wrap gap-6 text-background-100/80 text-sm">
            <span className="flex items-center gap-2">
              <i className="ri-check-line text-accent-300 w-4 h-4 flex items-center justify-center"></i>
              Free 500 links / month
            </span>
            <span className="flex items-center gap-2">
              <i className="ri-check-line text-accent-300 w-4 h-4 flex items-center justify-center"></i>
              No credit card
            </span>
            <span className="flex items-center gap-2">
              <i className="ri-check-line text-accent-300 w-4 h-4 flex items-center justify-center"></i>
              QR codes included
            </span>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 max-w-3xl">
          {[
            { k: "8.4M", v: "Clicks tracked" },
            { k: "12.4K", v: "Active users" },
            { k: "196", v: "Countries" },
            { k: "99.99%", v: "Redirect uptime" },
          ].map((s) => (
            <div key={s.v}>
              <div className="font-heading text-3xl md:text-4xl text-background-50">{s.k}</div>
              <div className="text-xs md:text-sm text-background-100/70 mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}