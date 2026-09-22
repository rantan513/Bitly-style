import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { buildShortUrl, formatRelativeTime } from "@/lib/links";

export interface DashboardLink {
  id: string;
  slug: string;
  destination_url: string;
  title: string | null;
  active: boolean;
  total_clicks: number;
  created_at: string;
}

interface LinksListProps {
  links: DashboardLink[];
  loading: boolean;
  error: string | null;
  onChanged: () => void;
}

function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function LinksList({ links, loading, error, onChanged }: LinksListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const copy = async (link: DashboardLink) => {
    const shortUrl = buildShortUrl(link.slug);
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId((id) => (id === link.id ? null : id)), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const toggle = async (link: DashboardLink) => {
    setBusyId(link.id);
    const { error: toggleErr } = await supabase
      .from("links")
      .update({ active: !link.active })
      .eq("id", link.id);
    setBusyId(null);
    if (!toggleErr) onChanged();
  };

  const remove = async (link: DashboardLink) => {
    setBusyId(link.id);
    const { error: deleteErr } = await supabase.from("links").delete().eq("id", link.id);
    setBusyId(null);
    setConfirmDeleteId(null);
    if (!deleteErr) onChanged();
  };

  if (loading) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center py-16 text-foreground-500">
        <div className="w-8 h-8 rounded-full border-2 border-background-200 border-t-primary-500 animate-spin"></div>
        <p className="mt-4 text-sm">Loading your links...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 border border-background-300 rounded-lg py-16 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-background-100 flex items-center justify-center">
          <i className="ri-error-warning-line text-2xl text-foreground-400 w-14 h-14 flex items-center justify-center"></i>
        </div>
        <h3 className="mt-5 font-heading text-2xl text-foreground-950">Couldn't load your links</h3>
        <p className="mt-2 text-sm text-foreground-500">{error}</p>
        <button
          onClick={onChanged}
          className="mt-5 bg-foreground-950 hover:bg-foreground-800 text-background-50 px-5 py-2.5 rounded-md text-sm font-medium whitespace-nowrap cursor-pointer transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="mt-8 border border-dashed border-background-300 rounded-lg py-20 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-background-100 flex items-center justify-center">
          <i className="ri-link text-2xl text-foreground-400 w-14 h-14 flex items-center justify-center"></i>
        </div>
        <h3 className="mt-5 font-heading text-2xl text-foreground-950">No links yet</h3>
        <p className="mt-2 text-sm text-foreground-500 max-w-sm mx-auto">
          Your short links and their click analytics will show up here. Create your first one above.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      {links.map((link) => {
        const isCopied = copiedId === link.id;
        const isConfirming = confirmDeleteId === link.id;
        const isBusy = busyId === link.id;

        return (
          <div
            key={link.id}
            className={`bg-background-50 border border-background-200 rounded-lg p-4 transition-colors ${
              link.active ? "" : "opacity-70"
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Destination */}
              <Link to={`/dashboard/links/${link.id}`} className="flex-1 min-w-0 cursor-pointer group">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-md bg-background-100 flex items-center justify-center shrink-0">
                    <i className="ri-global-line text-foreground-500 w-8 h-8 flex items-center justify-center"></i>
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground-950 truncate group-hover:text-primary-700 transition-colors">
                      {link.title || displayHost(link.destination_url)}
                    </div>
                    <div className="text-xs text-foreground-500 truncate">{link.destination_url}</div>
                  </div>
                </div>
              </Link>

              {/* Short URL + meta */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => copy(link)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background-100 hover:bg-background-200 border border-background-200 text-sm text-foreground-700 whitespace-nowrap cursor-pointer transition-colors"
                  title="Copy short link"
                >
                  <span className="font-medium text-primary-700">{`/${link.slug}`}</span>
                  <i
                    className={`${isCopied ? "ri-check-line text-primary-700" : "ri-file-copy-line"} w-4 h-4 flex items-center justify-center`}
                  ></i>
                </button>

                <span className="flex items-center gap-1.5 text-sm text-foreground-600 whitespace-nowrap">
                  <i className="ri-bar-chart-2-line w-4 h-4 flex items-center justify-center text-foreground-400"></i>
                  <span className="font-medium">{link.total_clicks}</span>
                  <span>{link.total_clicks === 1 ? "click" : "clicks"}</span>
                </span>

                <span className="text-xs text-foreground-400 whitespace-nowrap">
                  {formatRelativeTime(link.created_at)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Link
                  to={`/dashboard/links/${link.id}`}
                  className="w-9 h-9 rounded-md flex items-center justify-center text-foreground-500 hover:bg-background-100 hover:text-foreground-950 cursor-pointer transition-colors"
                  title="View analytics"
                >
                  <i className="ri-line-chart-line text-lg w-9 h-9 flex items-center justify-center"></i>
                </Link>

                <button
                  onClick={() => toggle(link)}
                  disabled={isBusy}
                  className="w-9 h-9 rounded-md flex items-center justify-center text-foreground-500 hover:bg-background-100 hover:text-foreground-950 disabled:opacity-50 cursor-pointer transition-colors"
                  title={link.active ? "Disable link" : "Enable link"}
                >
                  <i
                    className={`${link.active ? "ri-pause-circle-line" : "ri-play-circle-line"} text-lg w-9 h-9 flex items-center justify-center`}
                  ></i>
                </button>

                {isConfirming ? (
                  <button
                    onClick={() => remove(link)}
                    disabled={isBusy}
                    className="px-3 h-9 rounded-md bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {isBusy ? "Deleting..." : "Confirm"}
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(link.id)}
                    className="w-9 h-9 rounded-md flex items-center justify-center text-foreground-500 hover:bg-background-100 hover:text-foreground-950 cursor-pointer transition-colors"
                    title="Delete link"
                  >
                    <i className="ri-delete-bin-line text-lg w-9 h-9 flex items-center justify-center"></i>
                  </button>
                )}
              </div>
            </div>

            {isCopied && (
              <div className="mt-3 text-xs text-primary-700 flex items-center gap-1.5">
                <i className="ri-check-double-line w-4 h-4 flex items-center justify-center"></i>
                <span>Copied to clipboard</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}