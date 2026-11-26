import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { colleges, discussions, postUpvotes, posts, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import PostCard, { PostItem } from "@/components/feed/PostCard";
import DiscussionThread from "./DiscussionThread";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: postId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/post/${postId}`);
  }

  const [postData] = await db
    .select({
      id: posts.id,
      title: posts.title,
      body: posts.body,
      category: posts.category,
      scope: posts.scope,
      isHelpWanted: posts.isHelpWanted,
      upvoteCount: posts.upvoteCount,
      discussionCount: posts.discussionCount,
      createdAt: posts.createdAt,
      authorId: posts.authorId,
      authorName: users.username,
      collegeName: colleges.name,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .innerJoin(colleges, eq(posts.collegeId, colleges.id))
    .where(eq(posts.id, postId))
    .limit(1);

  if (!postData) {
    notFound();
  }

  const [upvoteRecord] = await db
    .select({ id: postUpvotes.id })
    .from(postUpvotes)
    .where(eq(postUpvotes.postId, postId))
    .limit(1);

  const discussionsList = await db
    .select({
      id: discussions.id,
      body: discussions.body,
      authorId: discussions.authorId,
      authorName: users.username,
      createdAt: discussions.createdAt,
    })
    .from(discussions)
    .innerJoin(users, eq(discussions.authorId, users.id))
    .where(eq(discussions.postId, postId))
    .orderBy(asc(discussions.createdAt));

  const postItem: PostItem = {
    id: postData.id,
    title: postData.title,
    body: postData.body,
    category: postData.category,
    scope: postData.scope,
    isHelpWanted: postData.isHelpWanted,
    upvoteCount: postData.upvoteCount,
    discussionCount: postData.discussionCount,
    createdAt: postData.createdAt,
    authorId: postData.authorId,
    authorName: postData.authorName,
    collegeName: postData.collegeName,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/feed"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to discussions
      </Link>

      <PostCard
        post={postItem}
        initialUpvoted={!!upvoteRecord}
        currentUserId={session.user.id}
        isDetailView={true}
      />

      <DiscussionThread
        postId={postId}
        initialDiscussions={discussionsList}
        currentUserId={session.user.id}
        isHelpWanted={postData.isHelpWanted}
      />
    </div>
  );
}
