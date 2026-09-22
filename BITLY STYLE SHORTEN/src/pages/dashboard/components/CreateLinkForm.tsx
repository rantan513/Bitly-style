import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { generateSlug, isValidSlug, isValidUrl, normalizeUrl } from "@/lib/links";

interface CreateLinkFormProps {
  onCreated: () => void;
}

export default function CreateLinkForm({ onCreated }: CreateLinkFormProps) {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const raw = url.trim();
    if (!raw || creating) return;

    setError(null);

    if (!user) {
      setError("You need to be signed in to create a link.");
      return;
    }

    if (!isValidUrl(raw)) {
      setError("Enter a valid URL — it should start with http:// or https://.");
      return;
    }

    const customSlug = slug.trim().toLowerCase();
    if (customSlug && !isValidSlug(customSlug)) {
      setError("Short code can only contain lowercase letters, numbers, and hyphens.");
      return;
    }

    setCreating(true);
    const destination = normalizeUrl(raw);
    const titleValue = title.trim() || null;
    const payload = {
      user_id: user.id,
      destination_url: destination,
      title: titleValue,
      active: true,
    };

    // Custom slug: single attempt, report collisions clearly.
    if (customSlug) {
      const { error: insertErr } = await supabase
        .from("links")
        .insert({ ...payload, slug: customSlug });
      setCreating(false);

      if (insertErr) {
        const isDuplicate = insertErr.code === "23505" || /duplicate/i.test(insertErr.message);
        setError(
          isDuplicate
            ? "That short code is already taken — try another one."
            : insertErr.message || "Something went wrong. Please try again."
        );
        return;
      }

      setUrl("");
      setTitle("");
      setSlug("");
      onCreated();
      return;
    }

    // Auto-generated slug: retry a few times on collision.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const genSlug = generateSlug();
      const { error: insertErr } = await supabase
        .from("links")
        .insert({ ...payload, slug: genSlug });

      if (!insertErr) {
        setUrl("");
        setTitle("");
        setSlug("");
        setCreating(false);
        onCreated();
        return;
      }

      const isDuplicate = insertErr.code === "23505" || /duplicate/i.test(insertErr.message);
      if (!isDuplicate) {
        setError(insertErr.message || "Something went wrong. Please try again.");
        setCreating(false);
        return;
      }
    }

    setError("Couldn't generate a unique link. Please try again.");
    setCreating(false);
  };

  return (
    <div className="bg-background-50 border border-background-200 rounded-lg p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 border border-background-300 rounded-md bg-background-50 focus-within:border-primary-400 transition-colors">
            <i className="ri-links-line text-foreground-500 text-lg w-5 h-5 flex items-center justify-center"></i>
            <input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste a long URL here..."
              className="flex-1 bg-transparent outline-none py-3 text-sm text-foreground-950 placeholder:text-foreground-400"
            />
          </div>
          <button
            type="submit"
            disabled={creating || !url.trim()}
            className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-background-50 px-6 py-3 rounded-md text-sm font-medium whitespace-nowrap cursor-pointer transition-colors"
          >
            {creating ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-background-50/40 border-t-background-50 animate-spin"></span>
                Creating...
              </span>
            ) : (
              "Create link"
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2 px-3 border border-background-300 rounded-md bg-background-50 focus-within:border-primary-400 transition-colors">
            <i className="ri-edit-2-line text-foreground-500 text-lg w-5 h-5 flex items-center justify-center"></i>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="flex-1 bg-transparent outline-none py-3 text-sm text-foreground-950 placeholder:text-foreground-400"
            />
          </div>
          <div className="flex items-center gap-1 px-3 border border-background-300 rounded-md bg-background-50 focus-within:border-primary-400 transition-colors">
            <span className="text-sm text-foreground-400 whitespace-nowrap">/r/</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="custom-code"
              className="flex-1 bg-transparent outline-none py-3 text-sm text-foreground-950 placeholder:text-foreground-400"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-primary-700">
            <i className="ri-error-warning-line w-4 h-4 flex items-center justify-center mt-0.5"></i>
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
}