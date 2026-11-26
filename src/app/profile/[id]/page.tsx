import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { eq, desc, sql, and, or } from "drizzle-orm";
import {
  Building2,
  MapPin,
  Users,
  ThumbsUp,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { db } from "@/db";
import { colleges, connections, discussions, posts, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { calculateRepTier, REPS_PER_UPVOTE, REPS_PER_REPLY } from "@/utils/reps";
import BadgePill from "@/components/badges/BadgePill";
import { linkify } from "@/utils/linkify";
import PeerConnectButton from "./PeerConnectButton";

export default async function PeerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: peerId } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id || null;

  if (currentUserId && currentUserId === peerId) {
    redirect("/profile");
  }

  const [peer] = await db
    .select({
      id: users.id,
      username: users.username,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
      collegeId: users.collegeId,
      collegeName: colleges.name,
      collegeCity: colleges.city,
      collegeState: colleges.state,
    })
    .from(users)
    .leftJoin(colleges, eq(users.collegeId, colleges.id))
    .where(eq(users.id, peerId))
    .limit(1);

  if (!peer) {
    notFound();
  }

  const peerPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      category: posts.category,
      scope: posts.scope,
      upvoteCount: posts.upvoteCount,
      discussionCount: posts.discussionCount,
      isHelpWanted: posts.isHelpWanted,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(eq(posts.authorId, peerId))
    .orderBy(desc(posts.createdAt));

  const [repliesResult] = await db
    .select({
      count: sql<number>`count(${discussions.id})`,
    })
    .from(discussions)
    .where(eq(discussions.authorId, peerId));

  const [connectionsResult] = await db
    .select({
      count: sql<number>`count(${connections.id})`,
    })
    .from(connections)
    .where(
      and(
        eq(connections.status, "accepted"),
        or(eq(connections.fromUserId, peerId), eq(connections.toUserId, peerId))
      )
    );

  const totalUpvotes = peerPosts.reduce((acc, p) => acc + (p.upvoteCount || 0), 0);
  const postCount = peerPosts.length;
  const replyCount = Number(repliesResult?.count || 0);
  const connectionsCount = Number(connectionsResult?.count || 0);

  const totalReps =
    totalUpvotes * REPS_PER_UPVOTE +
    replyCount * REPS_PER_REPLY +
    postCount * 5;

  const repInfo = calculateRepTier(totalReps);

  let connectionState: "none" | "pending_sent" | "pending_received" | "connected" = "none";
  let connectionId: string | undefined = undefined;

  if (currentUserId) {
    const [existing] = await db
      .select()
      .from(connections)
      .where(
        or(
          and(eq(connections.fromUserId, currentUserId), eq(connections.toUserId, peerId)),
          and(eq(connections.fromUserId, peerId), eq(connections.toUserId, currentUserId))
        )
      )
      .limit(1);

    if (existing) {
      connectionId = existing.id;
      if (existing.status === "accepted") {
        connectionState = "connected";
      } else if (existing.fromUserId === currentUserId) {
        connectionState = "pending_sent";
      } else {
        connectionState = "pending_received";
      }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 pt-8 text-zinc-100">
      <div className="mx-auto max-w-4xl px-6">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Campus Network</span>
        </Link>

        {/* Profile Header */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/85 via-zinc-900/45 to-zinc-950/90 p-6 md:p-8 shadow-2xl backdrop-blur-md">
          {/* Radial Top Spotlight Glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(120, 119, 198, 0.22), transparent 70%)",
            }}
          />
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-zinc-800 to-zinc-900 text-3xl font-black text-white shadow-xl">
                {peer.username.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                    {peer.username}
                  </h1>
                  <BadgePill repInfo={repInfo} showReps reps={totalReps} />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-1.5 text-zinc-300">
                    <Building2 className="h-3.5 w-3.5 text-accent-bright" />
                    <span>{peer.collegeName || "Unassigned Campus"}</span>
                  </span>

                  {peer.collegeCity && (
                    <span className="inline-flex items-center gap-1 text-zinc-500">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{peer.collegeCity}, {peer.collegeState}</span>
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-zinc-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>{connectionsCount} Connections</span>
                  </span>
                </div>
              </div>
            </div>

            <PeerConnectButton
              peerId={peer.id}
              initialState={connectionState}
              isAuthenticated={!!currentUserId}
            />
          </div>

          {/* Bio */}
          <div className="mt-6 border-t border-white/[0.06] pt-5">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-zinc-400">
              About & Links
            </h2>
            <div className="mt-2 text-xs leading-relaxed text-zinc-300">
              {peer.bio ? (
                <p className="whitespace-pre-wrap">{linkify(peer.bio)}</p>
              ) : (
                <p className="italic text-zinc-600">No bio provided by this student yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/70 via-zinc-900/35 to-zinc-950/70 p-4 text-center">
            <span className="text-2xl font-black text-white">{totalReps}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Total Reps</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/70 via-zinc-900/35 to-zinc-950/70 p-4 text-center">
            <span className="text-2xl font-black text-white">{totalUpvotes}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Upvotes Received</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/70 via-zinc-900/35 to-zinc-950/70 p-4 text-center">
            <span className="text-2xl font-black text-white">{replyCount}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Helpful Replies</p>
          </div>
        </div>

        {/* Public Posts */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-white mb-4">
            Posts by {peer.username} ({peerPosts.length})
          </h2>

          {peerPosts.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/20 p-8 text-center text-xs text-zinc-500">
              {peer.username} hasn&apos;t published any discussions yet.
            </div>
          ) : (
            <div className="space-y-3">
              {peerPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="group flex flex-col justify-between rounded-xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/70 via-zinc-900/35 to-zinc-950/70 p-4 transition-all hover:border-white/20 hover:from-zinc-900/85 hover:to-zinc-950 sm:flex-row sm:items-center"
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                        {post.category}
                      </span>
                      {post.isHelpWanted && (
                        <span className="rounded bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                          Help Wanted
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-white group-hover:text-accent-bright transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500 sm:mt-0">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {post.upvoteCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {post.discussionCount}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
