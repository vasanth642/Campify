import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
    uuid,
    uniqueIndex,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Colleges Table
export const colleges = pgTable(
    "colleges",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        name: text("name").notNull().unique(),
        city: text("city").notNull(),
        state: text("state").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => ({
        nameIdx: index("colleges_name_idx").on(table.name),
    })
);

// 2. Users Table
export const users = pgTable(
    "users",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        email: text("email").notNull().unique(),
        username: text("username").notNull().unique(),
        passwordHash: text("password_hash").notNull(),
        bio: text("bio").default(""),
        avatarUrl: text("avatar_url"),
        collegeId: uuid("college_id").references(() => colleges.id, {
            onDelete: "set null",
        }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        emailIdx: index("users_email_idx").on(table.email),
        usernameIdx: index("users_username_idx").on(table.username),
        collegeIdx: index("users_college_idx").on(table.collegeId),
    })
);

// 3. Posts Table
export const posts = pgTable(
    "posts",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        title: text("title").notNull(),
        body: text("body").notNull(),
        category: text("category").notNull(), // Academics, Hostel, Food, Events, Career, Help Wanted
        scope: text("scope").notNull().default("my_college"), // my_college or across_india
        isHelpWanted: boolean("is_help_wanted").default(false).notNull(),
        upvoteCount: integer("upvote_count").default(0).notNull(),
        discussionCount: integer("discussion_count").default(0).notNull(),
        mediaUrl: text("media_url"),
        authorId: uuid("author_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        collegeId: uuid("college_id")
            .references(() => colleges.id, { onDelete: "cascade" })
            .notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        collegeScopeIdx: index("posts_college_scope_idx").on(
            table.collegeId,
            table.scope
        ),
        authorIdx: index("posts_author_idx").on(table.authorId),
        createdAtIdx: index("posts_created_at_idx").on(table.createdAt),
    })
);

// 4. Post Upvotes Table (Enforces 1 upvote per user per post)
export const postUpvotes = pgTable(
    "post_upvotes",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        postId: uuid("postId")
            .references(() => posts.id, { onDelete: "cascade" })
            .notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => ({
        userPostUnique: uniqueIndex("user_post_unique_idx").on(
            table.userId,
            table.postId
        ),
    })
);

// 5. Discussions (Comments) Table
export const discussions = pgTable(
    "discussions",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        body: text("body").notNull(),
        postId: uuid("post_id")
            .references(() => posts.id, { onDelete: "cascade" })
            .notNull(),
        authorId: uuid("author_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => ({
        postCreatedIdx: index("discussions_post_created_idx").on(
            table.postId,
            table.createdAt
        ),
    })
);

// 6. Connections Table (Friend / Peer Requests)
export const connections = pgTable(
    "connections",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        fromUserId: uuid("from_user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        toUserId: uuid("to_user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        status: text("status").notNull().default("pending"), // pending, accepted, rejected
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        userPairUnique: uniqueIndex("connection_pair_unique_idx").on(
            table.fromUserId,
            table.toUserId
        ),
        toUserStatusIdx: index("connection_to_status_idx").on(
            table.toUserId,
            table.status
        ),
    })
);

// Relational Definitions (for easy joins in queries)
export const usersRelations = relations(users, ({ one, many }) => ({
    college: one(colleges, {
        fields: [users.collegeId],
        references: [colleges.id],
    }),
    posts: many(posts),
    discussions: many(discussions),
    upvotes: many(postUpvotes),
}));

export const collegesRelations = relations(colleges, ({ many }) => ({
    users: many(users),
    posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
    author: one(users, {
        fields: [posts.authorId],
        references: [users.id],
    }),
    college: one(colleges, {
        fields: [posts.collegeId],
        references: [colleges.id],
    }),
    discussions: many(discussions),
    upvotes: many(postUpvotes),
}));

export const discussionsRelations = relations(discussions, ({ one }) => ({
    post: one(posts, {
        fields: [discussions.postId],
        references: [posts.id],
    }),
    author: one(users, {
        fields: [discussions.authorId],
        references: [users.id],
    }),
}));