import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

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
];

async function seed() {
    console.log("Seeding initial colleges into database...");

    for (const college of initialColleges) {
        await db
            .insert(schema.colleges)
            .values(college)
            .onConflictDoNothing({ target: schema.colleges.name });
    }

    console.log("Seeding complete! Colleges are ready.");
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});