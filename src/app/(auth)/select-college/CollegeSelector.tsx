"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, ArrowRight, CheckCircle2 } from "lucide-react";
import { selectCollege } from "@/actions/auth";

type College = {
  id: string;
  name: string;
  city: string;
  state: string;
};

export default function CollegeSelector({ colleges }: { colleges: College[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = colleges.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
  );

  async function handleConfirm() {
    if (!selectedId) return;
    setLoading(true);
    setError(null);

    const result = await selectCollege(selectedId);
    if (!result.success) {
      setError(result.message || "Failed to select college");
      setLoading(false);
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent-bright border border-accent/30">
          <Building2 className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Select Your Campus
        </h1>
        <p className="mt-2 text-xs text-zinc-400">
          Choose your university to unlock your college feed and discussions
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by institute name, city, or state..."
          className="w-full rounded-xl border border-white/10 bg-zinc-950/70 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No matching colleges found.
          </div>
        ) : (
          filtered.map((college) => {
            const isSelected = selectedId === college.id;
            return (
              <button
                key={college.id}
                type="button"
                onClick={() => setSelectedId(college.id)}
                className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                  isSelected
                    ? "border-accent bg-accent/10"
                    : "border-white/[0.06] bg-zinc-950/40 hover:border-white/10 hover:bg-zinc-950/80"
                }`}
              >
                <div>
                  <p className="text-xs font-semibold text-white">
                    {college.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    {college.city}, {college.state}
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-bright" />
                )}
              </button>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!selectedId || loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-colors hover:bg-zinc-200 disabled:opacity-40"
      >
        {loading ? "Joining Campus..." : "Confirm & Enter Feed"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
