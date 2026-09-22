import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <img
        src="https://readdy.ai/api/search-image?query=Warm%20abstract%20terracotta%20and%20deep%20olive%20gradient%20texture%20with%20soft%20grain%2C%20minimalist%20editorial%20background%2C%20cinematic%20natural%20lighting%2C%20flowing%20organic%20shapes%2C%20refined%20magazine%20cover%20art%20direction%2C%20muted%20saturated%20tones%20with%20dark%20center%20for%20text%20contrast&width=1800&height=800&seq=cta-linkly-01&orientation=landscape"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-foreground-950/70"></div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-10 text-center">
        <h2 className="font-heading text-5xl md:text-7xl text-background-50 tracking-tight leading-[1.05]">
          Start shortening.<br />
          <span className="italic text-accent-300">Start seeing.</span>
        </h2>
        <p className="mt-6 text-lg text-background-100/85 max-w-xl mx-auto">
          Join 12,400+ marketers and creators who replaced guesswork with real click intelligence.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/signup"
            className="bg-primary-500 hover:bg-primary-600 text-background-50 px-8 py-3.5 rounded-md text-sm font-medium whitespace-nowrap cursor-pointer transition-colors"
          >
            Create your first short link — free
          </Link>
          <a
            href="#features"
            className="border border-background-50/40 text-background-50 hover:bg-background-50/10 px-8 py-3.5 rounded-md text-sm font-medium whitespace-nowrap cursor-pointer transition-colors"
          >
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}