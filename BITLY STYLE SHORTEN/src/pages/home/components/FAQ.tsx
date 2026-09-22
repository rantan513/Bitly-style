import { useState } from "react";

const faqs = [
  {
    q: "How accurate is the geolocation?",
    a: "Linkly queries three IP geolocation providers in parallel (ipinfo.io, ipapi.co, ipwho.is) and picks the majority-vote result for city/region, averaging the coordinates. Typical city-level accuracy is ~85%, country-level is 99%+.",
  },
  {
    q: "Do bots inflate my click count?",
    a: "No. Every click runs through a scoring engine that flags known bots, headless browsers, datacenter IPs, and proxy networks. Bot clicks are still logged for auditing but never counted toward your public total.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes — Pro users can point a custom subdomain (like go.yourbrand.com) at Linkly. Free users get links on linkly.co/r/... .",
  },
  {
    q: "What about link expiration?",
    a: "Every link supports an optional expiration date. You can also toggle a link off instantly with a single click — perfect for campaigns you want to end on time.",
  },
  {
    q: "Is my data private?",
    a: "Row Level Security means only you can see your links and their click data. IP addresses are anonymized in the UI. Service keys live only in edge functions — never in the browser.",
  },
  {
    q: "Do I get an API?",
    a: "Pro plans include a REST API for creating links, fetching analytics, and streaming click events. Bring your own automations.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-background-100 py-24 md:py-32 border-y border-background-200">
      <div className="max-w-4xl mx-auto px-4 md:px-10">
        <div className="text-center">
          <div className="text-xs font-medium tracking-widest uppercase text-primary-600">
            Questions
          </div>
          <h2 className="mt-4 font-heading text-4xl md:text-6xl text-foreground-950 tracking-tight">
            Answers, briefly.
          </h2>
        </div>

        <div className="mt-14 divide-y divide-background-300/60 border-y border-background-300/60">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <button
                key={i}
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full text-left py-6 cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-6">
                  <span className="font-heading text-xl md:text-2xl text-foreground-950">
                    {f.q}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-full border border-background-300 flex items-center justify-center text-foreground-700 transition-transform ${
                      isOpen ? "rotate-45 bg-primary-500 border-primary-500 text-background-50" : ""
                    }`}
                  >
                    <i className="ri-add-line"></i>
                  </span>
                </div>
                {isOpen && (
                  <p className="mt-4 text-foreground-600 leading-relaxed max-w-3xl">
                    {f.a}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}