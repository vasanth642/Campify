"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Globe, Sparkles } from "lucide-react";
import { createPost } from "@/actions/posts";
import { CATEGORIES } from "@/constants/categories";

const availableCategories = CATEGORIES.filter((c) => c.id !== "all" && c.id !== "help");

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState(availableCategories[0].id);
  const [scope, setScope] = useState<"my_college" | "across_india">("my_college");
  const [isHelpWanted, setIsHelpWanted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    formData.append("category", category);
    formData.append("scope", scope);
    formData.append("isHelpWanted", String(isHelpWanted));

    const result = await createPost(formData);

    if (!result.success) {
      setError(result.message || "Failed to create post");
      setLoading(false);
      return;
    }

    router.push(`/post/${result.postId}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/feed"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to discussions
      </Link>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Start a Discussion
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Share updates, questions, or opportunities with your peers
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300">
              Post Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Any advice for ML elective with Prof. Sharma?"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300">
              Details & Context
            </label>
            <textarea
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Give enough details so students can give you actionable answers..."
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950/70 p-4 text-sm text-white placeholder-zinc-500 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300">
              Category
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    category === c.id
                      ? "border-accent bg-accent/20 text-accent-bright"
                      : "border-white/[0.06] bg-zinc-950/50 text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300">
              Visibility Scope
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setScope("my_college")}
                className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                  scope === "my_college"
                    ? "border-accent bg-accent/10 text-white"
                    : "border-white/[0.06] bg-zinc-950/50 text-zinc-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <Building2 className="h-4 w-4 shrink-0 text-accent-bright" />
                <div>
                  <span className="block text-xs font-semibold">Campus Only</span>
                  <span className="text-[10px] text-zinc-500">
                    Visible only to students of your college
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope("across_india")}
                className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                  scope === "across_india"
                    ? "border-accent bg-accent/10 text-white"
                    : "border-white/[0.06] bg-zinc-950/50 text-zinc-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <Globe className="h-4 w-4 shrink-0 text-emerald-400" />
                <div>
                  <span className="block text-xs font-semibold">Across India</span>
                  <span className="text-[10px] text-zinc-500">
                    Shared with students in all institutes
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Help Wanted Toggle */}
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-zinc-950/50 p-3.5">
            <input
              type="checkbox"
              id="helpWanted"
              checked={isHelpWanted}
              onChange={(e) => setIsHelpWanted(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-accent focus:ring-accent"
            />
            <label htmlFor="helpWanted" className="cursor-pointer text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Mark as "Help Wanted"
              </span>
              <span className="text-[11px] text-zinc-400 block mt-0.5">
                Highlights your post with an urgent priority tag for fast answers.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-colors hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Discussion"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
