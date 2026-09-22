import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "./components/DashboardHeader";
import CreateLinkForm from "./components/CreateLinkForm";
import LinksList, { type DashboardLink } from "./components/LinksList";
import DashboardActivity from "./components/DashboardActivity";
import StatsSummary from "./components/StatsSummary";

export default function Dashboard() {
  const [links, setLinks] = useState<DashboardLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase
        .from("links")
        .select("id, slug, destination_url, title, active, total_clicks, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setLoadError(error.message);
      } else {
        setLinks(data ?? []);
      }
    } catch {
      setLoadError("Something went wrong while loading your links.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  return (
    <div className="min-h-screen bg-background-50">
      <DashboardHeader />

      <div className="lg:pl-64">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 px-4 md:px-8 py-8 max-w-[1600px] mx-auto">
          <main className="flex-1 min-w-0">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl text-foreground-950">Your links</h1>
              <p className="mt-1 text-foreground-600">Paste a URL to create a short link.</p>
            </div>

            <div className="mt-6">
              <CreateLinkForm onCreated={loadLinks} />
            </div>

            <StatsSummary links={links} />

            <LinksList links={links} loading={loading} error={loadError} onChanged={loadLinks} />
          </main>

          <aside className="w-full lg:w-80 xl:w-96 shrink-0">
            <DashboardActivity />
          </aside>
        </div>
      </div>
    </div>
  );
}