import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background-50">
      {/* Branding panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=Warm%20abstract%20editorial%20background%20with%20soft%20terracotta%20and%20muted%20olive%20gradient%20flowing%20into%20deep%20charcoal%2C%20organic%20curves%2C%20subtle%20grain%20texture%2C%20minimalist%20art%20direction%2C%20cinematic%20warm%20lighting%2C%20refined%20magazine%20composition%2C%20high%20contrast%20negative%20space&width=900&height=1100&seq=auth-linkly-01&orientation=portrait"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-foreground-950/50"></div>

        <Link to="/" className="relative z-10 flex items-center gap-2 cursor-pointer">
          <span className="w-9 h-9 rounded-lg bg-background-50 flex items-center justify-center">
            <i className="ri-link-m text-xl text-foreground-950"></i>
          </span>
          <span className="font-heading text-2xl text-background-50">Linkly</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="font-heading text-3xl text-background-50 leading-snug">
            &ldquo;Finally, short links that actually <span className="italic text-accent-300">tell</span> you who clicked.&rdquo;
          </p>
          <p className="mt-4 text-sm text-background-100/80">— Maya R., Growth Marketer</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 md:px-16 py-12 lg:py-0">
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <span className="w-9 h-9 rounded-lg bg-foreground-950 flex items-center justify-center">
            <i className="ri-link-m text-xl text-background-50"></i>
          </span>
          <span className="font-heading text-2xl text-foreground-950">Linkly</span>
        </div>

        <div className="max-w-md w-full mx-auto">
          <h1 className="font-heading text-4xl text-foreground-950 tracking-tight">{title}</h1>
          <p className="mt-3 text-foreground-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}