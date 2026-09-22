import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { label: "Features", href: "#features" },
    { label: "Analytics", href: "#analytics" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background-50/90 backdrop-blur border-b border-background-200"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto px-4 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <span
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              scrolled ? "bg-foreground-950" : "bg-background-50"
            }`}
          >
            <i
              className={`ri-link-m text-xl ${
                scrolled ? "text-background-50" : "text-foreground-950"
              }`}
            ></i>
          </span>
          <span
            className={`font-heading text-2xl tracking-tight ${
              scrolled ? "text-foreground-950" : "text-background-50"
            }`}
          >
            Linkly
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                scrolled
                  ? "text-foreground-700 hover:text-foreground-950"
                  : "text-background-100 hover:text-background-50"
              }`}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="text-sm font-medium bg-primary-500 hover:bg-primary-600 text-background-50 px-5 py-2.5 rounded-md whitespace-nowrap cursor-pointer transition-colors"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-medium cursor-pointer whitespace-nowrap ${
                  scrolled ? "text-foreground-800" : "text-background-100"
                }`}
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium bg-primary-500 hover:bg-primary-600 text-background-50 px-5 py-2.5 rounded-md whitespace-nowrap cursor-pointer transition-colors"
              >
                Start free
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className={`md:hidden w-10 h-10 flex items-center justify-center cursor-pointer ${
            scrolled ? "text-foreground-950" : "text-background-50"
          }`}
          aria-label="menu"
        >
          <i className={`${open ? "ri-close-line" : "ri-menu-line"} text-2xl`}></i>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background-50 border-t border-background-200 px-4 py-4 space-y-3">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block text-foreground-800 text-sm font-medium py-2 cursor-pointer"
            >
              {n.label}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            {user ? (
              <Link to="/dashboard" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 rounded-md bg-primary-500 text-background-50 text-sm cursor-pointer whitespace-nowrap">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 rounded-md border border-background-300 text-foreground-800 text-sm cursor-pointer whitespace-nowrap">
                  Sign in
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 rounded-md bg-primary-500 text-background-50 text-sm cursor-pointer whitespace-nowrap">
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}