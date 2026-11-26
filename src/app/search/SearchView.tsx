"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Building2,
  MapPin,
  UserPlus,
  Check,
  Clock,
  ExternalLink,
} from "lucide-react";
import BadgePill from "@/components/badges/BadgePill";
import { RepInfo } from "@/utils/reps";
import { linkify } from "@/utils/linkify";
import { sendConnectionRequest, removeConnection } from "@/actions/connections";

export type StudentSearchResult = {
  id: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  collegeId: string | null;
  collegeName: string;
  collegeCity: string;
  reps: number;
  repInfo: RepInfo;
  isSelf: boolean;
  connectionState: "none" | "pending_sent" | "pending_received" | "connected";
  connectionId?: string;
};

export default function SearchView({
  initialStudents,
  currentUserId,
  currentUserCollegeId,
  currentUserCollegeName,
}: {
  initialStudents: StudentSearchResult[];
  currentUserId: string | null;
  currentUserCollegeId: string | null;
  currentUserCollegeName: string | null;
}) {
  const [students, setStudents] = useState<StudentSearchResult[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "my_college">("all");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  async function handleConnect(targetId: string) {
    if (!currentUserId) {
      window.location.href = "/login";
      return;
    }

    setActionLoading((prev) => ({ ...prev, [targetId]: true }));
    const res = await sendConnectionRequest(targetId);

    if (res.success && res.state) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === targetId ? { ...s, connectionState: res.state! } : s
        )
      );
    }
    setActionLoading((prev) => ({ ...prev, [targetId]: false }));
  }

  async function handleDisconnect(targetId: string) {
    setActionLoading((prev) => ({ ...prev, [targetId]: true }));
    const res = await removeConnection(targetId);

    if (res.success) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === targetId ? { ...s, connectionState: "none" } : s
        )
      );
    }
    setActionLoading((prev) => ({ ...prev, [targetId]: false }));
  }

  const filteredStudents = students.filter((s) => {
    if (filterMode === "my_college" && currentUserCollegeId) {
      if (s.collegeId !== currentUserCollegeId) return false;
    }

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const matchUsername = s.username.toLowerCase().includes(query);
    const matchCollege = s.collegeName.toLowerCase().includes(query);
    const matchBio = s.bio.toLowerCase().includes(query);

    return matchUsername || matchCollege || matchBio;
  });

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 pt-8 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
              <Users className="h-3.5 w-3.5 text-accent-bright" />
              <span>Campus Network & Directory</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Discover Student Peers
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Build your inter-college network, collaborate on projects, and follow contributors.
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, college, skills, or bio..."
              className="w-full rounded-xl border border-white/10 bg-zinc-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 transition-colors focus:border-white/30 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900/40 p-1">
            <button
              onClick={() => setFilterMode("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filterMode === "all"
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All Campuses ({students.length})
            </button>
            {currentUserCollegeId && (
              <button
                onClick={() => setFilterMode("my_college")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  filterMode === "my_college"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                My Campus Only
              </button>
            )}
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/20 p-12 text-center">
            <Users className="mx-auto h-8 w-8 text-zinc-600" />
            <h3 className="mt-3 text-sm font-semibold text-white">No peers found</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Try adjusting your search terms or switch filter to All Campuses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 via-zinc-900/40 to-zinc-950/80 p-5 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:from-zinc-900/95 hover:via-zinc-900/55 hover:to-zinc-950 hover:shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/profile/${student.id}`}
                      className="flex items-center gap-3 transition-opacity hover:opacity-85"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 text-sm font-bold text-white shadow-inner">
                        {student.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white group-hover:text-accent-bright transition-colors">
                            {student.username}
                          </span>
                          {student.isSelf && (
                            <span className="rounded bg-accent/20 px-1.5 py-0.2 text-[9px] font-medium text-accent-bright">
                              You
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5">
                          <BadgePill repInfo={student.repInfo} showReps reps={student.reps} />
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="mt-3.5 flex items-center gap-1.5 text-xs text-zinc-400">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    <span className="truncate" title={student.collegeName}>
                      {student.collegeName}
                    </span>
                  </div>

                  {student.collegeCity && (
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <MapPin className="h-3 w-3 shrink-0 text-zinc-600" />
                      <span>{student.collegeCity}</span>
                    </div>
                  )}

                  <div className="mt-3 min-h-[3rem] text-xs leading-relaxed text-zinc-400">
                    {student.bio ? (
                      <p className="line-clamp-3">{linkify(student.bio)}</p>
                    ) : (
                      <p className="italic text-zinc-600">No bio shared yet.</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <Link
                    href={`/profile/${student.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>

                  {!student.isSelf && (
                    <div>
                      {student.connectionState === "connected" ? (
                        <button
                          onClick={() => handleDisconnect(student.id)}
                          disabled={actionLoading[student.id]}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300"
                          title="Click to disconnect"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Connected</span>
                        </button>
                      ) : student.connectionState === "pending_sent" ? (
                        <button
                          onClick={() => handleDisconnect(student.id)}
                          disabled={actionLoading[student.id]}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-800/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-red-500/30 hover:text-red-300"
                          title="Click to cancel request"
                        >
                          <Clock className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Requested</span>
                        </button>
                      ) : student.connectionState === "pending_received" ? (
                        <Link
                          href="/notifications"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/20 border border-amber-400/30 px-3 py-1.5 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-400/30"
                        >
                          <span>Respond</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleConnect(student.id)}
                          disabled={actionLoading[student.id]}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-50"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>{actionLoading[student.id] ? "Connecting..." : "Connect"}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
