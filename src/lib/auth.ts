import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, colleges } from "@/db/schema";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();

        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            username: users.username,
            passwordHash: users.passwordHash,
            collegeId: users.collegeId,
          })
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);

        if (!user) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordsMatch) {
          return null;
        }

        let collegeName: string | null = null;
        if (user.collegeId) {
          const [college] = await db
            .select({ name: colleges.name })
            .from(colleges)
            .where(eq(colleges.id, user.collegeId))
            .limit(1);
          collegeName = college?.name || null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          collegeId: user.collegeId,
          collegeName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.name;
        token.collegeId = user.collegeId;
        token.collegeName = user.collegeName;
      }
      if (trigger === "update" && session) {
        token.collegeId = session.collegeId;
        token.collegeName = session.collegeName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string | null;
        session.user.collegeId = token.collegeId as string | null;
        session.user.collegeName = token.collegeName as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
});
