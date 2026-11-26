# Campify

Campify is a high-performance, full-stack campus network platform engineered for authentic student communication, peer validation, and inter-college collaboration. Built with Next.js 15, React 19, TypeScript, Drizzle ORM, and Neon Serverless PostgreSQL.

---

## 1. System Architecture

Campify is architected on a modern serverless stack that separates client rendering, edge authentication, server action mutations, and relational persistence.

```mermaid
flowchart TD
    subgraph ClientTier ["Client Tier (Browser)"]
        UI["React 19 Server & Client Components"]
        Optimistic["Optimistic State Reconciliation"]
    end

    subgraph EdgeTier ["Edge & Middleware Tier"]
        Middleware["Edge Middleware (src/middleware.ts)"]
        SessionStore["JWT Session Validation (NextAuth v5)"]
    end

    subgraph AppTier ["Next.js App Router (Serverless Node.js)"]
        Routes["Server Rendered Route Handlers"]
        Actions["Type-Safe Server Actions (Zod Validation)"]
        RepEngine["Deterministic Rep Engine (src/utils/reps.ts)"]
    end

    subgraph DataTier ["Data Access & Persistence"]
        Drizzle["Drizzle ORM Layer"]
        Neon["Neon Serverless PostgreSQL (Pooled over WebSockets)"]
    end

    UI -->|"Requests / Navigation"| Middleware
    Middleware -->|"Route Guard"| SessionStore
    SessionStore -->|"Authorized Context"| Routes
    UI -->|"Form Mutations & Upvotes"| Actions
    Actions -->|"Input Sanitization"| RepEngine
    RepEngine -->|"Type-Safe Queries"| Drizzle
    Routes -->|"Relational Queries"| Drizzle
    Drizzle -->|"Parameterized SQL"| Neon
    Optimistic -.->|"Instant Perceived Response"| UI
```

---

## 2. Database Entity-Relationship Model

The persistence layer enforces strict relational integrity, composite unique constraints, and foreign key cascades to ensure data consistency across campus activities.

```mermaid
erDiagram
    colleges ||--o{ users : "enrolls"
    colleges ||--o{ posts : "scopes"
    users ||--o{ posts : "authors"
    users ||--o{ discussions : "writes"
    users ||--o{ post_upvotes : "casts"
    users ||--o{ connections : "sends"
    users ||--o{ connections : "receives"
    posts ||--o{ discussions : "contains"
    posts ||--o{ post_upvotes : "tallies"

    colleges {
        uuid id PK
        text name "UNIQUE"
        text city
        text state
        timestamp created_at
    }

    users {
        uuid id PK
        text email "UNIQUE"
        text username "UNIQUE"
        text password_hash
        text bio
        text avatar_url
        uuid college_id FK
        timestamp created_at
        timestamp updated_at
    }

    posts {
        uuid id PK
        text title
        text body
        text category
        text scope "my_college | across_india"
        boolean is_help_wanted
        integer upvote_count
        integer discussion_count
        text media_url
        uuid author_id FK
        uuid college_id FK
        timestamp created_at
        timestamp updated_at
    }

    post_upvotes {
        uuid id PK
        uuid user_id FK
        uuid post_id FK
        timestamp created_at
    }

    discussions {
        uuid id PK
        text body
        uuid post_id FK
        uuid author_id FK
        timestamp created_at
    }

    connections {
        uuid id PK
        uuid from_user_id FK
        uuid to_user_id FK
        text status "pending | accepted | rejected"
        timestamp created_at
        timestamp updated_at
    }
```

### Relational Constraints
- **post_upvotes**: Enforces a composite unique index on `(user_id, post_id)` to prevent duplicate voting attacks.
- **connections**: Enforces a composite unique index on `(from_user_id, to_user_id)` to prevent duplicate request spam.
- **posts**: Scoped by `college_id` and indexed on `(college_id, scope)` for high-throughput isolation filtering.
- **Cascades**: User deletions cascade to author posts, replies, and votes; college deletions set user references to null.

---

## 3. Core Functional Specifications

### Campus Domain Isolation
- Discussions created with the `my_college` scope are isolated at the database level. Students only access local campus content for their assigned university.
- Discussions marked `across_india` surface on the Nationwide Grid for inter-institution collaboration, hackathons, and internship opportunities.

### Campus Reputation Engine (Reps)
A deterministic point calculation engine replaces arbitrary rating systems:
- Upvotes received on user posts: +10 Reps each
- Constructive replies authored: +5 Reps each
- Original discussions published: +5 Reps each
- Helpful answer recognition: +25 Reps

#### Tier Hierarchy
1. **Amateur**: 0 to 99 Reps (Slate Zinc)
2. **Contributor**: 100 to 499 Reps (Sapphire Cyan)
3. **Expert**: 500 to 1,499 Reps (Vivid Violet)
4. **Legend**: 1,500+ Reps (Radiant Amber)

### Peer Network & Connection Directory
- Full-text search across verified students, colleges, skills, and bios.
- Bidirectional request, accept, and decline connection pipeline.
- Real-time pending connection alert counters in global navigation.

### Auto-Linkification
- Client parser scans post bodies, comments, and student bios for external URLs.
- Sanitizes and converts URLs into clickable anchors with `target="_blank"` and `rel="noopener noreferrer"` attributes.

---

## 4. Technology Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript 5.7 (Strict Type Checking)
- **Database**: Neon Serverless PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js v5 (Auth.js) with bcryptjs
- **Styling**: Tailwind CSS (Obsidian Dark Design System)
- **Validation**: Zod
- **Icons**: Lucide React
- **Animations**: Framer Motion

---

## 5. Security Posture

- **HTTP Headers**: Enforced via `next.config.ts`:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Frame-Options: DENY` (Anti-clickjacking)
  - `X-Content-Type-Options: nosniff` (Anti-MIME sniffing)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **Password Hashing**: Bcrypt salt-hashed with 10 rounds before write operations.
- **Route Guards**: Next.js edge middleware intercepts all protected endpoints (`/feed`, `/post/*`, `/profile/*`, `/search`, `/notifications`).

---

## 6. Local Setup and Development

### Prerequisites
- Node.js 18.18 or higher
- Neon PostgreSQL database instance

### Environment Variables
Create a `.env.local` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"
AUTH_SECRET="your-generated-32-byte-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Installation and Bootstrapping

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Push schema definitions to your Neon PostgreSQL instance:
   ```bash
   npm run db:push
   ```

3. Seed initial colleges and baseline demo data:
   ```bash
   npm run db:seed
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```

5. Run TypeScript verification:
   ```bash
   npm run typecheck
   ```

6. Run the production build verification:
   ```bash
   npm run build
   ```

---

## 7. Project Structure

```
├── src/
│   ├── actions/          # Type-safe Next.js Server Actions (auth, posts, connections)
│   ├── app/              # Next.js App Router (feed, profile, search, notifications)
│   ├── components/       # Reusable UI components (badges, feed, layout)
│   ├── constants/        # Application constants and categories
│   ├── db/               # Drizzle schema, client instance, and seed scripts
│   ├── lib/              # Auth.js configuration, utilities
│   ├── types/            # TypeScript type declarations
│   └── utils/            # Reps calculation and linkify parsers
├── public/               # Static assets
├── drizzle.config.ts     # Drizzle Kit migration configuration
├── next.config.ts        # Next.js configuration and security headers
├── tailwind.config.ts    # Tailwind CSS obsidian design tokens
└── tsconfig.json         # Strict TypeScript compiler options
```
