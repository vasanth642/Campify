export const CATEGORIES = [
  { id: "all", label: "All Posts" },
  { id: "academics", label: "Academics" },
  { id: "hostel", label: "Hostel & Mess" },
  { id: "facilities", label: "Campus Facilities" },
  { id: "events", label: "Events & Clubs" },
  { id: "career", label: "Career & Internships" },
  { id: "help", label: "Help Wanted" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
