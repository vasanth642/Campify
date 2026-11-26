"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("CampusAssist Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center text-zinc-100">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 shadow-xl">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>

      <span className="mt-6 font-mono text-xs font-semibold uppercase tracking-wider text-red-400">
        Application Error
      </span>

      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Something went wrong
      </h1>

      <p className="mt-3 max-w-md text-sm text-zinc-400">
        An unexpected error occurred during execution. You can attempt to retry the current request or return to the feed.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </button>
        <Link
          href="/feed"
          className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
        >
          Back to Discussions
        </Link>
      </div>
    </div>
  );
}
