"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronUp,
  MessageCircle,
  Share2,
  ShieldCheck,
  Clock,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toggleUpvote, deletePost } from "@/actions/posts";
import { linkify } from "@/utils/linkify";

export type PostItem = {
  id: string;
  title: string;
  body: string;
  category: string;
  scope: string;
  isHelpWanted: boolean;
  upvoteCount: number;
  discussionCount: number;
  createdAt: Date;
  authorId: string;
  authorName: string;
  collegeName: string;
  collegeId?: string;
};

const categoryTheme: Record<string, { color: string; bg: string }> = {
  academics: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  hostel: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  facilities: { color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  events: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  career: { color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  help: { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
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

export default function PostCard({
  post,
  initialUpvoted = false,
  currentUserId,
  isDetailView = false,
}: {
  post: PostItem;
  initialUpvoted?: boolean;
  currentUserId?: string;
  isDetailView?: boolean;
}) {
  const router = useRouter();
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [upvoteCount, setUpvoteCount] = useState(post.upvoteCount);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const theme = categoryTheme[post.category.toLowerCase()] || {
    color: "text-zinc-400",
    bg: "bg-zinc-800/60 border-zinc-700/40",
  };

  const isOwner = currentUserId === post.authorId;

  async function handleUpvote(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const previousStatus = upvoted;
    const previousCount = upvoteCount;

    setUpvoted(!previousStatus);
    setUpvoteCount(previousStatus ? previousCount - 1 : previousCount + 1);

    const result = await toggleUpvote(post.id);
    if (!result.success) {
      setUpvoted(previousStatus);
      setUpvoteCount(previousCount);
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    const result = await deletePost(post.id);
    if (result.success && isDetailView) {
      router.push("/feed");
    }
    setIsDeleting(false);
  }

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article className="group rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 via-zinc-900/40 to-zinc-950/80 p-5 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:from-zinc-900/95 hover:via-zinc-900/55 hover:to-zinc-950 hover:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300 border border-white/10">
            {post.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-white">
                {post.authorName}
              </span>
              <div className="relative group/college inline-flex items-center">
                <span
                  title={post.collegeName}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-zinc-300 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10"
                >
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span className="max-w-[130px] truncate sm:max-w-[190px]">{post.collegeName}</span>
                </span>

                <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-1.5 hidden w-max max-w-xs rounded-xl border border-white/15 bg-zinc-950 p-2.5 text-xs text-zinc-200 shadow-2xl backdrop-blur-md group-hover/college:block">
                  <p className="font-semibold text-white">{post.collegeName}</p>
                  <p className="mt-0.5 text-[10px] text-emerald-400">Verified Campus Community</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {post.isHelpWanted && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
              <Sparkles className="h-2.5 w-2.5" />
              Help Wanted
            </span>
          )}

          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
              title="Delete post"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3.5">
        {isDetailView ? (
          <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            {post.title}
          </h1>
        ) : (
          <Link href={`/post/${post.id}`}>
            <h2 className="text-base font-semibold tracking-tight text-white transition-colors hover:text-accent-bright sm:text-lg">
              {post.title}
            </h2>
          </Link>
        )}

        <p
          className={`mt-2 text-sm leading-relaxed text-zinc-300 ${
            isDetailView ? "whitespace-pre-wrap" : "line-clamp-3"
          }`}
        >
          {linkify(post.body)}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3.5">
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${theme.bg} ${theme.color}`}
          >
            {post.category}
          </span>
          <span className="text-[11px] text-zinc-500 font-medium">
            {post.scope === "my_college" ? "Campus Only" : "All India"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUpvote}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
              upvoted
                ? "border-accent bg-accent/20 text-accent-bright"
                : "border-white/10 bg-zinc-950/60 text-zinc-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <ChevronUp className={`h-3.5 w-3.5 ${upvoted ? "stroke-[2.5]" : ""}`} />
            <span>{upvoteCount}</span>
          </button>

          {isDetailView ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 py-1 text-xs font-medium text-zinc-400">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{post.discussionCount}</span>
            </span>
          ) : (
            <Link
              href={`/post/${post.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{post.discussionCount}</span>
            </Link>
          )}

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-950/60 p-1.5 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
            title="Share link"
          >
            <Share2 className="h-3.5 w-3.5" />
            {copied && <span className="text-[10px] text-emerald-400">Copied</span>}
          </button>
        </div>
      </div>
    </article>
  );
}
