"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { z } from "zod";
import { auth } from "@/lib/auth";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be under 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type ActionResponse = {
  success: boolean;
  message?: string;
  userId?: string;
};

export async function registerUser(formData: FormData): Promise<ActionResponse> {
  const rawData = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Validation failed",
    };
  }

  const { username, email, password } = parsed.data;
  const cleanEmail = email.toLowerCase().trim();
  const cleanUsername = username.trim();

  try {
    const existingEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    if (existingEmail.length > 0) {
      return {
        success: false,
        message: "An account with this email already exists",
      };
    }

    const existingUsername = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, cleanUsername))
      .limit(1);

    if (existingUsername.length > 0) {
      return {
        success: false,
        message: "This username is already taken",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        email: cleanEmail,
        username: cleanUsername,
        passwordHash,
      })
      .returning({ id: users.id });

    return {
      success: true,
      userId: newUser.id,
    };
  } catch (error) {
    return {
      success: false,
      message: "Database error occurred during registration",
    };
  }
}

export async function selectCollege(collegeId: string): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized session",
    };
  }

  try {
    await db
      .update(users)
      .set({
        collegeId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update college selection",
    };
  }
}
