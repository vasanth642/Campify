import Link from "next/link";
import { MessageCircle, Search, MapPin, Zap, LogOut, User } from "lucide-react";
import { auth, signOut } from "@/lib/auth";

export async function Navbar() {
  const session = await auth();

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
          {session?.user ? (
            <div className="flex items-center gap-3">
              {session.user.collegeName && (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="max-w-[140px] truncate">{session.user.collegeName}</span>
                </span>
              )}
              <Link
                href="/profile"
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-[13px] font-medium text-white transition-colors hover:border-white/20"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[10px] font-semibold text-accent-bright">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span>{session.user.name}</span>
              </Link>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.02] p-1.5 text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
