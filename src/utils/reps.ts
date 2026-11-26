export type RepTier = "amateur" | "contributor" | "expert" | "legend";

export type RepInfo = {
  tier: RepTier;
  label: string;
  minReps: number;
  nextTierReps: number | null;
  color: string;
  bg: string;
  border: string;
};

export const REPS_PER_UPVOTE = 10;
export const REPS_PER_REPLY = 5;

export function calculateRepTier(reps: number): RepInfo {
  if (reps >= 1500) {
    return {
      tier: "legend",
      label: "Legend",
      minReps: 1500,
      nextTierReps: null,
      color: "text-amber-300",
      bg: "bg-amber-400/10",
      border: "border-amber-400/30",
    };
  }

  if (reps >= 500) {
    return {
      tier: "expert",
      label: "Expert",
      minReps: 500,
      nextTierReps: 1500,
      color: "text-violet-300",
      bg: "bg-violet-400/10",
      border: "border-violet-400/30",
    };
  }

  if (reps >= 100) {
    return {
      tier: "contributor",
      label: "Contributor",
      minReps: 100,
      nextTierReps: 500,
      color: "text-blue-300",
      bg: "bg-blue-400/10",
      border: "border-blue-400/30",
    };
  }

  return {
    tier: "amateur",
    label: "Amateur",
    minReps: 0,
    nextTierReps: 100,
    color: "text-zinc-400",
    bg: "bg-zinc-800/40",
    border: "border-zinc-700/40",
  };
}
