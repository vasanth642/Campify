"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Clock, ShieldCheck, Check, Sparkles, ThumbsUp } from "lucide-react";
import { addDiscussion } from "@/actions/posts";
import { linkify } from "@/utils/linkify";

type DiscussionItem = {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
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

export default function DiscussionThread({
  postId,
  initialDiscussions,
  currentUserId,
  isHelpWanted = false,
}: {
  postId: string;
  initialDiscussions: DiscussionItem[];
  currentUserId: string;
  isHelpWanted?: boolean;
}) {
  const [discussionsList, setDiscussionsList] = useState<DiscussionItem[]>(initialDiscussions);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [helpfulSet, setHelpfulSet] = useState<Record<string, boolean>>({});

  async function handleAddReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmitting(true);
    setError(null);

    const result = await addDiscussion(postId, replyText);

    if (!result.success) {
      setError(result.message || "Failed to post reply");
      setSubmitting(false);
      return;
    }

    const optimisticItem: DiscussionItem = {
      id: crypto.randomUUID(),
      body: replyText.trim(),
      authorId: currentUserId,
      authorName: "You",
      createdAt: new Date(),
    };

    setDiscussionsList((prev) => [...prev, optimisticItem]);
    setReplyText("");
    setSubmitting(false);
  }

  function toggleHelpful(discussionId: string) {
    setHelpfulSet((prev) => ({
      ...prev,
      [discussionId]: !prev[discussionId],
    }));
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <h3 className="text-base font-semibold text-white">
          Replies ({discussionsList.length})
        </h3>
        {isHelpWanted && (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-medium">
            <Sparkles className="h-3 w-3" />
            <span>Help Wanted Discussion</span>
          </span>
        )}
      </div>

      {/* Reply input */}
      <form onSubmit={handleAddReply} className="mt-4">
        {error && (
          <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3 shadow-lg focus-within:border-accent">
          <textarea
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a constructive reply to help your peer (links will be auto-clickable)..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-2.5">
            <span className="text-[11px] text-zinc-500">
              Links to resources and code repos will be clickable
            </span>
            <button
              type="submit"
              disabled={submitting || !replyText.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-40"
            >
              <Send className="h-3 w-3" />
              <span>{submitting ? "Posting..." : "Reply"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Discussion comments list */}
      <div className="mt-6 space-y-3">
        {discussionsList.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/30 p-8 text-center text-xs text-zinc-500">
            No replies yet. Be the first to start the conversation!
          </div>
        ) : (
          discussionsList.map((item) => {
            const isHelpfulMarked = helpfulSet[item.id];
            const isAuthor = item.authorId === currentUserId;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-900/60"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      href={isAuthor ? "/profile" : `/profile/${item.authorId}`}
                      className="flex items-center gap-2 group transition-opacity hover:opacity-85"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-zinc-300 border border-white/10">
                        {item.authorName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-white group-hover:text-accent-bright transition-colors">
                        {item.authorName}
                      </span>
                    </Link>
                    {isAuthor && (
                      <span className="rounded bg-accent/20 px-1.5 py-0.2 text-[9px] font-medium text-accent-bright">
                        You
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(item.createdAt)}
                  </span>
                </div>

                <div className="mt-2 text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap">
                  {linkify(item.body)}
                </div>

                {isHelpWanted && !isAuthor && (
                  <div className="mt-3 flex items-center justify-end border-t border-white/[0.04] pt-2">
                    <button
                      onClick={() => toggleHelpful(item.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                        isHelpfulMarked
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                      }`}
                    >
                      {isHelpfulMarked ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Marked Helpful (+25 Reps)</span>
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="h-3 w-3" />
                          <span>Helpful Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
