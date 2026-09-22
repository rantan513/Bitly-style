import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/pages/dashboard/components/DashboardHeader";

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background-50 lg:pl-64">
      <DashboardHeader />

      <main className="mx-auto px-4 md:px-10 py-8 max-w-3xl">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-foreground-950">Settings</h1>
          <p className="mt-1 text-foreground-600">Manage your account and preferences.</p>
        </div>

        {/* Account */}
        <section className="mt-6 bg-background-50 border border-background-200 rounded-lg p-6">
          <div className="flex items-center gap-2">
            <i className="ri-user-settings-line w-5 h-5 flex items-center justify-center text-foreground-500"></i>
            <h2 className="font-heading text-lg text-foreground-950">Account</h2>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <span className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-medium shrink-0">
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground-950 truncate">{user?.email ?? "—"}</span>
                <span className="px-2 py-0.5 rounded-full bg-accent-100 text-accent-900 text-xs font-medium whitespace-nowrap">
                  Free plan
                </span>
              </div>
              <div className="mt-1 text-sm text-foreground-500">
                Member since {formatDate(user?.created_at)}
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-background-200 pt-4 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-foreground-500">Email</span>
              <span className="text-foreground-900 truncate">{user?.email ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-foreground-500">User ID</span>
              <span className="text-foreground-900 font-mono text-xs truncate">{user?.id ?? "—"}</span>
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section className="mt-6 bg-background-50 border border-background-200 rounded-lg p-6">
          <div className="flex items-center gap-2">
            <i className="ri-alert-line w-5 h-5 flex items-center justify-center text-foreground-500"></i>
            <h2 className="font-heading text-lg text-foreground-950">Sign out</h2>
          </div>
          <p className="mt-2 text-sm text-foreground-500">
            Sign out of your account on this device. Your links and analytics are saved and will be
            here when you sign back in.
          </p>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-4 px-4 py-2 rounded-md bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors disabled:opacity-60"
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </section>
      </main>
    </div>
  );
}