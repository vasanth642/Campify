import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center text-zinc-100">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/60 shadow-xl">
        <Compass className="h-8 w-8 text-accent-bright" />
      </div>

      <span className="mt-6 font-mono text-xs font-semibold uppercase tracking-wider text-accent-bright">
        404 Not Found
      </span>

      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        This campus path does not exist
      </h1>

      <p className="mt-3 max-w-md text-sm text-zinc-400">
        The discussion, profile, or route you are looking for has been relocated or is unavailable.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Campus Feed</span>
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
        >
          Home Overview
        </Link>
      </div>
    </div>
  );
}
