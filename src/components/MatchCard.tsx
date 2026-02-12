"use client";

import { useState } from "react";
import type { CalendarMatch } from "@/types/calendar";
import MatchDetailModal from "@/components/MatchDetailModal";

interface MatchCardProps {
  match: CalendarMatch;
  team1Emoji?: string;
  team2Emoji?: string;
  onTeamClick?: (teamName: string) => void;
}

function TeamLogo({ emoji }: { emoji?: string }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-lg font-bold">
      {emoji ?? "⚽"}
    </div>
  );
}

export default function MatchCard({
  match,
  team1Emoji,
  team2Emoji,
  onTeamClick,
}: MatchCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  const isPlayed =
    match.status === "Fischio finale" || match.status === "In diretta";

  return (
    <>
      <article className="rounded-2xl border border-border bg-card p-5 shadow-lg">
        <div className="flex flex-col gap-4">
          {/* Team 1 */}
          <div className="flex items-center gap-3">
            <TeamLogo emoji={team1Emoji} />
            <button
              type="button"
              onClick={() => onTeamClick?.(match.team1Name)}
              className="min-w-0 flex-1 truncate text-left font-semibold text-foreground hover:underline"
            >
              {match.team1Name}
            </button>
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {isPlayed ? match.score1 : "–"}
            </span>
          </div>
          {/* Team 2 */}
          <div className="flex items-center gap-3">
            <TeamLogo emoji={team2Emoji} />
            <button
              type="button"
              onClick={() => onTeamClick?.(match.team2Name)}
              className="min-w-0 flex-1 truncate text-left font-semibold text-foreground hover:underline"
            >
              {match.team2Name}
            </button>
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {isPlayed ? match.score2 : "–"}
            </span>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span
            className={`text-sm font-medium ${
              match.status === "In diretta"
                ? "text-red-500"
                : "text-muted-foreground"
            }`}
          >
            {match.status}
          </span>

          <button
            type="button"
            onClick={() => setShowDetail(true)}
            className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-accent"
          >
            Dettaglio
          </button>
        </div>
      </article>

      {/* Modal */}
      {showDetail && (
        <MatchDetailModal
          match={match}
          team1Emoji={team1Emoji}
          team2Emoji={team2Emoji}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
