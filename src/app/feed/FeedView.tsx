"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Building2, Globe, MessageSquarePlus } from "lucide-react";
import PostCard, { PostItem } from "@/components/feed/PostCard";
import { CATEGORIES } from "@/constants/categories";

export default function FeedView({
  myCollegePosts,
  acrossIndiaPosts,
  collegeName,
  currentUserId,
  userUpvotedPostIds,
}: {
  myCollegePosts: PostItem[];
  acrossIndiaPosts: PostItem[];
  collegeName: string;
  currentUserId: string;
  userUpvotedPostIds: string[];
}) {
  const [activeTab, setActiveTab] = useState<"college" | "nationwide">("college");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const upvotedSet = new Set(userUpvotedPostIds);
  const activePosts = activeTab === "college" ? myCollegePosts : acrossIndiaPosts;

  const filteredPosts = activePosts.filter((post) => {
    if (selectedCategory !== "all") {
      if (selectedCategory === "help") {
        if (!post.isHelpWanted) return false;
      } else if (post.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchBody = post.body.toLowerCase().includes(q);
      const matchAuthor = post.authorName.toLowerCase().includes(q);
      if (!matchTitle && !matchBody && !matchAuthor) return false;
    }

    return true;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Campus Discussions
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Real time exchange across verified campus communities
          </p>
        </div>

        <Link
          href="/post/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-colors hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Create Post
        </Link>
      </div>

      {/* Primary Scope Tabs */}
      <div className="mt-6 flex items-center gap-2 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setActiveTab("college")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "college"
              ? "bg-white text-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              : "border border-white/10 bg-zinc-950/40 text-zinc-400 hover:border-white/20 hover:text-white"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>My College ({collegeName})</span>
          <span className="rounded-full bg-zinc-800/80 px-1.5 py-0.2 text-[10px] text-zinc-300">
            {myCollegePosts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("nationwide")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "nationwide"
              ? "bg-white text-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              : "border border-white/10 bg-zinc-950/40 text-zinc-400 hover:border-white/20 hover:text-white"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Across India</span>
          <span className="rounded-full bg-zinc-800/80 px-1.5 py-0.2 text-[10px] text-zinc-300">
            {acrossIndiaPosts.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions or keywords..."
            className="w-full rounded-xl border border-white/10 bg-zinc-900/60 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Categories scrollable pill list */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all ${
                selectedCategory === cat.id
                  ? "border-accent bg-accent/20 text-accent-bright"
                  : "border-white/[0.06] bg-zinc-950/50 text-zinc-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="mt-6 space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-12 text-center">
            <MessageSquarePlus className="mx-auto h-8 w-8 text-zinc-600" />
            <h3 className="mt-3 text-sm font-semibold text-white">
              No discussions found
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {searchQuery
                ? "Try clearing your search query or selecting another category"
                : "Be the first student to publish a post in this feed!"}
            </p>
            <Link
              href="/post/new"
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Publish Post
            </Link>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              initialUpvoted={upvotedSet.has(post.id)}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  );
}
