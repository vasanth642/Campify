import Link from "next/link";
import { Compass, MessageSquare, Search, MapPin, User, LogIn } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Compass className="h-4 w-4" />
            </div>
            <span className="text-lg">CampusAssist</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 md:flex dark:text-zinc-400">
            <Link
              href="/feed"
              className="flex items-center gap-1.5 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              <MessageSquare className="h-4 w-4" />
              Feed
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-1.5 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              <Search className="h-4 w-4" />
              Explore
            </Link>
            <Link
              href="/map"
              className="flex items-center gap-1.5 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              <MapPin className="h-4 w-4" />
              Campus Map
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3.5 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-zinc-900 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

