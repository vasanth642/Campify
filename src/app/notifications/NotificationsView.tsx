"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  X,
  Building2,
  MapPin,
  Clock,
  UserCheck,
} from "lucide-react";
import BadgePill from "@/components/badges/BadgePill";
import { RepInfo } from "@/utils/reps";
import { linkify } from "@/utils/linkify";
import { respondToConnectionRequest } from "@/actions/connections";

export type NotificationItem = {
  id: string;
  fromUserId: string;
  username: string;
  avatarUrl: string | null;
  bio: string;
  collegeName: string;
  collegeCity: string;
  createdAt: Date;
  reps: number;
  repInfo: RepInfo;
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsView({
  initialNotifications,
}: {
  initialNotifications: NotificationItem[];
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  async function handleRespond(connectionId: string, action: "accept" | "reject") {
    setActionLoading((prev) => ({ ...prev, [connectionId]: true }));
    const res = await respondToConnectionRequest(connectionId, action);

    if (res.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== connectionId));
    }
    setActionLoading((prev) => ({ ...prev, [connectionId]: false }));
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 pt-8 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
            <Bell className="h-3.5 w-3.5 text-accent-bright" />
            <span>Campus Network Alerts</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Connection Requests
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Peers from verified campus communities who want to connect with you.
          </p>
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/20 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 text-zinc-500">
              <UserCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-white">All caught up</h3>
            <p className="mt-1 text-xs text-zinc-500">
              No pending connection requests. Explore the network to find peers across campuses.
            </p>
            <Link
              href="/search"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors"
            >
              Explore Campus Network
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 via-zinc-900/40 to-zinc-950/80 p-5 backdrop-blur-sm sm:flex-row sm:items-center gap-4 transition-all duration-200 hover:border-white/20 hover:from-zinc-900/95 hover:via-zinc-900/55 hover:to-zinc-950"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-800 text-sm font-bold text-white">
                    {item.username.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/profile/${item.fromUserId}`}
                        className="font-semibold text-white hover:text-accent-bright transition-colors"
                      >
                        {item.username}
                      </Link>
                      <BadgePill repInfo={item.repInfo} showReps reps={item.reps} />
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-zinc-500" />
                        <span>{item.collegeName}</span>
                      </span>
                      {item.collegeCity && (
                        <span className="flex items-center gap-1 text-zinc-500">
                          <MapPin className="h-3 w-3 text-zinc-600" />
                          <span>{item.collegeCity}</span>
                        </span>
                      )}
                    </div>

                    {item.bio && (
                      <div className="mt-2 text-xs text-zinc-400 line-clamp-2">
                        {linkify(item.bio)}
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-1 text-[11px] text-zinc-500">
                      <Clock className="h-3 w-3" />
                      <span>Requested {formatTimeAgo(item.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleRespond(item.id, "reject")}
                    disabled={actionLoading[item.id]}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-zinc-400 hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Decline</span>
                  </button>

                  <button
                    onClick={() => handleRespond(item.id, "accept")}
                    disabled={actionLoading[item.id]}
                    className="inline-flex items-center gap-1 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Accept</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
