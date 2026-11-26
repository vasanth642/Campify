"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Calendar,
  MessageSquare,
  ThumbsUp,
  FileText,
  Users,
  Edit3,
  Check,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import BadgePill from "@/components/badges/BadgePill";
import { RepInfo } from "@/utils/reps";
import { linkify } from "@/utils/linkify";
import { updateProfileBio } from "@/actions/connections";

export type UserPostSummary = {
  id: string;
  title: string;
  category: string;
  scope: string;
  upvoteCount: number;
  discussionCount: number;
  isHelpWanted: boolean;
  createdAt: Date;
};

export type UserProfileData = {
  id: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string | null;
  collegeName: string;
  collegeCity: string;
  collegeState: string;
  reps: number;
  repInfo: RepInfo;
  stats: {
    totalUpvotes: number;
    postCount: number;
    replyCount: number;
    connectionsCount: number;
  };
  posts: UserPostSummary[];
};

export default function ProfileView({ profile }: { profile: UserProfileData }) {
  const [bio, setBio] = useState(profile.bio);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [bioSavedMessage, setBioSavedMessage] = useState<string | null>(null);

  const nextTierNeeded = profile.repInfo.nextTierReps
    ? profile.repInfo.nextTierReps - profile.reps
    : 0;

  const progressPercent = profile.repInfo.nextTierReps
    ? Math.min(
        100,
        Math.max(
          5,
          Math.round(
            ((profile.reps - profile.repInfo.minReps) /
              (profile.repInfo.nextTierReps - profile.repInfo.minReps)) *
              100
          )
        )
      )
    : 100;

  async function handleSaveBio(e: React.FormEvent) {
    e.preventDefault();
    setSavingBio(true);
    setBioSavedMessage(null);

    const res = await updateProfileBio(bio);
    if (res.success) {
      setIsEditingBio(false);
      setBioSavedMessage("Bio updated successfully");
      setTimeout(() => setBioSavedMessage(null), 3000);
    }
    setSavingBio(false);
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 pt-8 text-zinc-100">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header Profile Card */}
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
                {profile.username.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                    {profile.username}
                  </h1>
                  <BadgePill repInfo={profile.repInfo} showReps reps={profile.reps} />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-1.5 text-zinc-300">
                    <Building2 className="h-3.5 w-3.5 text-accent-bright" />
                    <span>{profile.collegeName}</span>
                  </span>

                  {profile.collegeCity && (
                    <span className="inline-flex items-center gap-1 text-zinc-500">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{profile.collegeCity}, {profile.collegeState}</span>
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-zinc-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>{profile.stats.connectionsCount} Connections</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Explore Network</span>
              </Link>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-6 border-t border-white/[0.06] pt-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-wider uppercase text-zinc-400">
                About & Links
              </h2>
              {!isEditingBio && (
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="inline-flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-white"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Edit Bio</span>
                </button>
              )}
            </div>

            {bioSavedMessage && (
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                <Check className="h-3 w-3" />
                <span>{bioSavedMessage}</span>
              </div>
            )}

            {isEditingBio ? (
              <form onSubmit={handleSaveBio} className="mt-3">
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={300}
                  placeholder="Introduce yourself, your branch, GitHub, LinkedIn, or portfolio links..."
                  className="w-full rounded-xl border border-white/15 bg-zinc-950/80 p-3 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">
                    {bio.length}/300 chars. URLs automatically become clickable links.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBio(profile.bio);
                        setIsEditingBio(false);
                      }}
                      className="rounded-lg px-3 py-1 text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingBio}
                      className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
                    >
                      {savingBio ? "Saving..." : "Save Bio"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mt-2 text-xs leading-relaxed text-zinc-300">
                {bio ? (
                  <p className="whitespace-pre-wrap">{linkify(bio)}</p>
                ) : (
                  <p className="italic text-zinc-600">
                    No bio added yet. Click &quot;Edit Bio&quot; to share your interests, GitHub, or LinkedIn profile.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rep & Reputation Breakdown */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/70 via-zinc-900/35 to-zinc-950/70 p-5 md:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Campus Rep System
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{profile.reps}</span>
                  <span className="text-xs text-zinc-400">Total Reps Earned</span>
                </div>
              </div>
              <BadgePill repInfo={profile.repInfo} />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                <span>Tier Progress</span>
                {profile.repInfo.nextTierReps ? (
                  <span>{nextTierNeeded} reps needed for next badge</span>
                ) : (
                  <span className="text-amber-300 font-semibold">Max Tier Reached</span>
                )}
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-4 text-center">
              <div>
                <span className="text-lg font-bold text-white">{profile.stats.totalUpvotes}</span>
                <p className="text-[11px] text-zinc-500">Upvotes Received (+10 each)</p>
              </div>
              <div>
                <span className="text-lg font-bold text-white">{profile.stats.replyCount}</span>
                <p className="text-[11px] text-zinc-500">Helpful Replies (+5 each)</p>
              </div>
              <div>
                <span className="text-lg font-bold text-white">{profile.stats.postCount}</span>
                <p className="text-[11px] text-zinc-500">Discussions Started (+5 each)</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/70 via-zinc-900/35 to-zinc-950/70 p-5">
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Badge Hierarchy
              </span>
              <ul className="mt-3 space-y-2 text-xs text-zinc-300">
                <li className="flex items-center justify-between">
                  <span className="text-zinc-400">Amateur</span>
                  <span className="font-mono text-zinc-500">0+ Reps</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-blue-300">Contributor</span>
                  <span className="font-mono text-zinc-500">100+ Reps</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-violet-300">Expert</span>
                  <span className="font-mono text-zinc-500">500+ Reps</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-amber-300 font-semibold">Legend</span>
                  <span className="font-mono text-zinc-500">1,500+ Reps</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-zinc-500">
              Contribute verified solutions and answer help requests on your campus to advance tiers.
            </div>
          </div>
        </div>

        {/* User's Posts Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              Your Published Posts ({profile.posts.length})
            </h2>
            <Link
              href="/post/new"
              className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:text-accent-bright transition-colors"
            >
              <span>Create New Post</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {profile.posts.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/20 p-8 text-center text-xs text-zinc-500">
              You haven&apos;t posted anything yet. Share questions, hostel notices, or academic queries with your campus.
            </div>
          ) : (
            <div className="space-y-3">
              {profile.posts.map((post) => (
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
