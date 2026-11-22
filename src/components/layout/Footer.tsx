import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 py-8 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-zinc-500 sm:flex-row sm:px-6 lg:px-8 dark:text-zinc-400">
        <p>&copy; {new Date().getFullYear()} CampusAssist. Built for university communities.</p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <Link href="/guidelines" className="hover:underline">Campus Guidelines</Link>
        </div>
      </div>
    </footer>
  );
}

