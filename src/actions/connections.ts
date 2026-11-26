"use server";

import { and, desc, eq, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { colleges, connections, discussions, posts, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { calculateRepTier, REPS_PER_UPVOTE, REPS_PER_REPLY } from "@/utils/reps";

export type ConnectionState = "none" | "pending_sent" | "pending_received" | "connected";

export type ConnectionActionResponse = {
  success: boolean;
  message?: string;
  state?: ConnectionState;
};

export async function sendConnectionRequest(toUserId: string): Promise<ConnectionActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Authentication required" };
  }

  const currentUserId = session.user.id;
  if (currentUserId === toUserId) {
    return { success: false, message: "Cannot connect with yourself" };
  }

  const existing = await db
    .select()
    .from(connections)
    .where(
      or(
        and(eq(connections.fromUserId, currentUserId), eq(connections.toUserId, toUserId)),
        and(eq(connections.fromUserId, toUserId), eq(connections.toUserId, currentUserId))
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const conn = existing[0];
    if (conn.status === "accepted") {
      return { success: true, state: "connected", message: "Already connected" };
    }
    if (conn.fromUserId === currentUserId) {
      return { success: true, state: "pending_sent", message: "Request already sent" };
    }
    return { success: true, state: "pending_received", message: "Pending their request" };
  }

  await db.insert(connections).values({
    fromUserId: currentUserId,
    toUserId,
    status: "pending",
  });

  revalidatePath("/search");
  revalidatePath("/notifications");
  return { success: true, state: "pending_sent", message: "Connection request sent" };
}

export async function respondToConnectionRequest(
  connectionId: string,
  action: "accept" | "reject"
): Promise<ConnectionActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Authentication required" };
  }

  const [conn] = await db
    .select()
    .from(connections)
    .where(eq(connections.id, connectionId))
    .limit(1);

  if (!conn || conn.toUserId !== session.user.id) {
    return { success: false, message: "Unauthorized or request not found" };
  }

  if (action === "accept") {
    await db
      .update(connections)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(connections.id, connectionId));

    revalidatePath("/notifications");
    revalidatePath("/search");
    return { success: true, state: "connected", message: "Request accepted" };
  } else {
    await db.delete(connections).where(eq(connections.id, connectionId));

    revalidatePath("/notifications");
    revalidatePath("/search");
    return { success: true, state: "none", message: "Request declined" };
  }
}

export async function removeConnection(targetUserId: string): Promise<ConnectionActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Authentication required" };
  }

  const currentUserId = session.user.id;

  await db
    .delete(connections)
    .where(
      or(
        and(eq(connections.fromUserId, currentUserId), eq(connections.toUserId, targetUserId)),
        and(eq(connections.fromUserId, targetUserId), eq(connections.toUserId, currentUserId))
      )
    );

  revalidatePath("/search");
  revalidatePath("/profile");
  return { success: true, state: "none", message: "Connection removed" };
}

const bioSchema = z.string().max(300, "Bio cannot exceed 300 characters");

export async function updateProfileBio(rawBio: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Authentication required" };
  }

  const parsed = bioSchema.safeParse(rawBio);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Invalid bio" };
  }

  await db
    .update(users)
    .set({ bio: parsed.data.trim(), updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  revalidatePath("/profile");
  revalidatePath("/search");
  return { success: true, message: "Bio updated successfully" };
}

export async function getUserRepScore(userId: string) {
  const [upvotesResult] = await db
    .select({
      totalUpvotes: sql<number>`coalesce(sum(${posts.upvoteCount}), 0)`,
      postCount: sql<number>`count(${posts.id})`,
    })
    .from(posts)
    .where(eq(posts.authorId, userId));

  const [discussionsResult] = await db
    .select({
      discussionCount: sql<number>`count(${discussions.id})`,
    })
    .from(discussions)
    .where(eq(discussions.authorId, userId));

  const totalUpvotes = Number(upvotesResult?.totalUpvotes || 0);
  const postCount = Number(upvotesResult?.postCount || 0);
  const discussionCount = Number(discussionsResult?.discussionCount || 0);

  const totalReps =
    totalUpvotes * REPS_PER_UPVOTE +
    discussionCount * REPS_PER_REPLY +
    postCount * 5;

  const repInfo = calculateRepTier(totalReps);

  return {
    reps: totalReps,
    repInfo,
    stats: {
      totalUpvotes,
      postCount,
      discussionCount,
    },
  };
}

export async function getPendingRequestsCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(${connections.id})` })
    .from(connections)
    .where(
      and(
        eq(connections.toUserId, userId),
        eq(connections.status, "pending")
      )
    );

  return Number(result?.count || 0);
}
