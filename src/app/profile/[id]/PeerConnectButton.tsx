"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, Check, Clock } from "lucide-react";
import { sendConnectionRequest, removeConnection, ConnectionState } from "@/actions/connections";

export default function PeerConnectButton({
  peerId,
  initialState,
  isAuthenticated,
}: {
  peerId: string;
  initialState: ConnectionState;
  isAuthenticated: boolean;
}) {
  const [state, setState] = useState<ConnectionState>(initialState);
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    const res = await sendConnectionRequest(peerId);
    if (res.success && res.state) {
      setState(res.state);
    }
    setLoading(false);
  }

  async function handleDisconnect() {
    setLoading(true);
    const res = await removeConnection(peerId);
    if (res.success) {
      setState("none");
    }
    setLoading(false);
  }

  if (state === "connected") {
    return (
      <button
        onClick={handleDisconnect}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300"
        title="Click to disconnect"
      >
        <Check className="h-4 w-4" />
        <span>Connected</span>
      </button>
    );
  }

  if (state === "pending_sent") {
    return (
      <button
        onClick={handleDisconnect}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-800/60 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-red-500/30 hover:text-red-300"
        title="Click to cancel request"
      >
        <Clock className="h-4 w-4 text-zinc-400" />
        <span>Request Pending</span>
      </button>
    );
  }

  if (state === "pending_received") {
    return (
      <Link
        href="/notifications"
        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400/20 border border-amber-400/30 px-4 py-2 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-400/30"
      >
        <span>Respond to Request</span>
      </Link>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-50"
    >
      <UserPlus className="h-4 w-4" />
      <span>{loading ? "Sending..." : "Connect"}</span>
    </button>
  );
}
