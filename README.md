# Campify

The next-generation campus network platform engineered for authentic university communication, verified local student feeds, inter-college collaboration, and peer reputation tracking.

[![Next.js](https://img.shields.io/badge/Framework-Next.js_15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/Library-React_19-20232A?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-Neon_PostgreSQL-00E599?style=flat-square&logo=postgresql)](https://neon.tech/)
[![ORM](https://img.shields.io/badge/ORM-Drizzle-C5F74F?style=flat-square&logo=drizzle)](https://orm.drizzle.team/)
[![Auth](https://img.shields.io/badge/Auth-NextAuth_v5-purple?style=flat-square)](https://authjs.dev/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

---

## What is Campify?

Most university communities suffer from fragmented communication spread across unverified WhatsApp groups, informal Telegram channels, and chaotic forums. Important academic notices, hostel updates, and exam discussions get buried under noise, while opportunities to find teammates across Indian colleges for hackathons, research, and internships are virtually non-existent.

**Campify** solves this by establishing a structured, two-tier platform:
1. **Verified Campus Hubs**: Restricted, authenticated feeds scoped strictly to your university for day-to-day notices, mess menus, lost-and-found queries, and course discussions.
2. **Nationwide Student Grid**: An open exchange connecting students across premier Indian institutions (IITs, NITs, BITS, Anna University, Vel Tech, and more) to form hackathon teams, share referral links, and exchange research ideas.
3. **Campus Reps**: An honest, point-based reputation and achievement badge engine that recognizes students who actively help peers with verified solutions.

---

## Key Features

### 1. Campus Feed Isolation
Discussions published under `My College` are strictly isolated at the database query level using the author's verified university ID. Students from other colleges cannot view or leak into your local university notices.

### 2. Nationwide Collaboration Grid
Switch to the `Across India` feed with one click to collaborate with students nationwide on cross-institutional research, project building, and off-campus internships.

### 3. Campus Reps and Tier Badges
Points are computed deterministically from real database activity:
- Upvotes received on discussions: +10 Reps
- Constructive replies authored: +5 Reps
- Original discussions published: +5 Reps
- Helpful solution recognition: +25 Reps

Tier Progression:
- **Amateur** (0 to 99 Reps): Slate emblem
- **Contributor** (100 to 499 Reps): Sapphire Cyan emblem
- **Expert** (500 to 1,499 Reps): Vivid Violet emblem
- **Legend** (1,500+ Reps): Radiant Amber Gold emblem

### 4. Help Wanted and Helpful Answers
Discussions marked with the Help Wanted tag allow readers and the author to mark constructive replies as helpful, instantly awarding bonus reputation to the student who helped.

### 5. Campus Network and Peer Directory
Search students across institutions by username, college, or bio keywords. Send connection requests and manage incoming alerts in a dedicated Notifications center.

### 6. Auto-Linkify Engine
External URLs pasted in bios, discussion bodies, or comments are automatically detected and converted into safe external links that open in a separate tab.

---

## Application Workflow and Architecture

The diagram below illustrates how a user request flows through authentication, route protection, database queries, and client reconciliation:

```mermaid
flowchart TD
    A["Student visits Campify"] --> B{"Authenticated Session?"}
    
    B -->|"No"| C["Browse Public Landing Page (/)]"]
    C --> D["Sign Up / Login (/signup, /login)"]
    D --> E["Select Verified University (/select-college)"]
    E --> F["Session Token Issued (NextAuth v5 JWT)"]
    
    B -->|"Yes"| G["Edge Middleware (src/middleware.ts)"]
    F --> G
    
    G --> H{"Target Destination"}
    
    H -->|"Campus Discussions"| I["/feed (Scoped Query)"]
    I --> J{"Feed Scope Selected"}
    J -->|"My College"| K["Query DB: posts WHERE college_id = user.college_id"]
    J -->|"Across India"| L["Query DB: posts WHERE scope = 'across_india'"]
    
    H -->|"Publish Discussion"| M["createPost Server Action"]
    M --> N["Zod Validation & Neon DB Insert"]
    N --> O["Revalidate Cache & Optimistic Render"]
    
    H -->|"Peer Discovery"| P["/search (Student Network)"]
    P --> Q["Query: users JOIN colleges JOIN rep calculations"]
    Q --> R["Send Connection Request -> connections table"]
    
    H -->|"Alerts & Invites"| S["/notifications Center"]
    S --> T["Accept / Decline Request Action"]
    
    H -->|"Profile & Reputation"| U["/profile Dashboard"]
    U --> V["Calculate Total Reps -> Assign Tier Badge"]
```

---

## Database Architecture

Campify uses a normalized relational schema on Neon Serverless PostgreSQL, managed with type-safe Drizzle ORM.

```mermaid
erDiagram
    colleges ||--o{ users : "houses"
    colleges ||--o{ posts : "scopes"
    users ||--o{ posts : "authors"
    users ||--o{ discussions : "writes"
    users ||--o{ post_upvotes : "casts"
    users ||--o{ connections : "initiates"
    users ||--o{ connections : "receives"
    posts ||--o{ discussions : "contains"
    posts ||--o{ post_upvotes : "tallies"

    colleges {
        uuid id PK "Primary Key"
        text name "Unique official college name"
        text city "Campus location city"
        text state "Campus location state"
        timestamp created_at "Registration timestamp"
    }

    users {
        uuid id PK "Primary Key"
        text email "Unique student email"
        text username "Unique display handle"
        text password_hash "Bcrypt salted hash"
        text bio "Student profile description"
        text avatar_url "Profile avatar path"
        uuid college_id FK "References colleges.id"
        timestamp created_at "Account creation date"
        timestamp updated_at "Profile last modified"
    }

    posts {
        uuid id PK "Primary Key"
        text title "Discussion headline"
        text body "Full content description"
        text category "Academics, Hostel, Events, Career, Help"
        text scope "my_college or across_india"
        boolean is_help_wanted "Help wanted indicator"
        integer upvote_count "Cached aggregate counter"
        integer discussion_count "Cached comment counter"
        uuid author_id FK "References users.id (Cascade)"
        uuid college_id FK "References colleges.id (Cascade)"
        timestamp created_at "Published timestamp"
        timestamp updated_at "Last updated timestamp"
    }

    post_upvotes {
        uuid id PK "Primary Key"
        uuid user_id FK "References users.id (Cascade)"
        uuid post_id FK "References posts.id (Cascade)"
        timestamp created_at "Timestamp of upvote"
    }

    discussions {
        uuid id PK "Primary Key"
        text body "Reply content"
        uuid post_id FK "References posts.id (Cascade)"
        uuid author_id FK "References users.id (Cascade)"
        timestamp created_at "Timestamp of reply"
    }

    connections {
        uuid id PK "Primary Key"
        uuid from_user_id FK "Requester student (Cascade)"
        uuid to_user_id FK "Recipient student (Cascade)"
        text status "pending, accepted, rejected"
        timestamp created_at "Request timestamp"
        timestamp updated_at "Response timestamp"
    }
```

### Relational Integrity and Indexes
- **Unique Vote Guard**: Composite index `uniqueIndex("user_post_unique_idx").on(userId, postId)` guarantees a student can never upvote a post more than once.
- **Unique Connection Guard**: Composite index `uniqueIndex("connection_pair_unique_idx").on(fromUserId, toUserId)` prevents duplicate connection requests.
- **Query Acceleration**: B-tree indices on `(college_id, scope)` and `(author_id)` accelerate high-frequency feed queries and profile aggregations.

---

## Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Server-side rendering, streaming, Server Actions, edge routing |
| **Library** | React 19 | Modern component architecture, optimistic hooks, useTransition |
| **Language** | TypeScript 5.7 | Strict static type safety across schemas, actions, and UI |
| **Database** | Neon PostgreSQL | Serverless relational persistence with connection pooling |
| **ORM** | Drizzle ORM | Type-safe SQL query builder and schema migration manager |
| **Auth** | NextAuth.js v5 (Auth.js) | Session management with JWTs and edge route protection |
| **Styling** | Tailwind CSS | Custom obsidian dark design tokens and responsive layouts |
| **Validation** | Zod | Runtime input parsing and sanitization for Server Actions |
| **Icons** | Lucide React | Consistent vector iconography |
| **Animations**| Framer Motion | Smooth viewport-aware transitions and loaders |

---

## Local Development and Setup Guide

Follow these steps to clone, configure, and run Campify locally:

### 1. Prerequisites
- Node.js 18.18.0 or higher
- Git
- Free Neon PostgreSQL database instance (neon.tech)

### 2. Clone the Repository
```bash
git clone https://github.com/vasanth642/Campify.git
cd Campify
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@ep-your-database.neon.tech/neondb?sslmode=require"
AUTH_SECRET="generate-a-32-byte-secret-using-openssl-rand-hex-32"
NEXTAUTH_URL="http://localhost:3000"
```

To generate a secure `AUTH_SECRET`, you can run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Push Schema to Database
Synchronize the Drizzle schema with your Neon PostgreSQL instance:
```bash
npm run db:push
```

### 6. Seed Baseline Data
Populate verified Indian colleges (NIT Trichy, IIT Bombay, Vel Tech, BITS Pilani, etc.) and initial demo discussions:
```bash
npm run db:seed
```

### 7. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Production Build Verification
To verify type safety and produce the optimized production bundle:
```bash
npm run typecheck
npm run build
```

---

## Contributing to Campify

Contributions are what make the open-source developer community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch:
   ```bash
   git checkout -b feat/amazing-feature
   ```
3. Commit your Changes:
   ```bash
   git commit -m "feat: add some amazing feature"
   ```
4. Push to the Branch:
   ```bash
   git push origin feat/amazing-feature
   ```
5. Open a Pull Request on GitHub

---

## License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.

---

## Developed By

Built by **vasanth642**  
GitHub: [@vasanth642](https://github.com/vasanth642)

---

## Support the Project

If this project helped you understand modern full-stack web architecture with Next.js 15, Drizzle ORM, and Neon PostgreSQL, please consider giving it a star on GitHub. It helps others discover the repository.

Star this repository on GitHub
