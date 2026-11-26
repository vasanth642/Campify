import React from "react";
import { Shield, Sparkles, Trophy, Award } from "lucide-react";
import { RepInfo } from "@/utils/reps";

const tierStyles = {
  legend: {
    outer: "border-amber-500/35 bg-gradient-to-r from-amber-950/50 via-zinc-950 to-zinc-950 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.12)]",
    emblem: "border-amber-400/50 bg-amber-500/25 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)]",
    text: "text-amber-200",
    chip: "border-amber-500/20 bg-amber-950/60 text-amber-400/90",
  },
  expert: {
    outer: "border-purple-500/35 bg-gradient-to-r from-purple-950/50 via-zinc-950 to-zinc-950 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.12)]",
    emblem: "border-purple-400/50 bg-purple-500/25 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.25)]",
    text: "text-purple-200",
    chip: "border-purple-500/20 bg-purple-950/60 text-purple-400/90",
  },
  contributor: {
    outer: "border-cyan-500/35 bg-gradient-to-r from-cyan-950/50 via-zinc-950 to-zinc-950 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.12)]",
    emblem: "border-cyan-400/50 bg-cyan-500/25 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.25)]",
    text: "text-cyan-200",
    chip: "border-cyan-500/20 bg-cyan-950/60 text-cyan-400/90",
  },
  amateur: {
    outer: "border-zinc-700/50 bg-gradient-to-r from-zinc-900/70 via-zinc-950 to-zinc-950 text-zinc-300",
    emblem: "border-zinc-700/70 bg-zinc-800/90 text-zinc-400",
    text: "text-zinc-300",
    chip: "border-zinc-800 bg-zinc-900 text-zinc-500",
  },
};

export default function BadgePill({
  repInfo,
  showReps = false,
  reps = 0,
}: {
  repInfo: RepInfo;
  showReps?: boolean;
  reps?: number;
}) {
  const style = tierStyles[repInfo.tier] || tierStyles.amateur;

  function renderIcon() {
    switch (repInfo.tier) {
      case "legend":
        return <Trophy className="h-3 w-3" />;
      case "expert":
        return <Award className="h-3 w-3" />;
      case "contributor":
        return <Sparkles className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border p-1 pr-2.5 shadow-sm backdrop-blur-sm transition-all ${style.outer}`}
    >
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${style.emblem}`}
      >
        {renderIcon()}
      </div>

      <span className={`text-[11px] font-semibold tracking-wide ${style.text}`}>
        {repInfo.label}
      </span>

      {showReps && (
        <span
          className={`ml-0.5 rounded px-1.5 py-0.2 text-[10px] font-mono border ${style.chip}`}
        >
          {reps} Reps
        </span>
      )}
    </div>
  );
}
