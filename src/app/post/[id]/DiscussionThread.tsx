"use client";

import { useState } from "react";
import { Send, Clock, ShieldCheck } from "lucide-react";
import { addDiscussion } from "@/actions/posts";

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
}: {
  postId: string;
  initialDiscussions: DiscussionItem[];
  currentUserId: string;
}) {
  const [discussionsList, setDiscussionsList] = useState<DiscussionItem[]>(initialDiscussions);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <h3 className="text-base font-semibold text-white">
          Replies ({discussionsList.length})
        </h3>
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
            placeholder="Write a constructive reply to help your peer..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-2.5">
            <span className="text-[11px] text-zinc-500">
              Markdown formatting supported
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
          discussionsList.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-900/60"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-zinc-300 border border-white/10">
                    {item.authorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-white">
                    {item.authorName}
                  </span>
                  {item.authorId === currentUserId && (
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

              <p className="mt-2 text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap">
                {item.body}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
