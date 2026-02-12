"use client";

import { useEffect, useCallback } from "react";
import type { CalendarMatch, CalendarMatchStats } from "@/types/calendar";

/* ── Stat config ─────────────────────────────────────────── */

const statRows: { key: keyof CalendarMatchStats; label: string; statOnly?: boolean }[] = [
  { key: "goalAttacker", label: "Gol Attaccante" },
  { key: "goalDefender", label: "Gol Difensore" },
  { key: "autogoalAttacker", label: "Autogol Attaccante" },
  { key: "autogoalDefender", label: "Autogol Difensore" },
  { key: "flash", label: "Flash", statOnly: true },
];

/* ── Component ───────────────────────────────────────────── */

interface MatchDetailModalProps {
  match: CalendarMatch;
  team1Emoji?: string;
  team2Emoji?: string;
  onClose: () => void;
}

export default function MatchDetailModal({
  match,
  team1Emoji,
  team2Emoji,
  onClose,
}: MatchDetailModalProps) {
  /* close on Escape */
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg animate-in fade-in zoom-in-95 rounded-2xl border border-border bg-card p-6 shadow-2xl md:p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Chiudi"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* ── Scoreboard header ── */}
        <div className="mb-8">
          <h2 className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Dettaglio partita
          </h2>

          <div className="flex items-center justify-center gap-4">
            {/* Team 1 */}
            <div className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl font-bold">
                {team1Emoji ?? "⚽"}
              </div>
              <span className="max-w-full truncate text-center text-sm font-semibold text-foreground">
                {match.team1Name}
              </span>
            </div>

            {/* Score */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tabular-nums text-foreground">
                {match.score1}
              </span>
              <span className="text-xl font-bold text-muted-foreground/40">–</span>
              <span className="text-4xl font-black tabular-nums text-foreground">
                {match.score2}
              </span>
            </div>

            {/* Team 2 */}
            <div className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl font-bold">
                {team2Emoji ?? "⚽"}
              </div>
              <span className="max-w-full truncate text-center text-sm font-semibold text-foreground">
                {match.team2Name}
              </span>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {match.status}
          </p>
        </div>

        {/* ── Stats table ── */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Statistiche
          </h3>

          {/* Column headers */}
          <div className="mb-2 grid grid-cols-[1fr_4rem_4rem] items-center gap-x-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span />
            <span className="text-center">{match.team1Name.split(" ").pop()}</span>
            <span className="text-center">{match.team2Name.split(" ").pop()}</span>
          </div>

          <div className="flex flex-col gap-1">
            {statRows.map(({ key, label, statOnly }, i) => (
              <div
                key={key}
                className={`grid grid-cols-[1fr_4rem_4rem] items-center gap-x-2 rounded-xl px-3 py-2.5 ${
                  i % 2 === 0 ? "bg-muted/40" : ""
                }`}
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {label}
                  {statOnly && (
                    <span className="ml-1 text-[10px] text-muted-foreground/60">(solo statistica)</span>
                  )}
                </span>
                <span className="text-center text-sm font-bold tabular-nums text-foreground">
                  {match.team1Stats[key]}
                </span>
                <span className="text-center text-sm font-bold tabular-nums text-foreground">
                  {match.team2Stats[key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
