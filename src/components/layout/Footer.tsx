import Link from "next/link";
import { Zap, Github } from "lucide-react";

const navLinks = [
  { label: "Feed", href: "/feed" },
  { label: "Explore", href: "/search" },
  { label: "Campus Map", href: "/map" },
  { label: "Privacy", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-zinc-950/80 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <Zap className="h-4 w-4 text-accent-bright" strokeWidth={2.5} />
          <span className="text-sm font-semibold tracking-tight text-white">
            Campify
          </span>
          <span className="text-xs text-zinc-500">
            (c) {new Date().getFullYear()}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
