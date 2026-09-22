import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS: { to: string; label: string; icon: string; match: (p: string) => boolean }[] = [
  {
    to: "/dashboard",
    label: "Links",
    icon: "ri-link-m",
    match: (p) => p === "/dashboard" || p.startsWith("/dashboard/links"),
  },
  {
    to: "/dashboard/analytics",
    label: "Analytics",
    icon: "ri-bar-chart-2-line",
    match: (p) => p.startsWith("/dashboard/analytics"),
  },
  {
    to: "/dashboard/compare",
    label: "Compare",
    icon: "ri-scales-3-line",
    match: (p) => p.startsWith("/dashboard/compare"),
  },
  {
    to: "/dashboard/settings",
    label: "Settings",
    icon: "ri-settings-3-line",
    match: (p) => p.startsWith("/dashboard/settings"),
  },
];

export default function DashboardHeader() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile / tablet top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-background-50/90 backdrop-blur border-b border-background-200">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <span className="w-8 h-8 rounded-lg bg-foreground-950 flex items-center justify-center">
                <i className="ri-link-m text-lg text-background-50"></i>
              </span>
              <span className="font-heading text-xl text-foreground-950">Linkly</span>
            </Link>
            <nav className="hidden md:flex items-center gap-5 text-sm">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`${
                    item.match(pathname)
                      ? "text-foreground-950 font-medium"
                      : "text-foreground-600 hover:text-foreground-950"
                  } cursor-pointer`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
                {user?.email?.[0]?.toUpperCase() ?? "U"}
              </span>
              <span className="hidden md:inline text-sm text-foreground-700 group-hover:text-foreground-950">
                {user?.email}
              </span>
              <i className="ri-arrow-down-s-line text-foreground-500"></i>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-background-50 border border-background-200 rounded-lg p-1.5">
                <div className="px-3 py-2 border-b border-background-200 mb-1">
                  <div className="text-sm text-foreground-950 truncate">{user?.email}</div>
                  <div className="text-xs text-foreground-500">Free plan</div>
                </div>
                <Link
                  to="/dashboard/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground-700 hover:bg-background-100 rounded-md cursor-pointer"
                >
                  <i className="ri-settings-3-line w-4 h-4 flex items-center justify-center"></i>
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary-700 hover:bg-background-100 rounded-md cursor-pointer text-left"
                >
                  <i className="ri-logout-box-r-line w-4 h-4 flex items-center justify-center"></i>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-background-50 border-r border-background-200 z-40">
        <div className="px-6 h-16 flex items-center border-b border-background-200">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <span className="w-9 h-9 rounded-lg bg-foreground-950 flex items-center justify-center">
              <i className="ri-link-m text-xl text-background-50"></i>
            </span>
            <span className="font-heading text-xl text-foreground-950">Linkly</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm cursor-pointer transition-colors ${
                item.match(pathname)
                  ? "font-medium text-foreground-950 bg-background-100"
                  : "text-foreground-600 hover:text-foreground-950 hover:bg-background-100"
              }`}
            >
              <i className={`${item.icon} w-5 h-5 flex items-center justify-center`}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-background-200">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-100 cursor-pointer transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium shrink-0">
                {user?.email?.[0]?.toUpperCase() ?? "U"}
              </span>
              <span className="min-w-0 flex-1 text-left text-sm text-foreground-700 truncate">
                {user?.email}
              </span>
              <i className="ri-arrow-down-s-line text-foreground-500"></i>
            </button>

            {menuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-background-50 border border-background-200 rounded-lg p-1.5">
                <div className="px-3 py-2 border-b border-background-200 mb-1">
                  <div className="text-sm text-foreground-950 truncate">{user?.email}</div>
                  <div className="text-xs text-foreground-500">Free plan</div>
                </div>
                <Link
                  to="/dashboard/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground-700 hover:bg-background-100 rounded-md cursor-pointer"
                >
                  <i className="ri-settings-3-line w-4 h-4 flex items-center justify-center"></i>
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary-700 hover:bg-background-100 rounded-md cursor-pointer text-left"
                >
                  <i className="ri-logout-box-r-line w-4 h-4 flex items-center justify-center"></i>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}