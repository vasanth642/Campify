import { redirect } from "next/navigation";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { colleges, connections, discussions, posts, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { calculateRepTier, REPS_PER_UPVOTE, REPS_PER_REPLY } from "@/utils/reps";
import NotificationsView, { NotificationItem } from "./NotificationsView";

export const metadata = {
  title: "Notifications - Campify",
  description: "Manage incoming connection requests and student network alerts.",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const currentUserId = session.user.id;

  const rawRequests = await db
    .select({
      id: connections.id,
      fromUserId: connections.fromUserId,
      createdAt: connections.createdAt,
      username: users.username,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      collegeId: users.collegeId,
      collegeName: colleges.name,
      collegeCity: colleges.city,
    })
    .from(connections)
    .innerJoin(users, eq(connections.fromUserId, users.id))
    .leftJoin(colleges, eq(users.collegeId, colleges.id))
    .where(
      and(
        eq(connections.toUserId, currentUserId),
        eq(connections.status, "pending")
      )
    )
    .orderBy(desc(connections.createdAt));

  const items: NotificationItem[] = await Promise.all(
    rawRequests.map(async (req) => {
      const [upvotes] = await db
        .select({ sum: sql<number>`coalesce(sum(${posts.upvoteCount}), 0)` })
        .from(posts)
        .where(eq(posts.authorId, req.fromUserId));

      const [replies] = await db
        .select({ count: sql<number>`count(${discussions.id})` })
        .from(discussions)
        .where(eq(discussions.authorId, req.fromUserId));

      const totalUpvotes = Number(upvotes?.sum || 0);
      const replyCount = Number(replies?.count || 0);

      const reps = totalUpvotes * REPS_PER_UPVOTE + replyCount * REPS_PER_REPLY;
      const repInfo = calculateRepTier(reps);

      return {
        id: req.id,
        fromUserId: req.fromUserId,
        username: req.username,
        avatarUrl: req.avatarUrl,
        bio: req.bio || "",
        collegeName: req.collegeName || "Unassigned Campus",
        collegeCity: req.collegeCity || "",
        createdAt: req.createdAt,
        reps,
        repInfo,
      };
    })
  );

  return <NotificationsView initialNotifications={items} />;
}
