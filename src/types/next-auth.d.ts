import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      collegeId?: string | null;
      collegeName?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    collegeId?: string | null;
    collegeName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string | null;
    collegeId?: string | null;
    collegeName?: string | null;
  }
}
