"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { discussions, postUpvotes, posts, users } from "@/db/schema";
import { auth } from "@/lib/auth";

const createPostSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title must be under 120 characters"),
  body: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be under 2000 characters"),
  category: z.string().min(1, "Please select a category"),
  scope: z.enum(["my_college", "across_india"]),
  isHelpWanted: z.boolean().default(false),
});

export type PostActionResponse = {
  success: boolean;
  message?: string;
  postId?: string;
};

export async function createPost(formData: FormData): Promise<PostActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "You must be signed in to post" };
  }

  const [userProfile] = await db
    .select({ collegeId: users.collegeId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!userProfile?.collegeId) {
    return {
      success: false,
      message: "Please select your college before publishing a post",
    };
  }

  const raw = {
    title: formData.get("title"),
    body: formData.get("body"),
    category: formData.get("category"),
    scope: formData.get("scope"),
    isHelpWanted: formData.get("isHelpWanted") === "true",
  };

  const parsed = createPostSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid post data",
    };
  }

  try {
    const [newPost] = await db
      .insert(posts)
      .values({
        title: parsed.data.title.trim(),
        body: parsed.data.body.trim(),
        category: parsed.data.category,
        scope: parsed.data.scope,
        isHelpWanted: parsed.data.isHelpWanted,
        authorId: session.user.id,
        collegeId: userProfile.collegeId,
      })
      .returning({ id: posts.id });

    revalidatePath("/feed");
    return { success: true, postId: newPost.id };
  } catch (error) {
    return { success: false, message: "Database error creating post" };
  }
}

export type UpvoteResponse = {
  success: boolean;
  hasUpvoted: boolean;
  newCount: number;
  message?: string;
};

export async function toggleUpvote(postId: string): Promise<UpvoteResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, hasUpvoted: false, newCount: 0, message: "Sign in required" };
  }

  const userId = session.user.id;

  try {
    const [existing] = await db
      .select({ id: postUpvotes.id })
      .from(postUpvotes)
      .where(and(eq(postUpvotes.userId, userId), eq(postUpvotes.postId, postId)))
      .limit(1);

    if (existing) {
      await db
        .delete(postUpvotes)
        .where(and(eq(postUpvotes.userId, userId), eq(postUpvotes.postId, postId)));

      const [updatedPost] = await db
        .update(posts)
        .set({ upvoteCount: sql`GREATEST(0, ${posts.upvoteCount} - 1)` })
        .where(eq(posts.id, postId))
        .returning({ upvoteCount: posts.upvoteCount });

      revalidatePath("/feed");
      revalidatePath(`/post/${postId}`);
      return { success: true, hasUpvoted: false, newCount: updatedPost?.upvoteCount ?? 0 };
    } else {
      await db.insert(postUpvotes).values({ userId, postId });

      const [updatedPost] = await db
        .update(posts)
        .set({ upvoteCount: sql`${posts.upvoteCount} + 1` })
        .where(eq(posts.id, postId))
        .returning({ upvoteCount: posts.upvoteCount });

      revalidatePath("/feed");
      revalidatePath(`/post/${postId}`);
      return { success: true, hasUpvoted: true, newCount: updatedPost?.upvoteCount ?? 1 };
    }
  } catch (error) {
    return { success: false, hasUpvoted: false, newCount: 0, message: "Upvote failed" };
  }
}

export async function addDiscussion(
  postId: string,
  body: string
): Promise<{ success: boolean; message?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Sign in required to reply" };
  }

  const cleanBody = body.trim();
  if (!cleanBody || cleanBody.length < 2) {
    return { success: false, message: "Reply cannot be empty" };
  }

  try {
    await db.insert(discussions).values({
      body: cleanBody,
      postId,
      authorId: session.user.id,
    });

    await db
      .update(posts)
      .set({ discussionCount: sql`${posts.discussionCount} + 1` })
      .where(eq(posts.id, postId));

    revalidatePath(`/post/${postId}`);
    revalidatePath("/feed");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to publish reply" };
  }
}

export async function deletePost(postId: string): Promise<{ success: boolean; message?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Sign in required" };
  }

  try {
    const [target] = await db
      .select({ authorId: posts.authorId })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!target || target.authorId !== session.user.id) {
      return { success: false, message: "You can only delete your own posts" };
    }

    await db.delete(posts).where(eq(posts.id, postId));
    revalidatePath("/feed");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Delete failed" };
  }
}
