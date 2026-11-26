import { eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { colleges, connections, discussions, posts, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { calculateRepTier, REPS_PER_UPVOTE, REPS_PER_REPLY } from "@/utils/reps";
import SearchView, { StudentSearchResult } from "./SearchView";

export const metadata = {
  title: "Campus Network - Campify",
  description: "Discover and connect with verified students across campus communities.",
};

export default async function SearchPage() {
  const session = await auth();
  const currentUserId = session?.user?.id || null;

  let currentUserCollegeId: string | null = null;
  let currentUserCollegeName: string | null = null;

  if (currentUserId) {
    const [me] = await db
      .select({
        collegeId: users.collegeId,
        collegeName: colleges.name,
      })
      .from(users)
      .leftJoin(colleges, eq(users.collegeId, colleges.id))
      .where(eq(users.id, currentUserId))
      .limit(1);

    currentUserCollegeId = me?.collegeId || null;
    currentUserCollegeName = me?.collegeName || null;
  }

  const allUsersWithCollege = await db
    .select({
      id: users.id,
      username: users.username,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
      collegeId: users.collegeId,
      collegeName: colleges.name,
      collegeCity: colleges.city,
    })
    .from(users)
    .leftJoin(colleges, eq(users.collegeId, colleges.id));

  const allConnections = currentUserId
    ? await db
        .select()
        .from(connections)
        .where(
          or(
            eq(connections.fromUserId, currentUserId),
            eq(connections.toUserId, currentUserId)
          )
        )
    : [];

  const userStats = await db
    .select({
      authorId: posts.authorId,
      totalUpvotes: sql<number>`coalesce(sum(${posts.upvoteCount}), 0)`,
      postCount: sql<number>`count(${posts.id})`,
    })
    .from(posts)
    .groupBy(posts.authorId);

  const replyStats = await db
    .select({
      authorId: discussions.authorId,
      replyCount: sql<number>`count(${discussions.id})`,
    })
    .from(discussions)
    .groupBy(discussions.authorId);

  const statsMap = new Map<string, { totalUpvotes: number; postCount: number; replyCount: number }>();

  for (const stat of userStats) {
    statsMap.set(stat.authorId, {
      totalUpvotes: Number(stat.totalUpvotes || 0),
      postCount: Number(stat.postCount || 0),
      replyCount: 0,
    });
  }

  for (const reply of replyStats) {
    const existing = statsMap.get(reply.authorId) || { totalUpvotes: 0, postCount: 0, replyCount: 0 };
    existing.replyCount = Number(reply.replyCount || 0);
    statsMap.set(reply.authorId, existing);
  }

  const students: StudentSearchResult[] = allUsersWithCollege.map((u) => {
    const stat = statsMap.get(u.id) || { totalUpvotes: 0, postCount: 0, replyCount: 0 };
    const reps =
      stat.totalUpvotes * REPS_PER_UPVOTE +
      stat.replyCount * REPS_PER_REPLY +
      stat.postCount * 5;

    let connectionState: "none" | "pending_sent" | "pending_received" | "connected" = "none";
    let connectionId: string | undefined = undefined;

    if (currentUserId && u.id !== currentUserId) {
      const match = allConnections.find(
        (c) =>
          (c.fromUserId === currentUserId && c.toUserId === u.id) ||
          (c.fromUserId === u.id && c.toUserId === currentUserId)
      );

      if (match) {
        connectionId = match.id;
        if (match.status === "accepted") {
          connectionState = "connected";
        } else if (match.fromUserId === currentUserId) {
          connectionState = "pending_sent";
        } else {
          connectionState = "pending_received";
        }
      }
    }

    return {
      id: u.id,
      username: u.username,
      bio: u.bio || "",
      avatarUrl: u.avatarUrl,
      collegeId: u.collegeId,
      collegeName: u.collegeName || "Unassigned Campus",
      collegeCity: u.collegeCity || "",
      reps,
      repInfo: calculateRepTier(reps),
      isSelf: u.id === currentUserId,
      connectionState,
      connectionId,
    };
  });

  return (
    <SearchView
      initialStudents={students}
      currentUserId={currentUserId}
      currentUserCollegeId={currentUserCollegeId}
      currentUserCollegeName={currentUserCollegeName}
    />
  );
}
