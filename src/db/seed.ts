import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

const initialColleges = [
  { name: "National Institute of Technology, Trichy", city: "Tiruchirappalli", state: "Tamil Nadu" },
  { name: "Indian Institute of Technology, Bombay", city: "Mumbai", state: "Maharashtra" },
  { name: "Indian Institute of Technology, Madras", city: "Chennai", state: "Tamil Nadu" },
  { name: "Indian Institute of Technology, Delhi", city: "New Delhi", state: "Delhi" },
  { name: "BITS Pilani", city: "Pilani", state: "Rajasthan" },
  { name: "International Institute of Information Technology, Hyderabad", city: "Hyderabad", state: "Telangana" },
  { name: "National Institute of Technology, Surathkal", city: "Mangalore", state: "Karnataka" },
  { name: "Vellore Institute of Technology", city: "Vellore", state: "Tamil Nadu" },
  { name: "Delhi Technological University", city: "New Delhi", state: "Delhi" },
  { name: "SRM Institute of Science and Technology", city: "Chennai", state: "Tamil Nadu" },
  { name: "Anna University", city: "Chennai", state: "Tamil Nadu" },
  { name: "Vel Tech High Tech Dr.Rangarajan Dr.Sakunthala Engineering College", city: "Chennai", state: "Tamil Nadu" },
];

async function seed() {
  console.log("Seeding colleges into database...");

  for (const college of initialColleges) {
    await db
      .insert(schema.colleges)
      .values(college)
      .onConflictDoNothing({ target: schema.colleges.name });
  }

  const allColleges = await db.select().from(schema.colleges);
  const nitt = allColleges.find((c) => c.name.includes("Trichy")) || allColleges[0];
  const iitb = allColleges.find((c) => c.name.includes("Bombay")) || allColleges[1];
  const iitm = allColleges.find((c) => c.name.includes("Madras")) || allColleges[2];

  console.log("Seeding demo students...");
  const demoHash = await bcrypt.hash("demo12345", 10);

  const demoUsers = [
    { username: "vasanth_nitt", email: "vasanth@nitt.edu", passwordHash: demoHash, collegeId: nitt.id, bio: "CS Senior · Open Source Builder" },
    { username: "priya_iitb", email: "priya@iitb.ac.in", passwordHash: demoHash, collegeId: iitb.id, bio: "Electrical Engg · Robotics Enthusiast" },
    { username: "arjun_iitm", email: "arjun@iitm.ac.in", passwordHash: demoHash, collegeId: iitm.id, bio: "Mechanical '26 · Aeromodelling Club" },
  ];

  for (const u of demoUsers) {
    await db
      .insert(schema.users)
      .values(u)
      .onConflictDoNothing({ target: schema.users.email });
  }

  const allUsers = await db.select().from(schema.users);
  const user1 = allUsers[0];
  const user2 = allUsers[1] || user1;

  console.log("Seeding initial discussions...");
  const samplePosts = [
    {
      title: "Advice for Machine Learning Elective with Prof. Sharma?",
      body: "Deciding between ML and Advanced Computer Networks next term. How is the grading curve and what are the project expectations for ML?",
      category: "academics",
      scope: "my_college",
      isHelpWanted: false,
      authorId: user1.id,
      collegeId: nitt.id,
      upvoteCount: 0,
      discussionCount: 0,
    },
    {
      title: "Hostel B Mess Menu: New caterer feedback thread",
      body: "The new dining contractor started this Monday. Please drop your feedback regarding dinner timings, hygiene, and vegetarian alternatives so the Mess Committee can compile notes.",
      category: "hostel",
      scope: "my_college",
      isHelpWanted: false,
      authorId: user1.id,
      collegeId: nitt.id,
      upvoteCount: 0,
      discussionCount: 0,
    },
    {
      title: "Smart India Hackathon Team: Need 1 Frontend Engineer",
      body: "We are building an AI civic grievance portal for SIH 2026. Looking for 1 developer comfortable with Next.js, Tailwind, and REST APIs. Drop your GitHub profile below!",
      category: "events",
      scope: "across_india",
      isHelpWanted: true,
      authorId: user2.id,
      collegeId: iitb.id,
      upvoteCount: 0,
      discussionCount: 0,
    },
    {
      title: "Off-campus Software Engineering Internship Guide for 2026",
      body: "Compiled a step by step guide on cold emailing recruiters, tailoring ATS resumes, and preparing for system design rounds based on offers from Atlassian and Google.",
      category: "career",
      scope: "across_india",
      isHelpWanted: false,
      authorId: user2.id,
      collegeId: iitb.id,
      upvoteCount: 0,
      discussionCount: 0,
    },
  ];

  for (const p of samplePosts) {
    const existing = await db
      .select({ id: schema.posts.id })
      .from(schema.posts)
      .where(eq(schema.posts.title, p.title))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.posts).values(p);
    } else {
      await db
        .update(schema.posts)
        .set({ upvoteCount: 0, discussionCount: 0 })
        .where(eq(schema.posts.id, existing[0].id));
    }
  }

  console.log("Seeding complete! Colleges, demo users, and posts ready.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
