import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "For creators just getting started.",
    features: ["500 links / month", "Basic click analytics", "QR codes", "7-day click history", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    desc: "For marketers and growing brands.",
    features: [
      "Unlimited short links",
      "Full analytics + world map",
      "Custom slugs & branded domain",
      "Compare mode + bot filtering",
      "Unlimited history + exports",
      "Priority email support",
    ],
    cta: "Try Pro free 14 days",
    highlight: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-background-50 py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-4 md:px-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-medium tracking-widest uppercase text-primary-600">
            Simple pricing
          </div>
          <h2 className="mt-4 font-heading text-4xl md:text-6xl text-foreground-950 tracking-tight">
            Pay for growth, not <span className="italic">features</span>.
          </h2>
          <p className="mt-4 text-foreground-600 text-lg">
            Two plans. No seats math. Cancel anytime.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl p-8 border transition-transform hover:-translate-y-1 duration-300 ${
                p.highlight
                  ? "bg-foreground-950 text-background-50 border-foreground-950"
                  : "bg-background-50 text-foreground-950 border-background-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-heading text-2xl ${p.highlight ? "text-background-50" : ""}`}>
                  {p.name}
                </span>
                {p.highlight && (
                  <span className="text-[11px] uppercase tracking-widest bg-accent-500 text-foreground-950 px-2.5 py-1 rounded-full font-medium">
                    Most popular
                  </span>
                )}
              </div>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-heading text-6xl">{p.price}</span>
                <span className={`text-sm ${p.highlight ? "text-background-200" : "text-foreground-500"}`}>
                  {p.period}
                </span>
              </div>
              <p className={`mt-3 text-sm ${p.highlight ? "text-background-200" : "text-foreground-600"}`}>
                {p.desc}
              </p>
              <Link
                to="/signup"
                className={`mt-7 block text-center py-3 rounded-md text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  p.highlight
                    ? "bg-primary-500 hover:bg-primary-600 text-background-50"
                    : "bg-foreground-950 hover:bg-foreground-800 text-background-50"
                }`}
              >
                {p.cta}
              </Link>
              <ul className="mt-7 space-y-3">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className={`flex gap-3 text-sm ${p.highlight ? "text-background-100" : "text-foreground-700"}`}
                  >
                    <i
                      className={`ri-check-line w-5 h-5 flex items-center justify-center mt-0.5 ${
                        p.highlight ? "text-accent-400" : "text-primary-600"
                      }`}
                    ></i>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}