import { redirect } from "next/navigation";
import { eq, desc, sql, and, or } from "drizzle-orm";
import { db } from "@/db";
import { colleges, connections, discussions, posts, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { calculateRepTier, REPS_PER_UPVOTE, REPS_PER_REPLY } from "@/utils/reps";
import ProfileView, { UserProfileData } from "./ProfileView";

export const metadata = {
  title: "Your Profile - Campify",
  description: "Manage your campus identity, reputation score, and published posts.",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [userData] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
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
    .where(eq(users.id, userId))
    .limit(1);

  if (!userData) {
    redirect("/login");
  }

  const userPosts = await db
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
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.createdAt));

  const [repliesResult] = await db
    .select({
      count: sql<number>`count(${discussions.id})`,
    })
    .from(discussions)
    .where(eq(discussions.authorId, userId));

  const [connectionsResult] = await db
    .select({
      count: sql<number>`count(${connections.id})`,
    })
    .from(connections)
    .where(
      and(
        eq(connections.status, "accepted"),
        or(eq(connections.fromUserId, userId), eq(connections.toUserId, userId))
      )
    );

  const totalUpvotes = userPosts.reduce((acc, p) => acc + (p.upvoteCount || 0), 0);
  const postCount = userPosts.length;
  const replyCount = Number(repliesResult?.count || 0);
  const connectionsCount = Number(connectionsResult?.count || 0);

  const totalReps =
    totalUpvotes * REPS_PER_UPVOTE +
    replyCount * REPS_PER_REPLY +
    postCount * 5;

  const repInfo = calculateRepTier(totalReps);

  const profile: UserProfileData = {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    bio: userData.bio || "",
    avatarUrl: userData.avatarUrl,
    collegeName: userData.collegeName || "No Campus Selected",
    collegeCity: userData.collegeCity || "",
    collegeState: userData.collegeState || "",
    reps: totalReps,
    repInfo,
    stats: {
      totalUpvotes,
      postCount,
      replyCount,
      connectionsCount,
    },
    posts: userPosts,
  };

  return <ProfileView profile={profile} />;
}
