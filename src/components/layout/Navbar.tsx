import Link from "next/link";
import { MessageCircle, Search, MapPin, Zap } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-zinc-950/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-[18px] w-[18px] text-accent-bright" strokeWidth={2.5} />
            <span className="text-[15px] font-semibold tracking-tight text-white">
              Campify
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {[
              { href: "/feed", label: "Feed", icon: MessageCircle },
              { href: "/search", label: "Explore", icon: Search },
              { href: "/map", label: "Map", icon: MapPin },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-100"
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="rounded-full px-4 py-1.5 text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-colors hover:bg-zinc-200"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
