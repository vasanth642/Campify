import { redirect } from "next/navigation";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { colleges, postUpvotes, posts, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import FeedView from "./FeedView";
import { PostItem } from "@/components/feed/PostCard";

export default async function FeedPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/feed");
  }

  const [userProfile] = await db
    .select({
      id: users.id,
      collegeId: users.collegeId,
      collegeName: colleges.name,
    })
    .from(users)
    .leftJoin(colleges, eq(users.collegeId, colleges.id))
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!userProfile?.collegeId) {
    redirect("/select-college");
  }

  const rawPosts = await db
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
      collegeId: posts.collegeId,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .innerJoin(colleges, eq(posts.collegeId, colleges.id))
    .orderBy(desc(posts.createdAt));

  const userVotes = await db
    .select({ postId: postUpvotes.postId })
    .from(postUpvotes)
    .where(eq(postUpvotes.userId, session.user.id));

  const upvotedIds = userVotes.map((v) => v.postId);

  const formattedPosts: PostItem[] = rawPosts.map((p) => ({
    id: p.id,
    title: p.title,
    body: p.body,
    category: p.category,
    scope: p.scope,
    isHelpWanted: p.isHelpWanted,
    upvoteCount: p.upvoteCount,
    discussionCount: p.discussionCount,
    createdAt: p.createdAt,
    authorId: p.authorId,
    authorName: p.authorName,
    collegeName: p.collegeName,
    collegeId: p.collegeId,
  }));

  const myCollegePosts = formattedPosts.filter(
    (p) => p.scope === "my_college" && p.collegeId === userProfile.collegeId
  );

  const acrossIndiaPosts = formattedPosts
    .filter((p) => p.scope === "across_india")
    .sort((a, b) => b.upvoteCount - a.upvoteCount);

  return (
    <FeedView
      myCollegePosts={myCollegePosts}
      acrossIndiaPosts={acrossIndiaPosts}
      collegeName={userProfile.collegeName || "Your College"}
      currentUserId={session.user.id}
      userUpvotedPostIds={upvotedIds}
    />
  );
}
