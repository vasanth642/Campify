import { db } from "@/db";
import { colleges } from "@/db/schema";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CollegeSelector from "./CollegeSelector";

export default async function SelectCollegePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const allColleges = await db
    .select({
      id: colleges.id,
      name: colleges.name,
      city: colleges.city,
      state: colleges.state,
    })
    .from(colleges)
    .orderBy(colleges.name);

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(120, 119, 198, 0.15), transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-lg">
        <CollegeSelector colleges={allColleges} />
      </div>
    </div>
  );
}
