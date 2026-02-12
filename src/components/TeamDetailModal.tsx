"use client";

import { useEffect, useCallback, useMemo } from "react";
import { Team, GroupStanding, Group } from "@/types/tournament";

interface TeamDetailModalProps {
  team: Team;
  groupId: string;
  groupName: string;
  group: Group;
  standing: GroupStanding | undefined;
  onClose: () => void;
}

function usePlayerStats(group: Group, teamId: string) {
  return useMemo(() => {
    let defenderGoals = 0;
    let defenderAutogoals = 0;
    let attackerGoals = 0;
    let attackerAutogoals = 0;
    let attackerFlash = 0;

    for (const m of group.matches) {
      if (m.team1 === teamId) {
        defenderGoals += m.team1Stats.goalDefender;
        defenderAutogoals += m.team1Stats.autogoalDefender;
        attackerGoals += m.team1Stats.goalAttacker;
        attackerAutogoals += m.team1Stats.autogoalAttacker;
        attackerFlash += m.team1Stats.flash;
      } else if (m.team2 === teamId) {
        defenderGoals += m.team2Stats.goalDefender;
        defenderAutogoals += m.team2Stats.autogoalDefender;
        attackerGoals += m.team2Stats.goalAttacker;
        attackerAutogoals += m.team2Stats.autogoalAttacker;
        attackerFlash += m.team2Stats.flash;
      }
    }

    return {
      defender: { goals: defenderGoals, autogoals: defenderAutogoals },
      attacker: { goals: attackerGoals, autogoals: attackerAutogoals, flash: attackerFlash },
    };
  }, [group, teamId]);
}

export default function TeamDetailModal({
  team,
  groupId,
  groupName,
  group,
  standing,
  onClose,
}: TeamDetailModalProps) {
  const playerStats = usePlayerStats(group, team.id);

  const defenderHasStats =
    playerStats.defender.goals > 0 || playerStats.defender.autogoals > 0;
  const attackerHasStats =
    playerStats.attacker.goals > 0 ||
    playerStats.attacker.autogoals > 0 ||
    playerStats.attacker.flash > 0;

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
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl border border-border bg-card p-6 shadow-2xl md:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Chiudi"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-3xl font-bold">
            {team.emoji}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-foreground">{team.name}</h2>
            <p className="text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
                  {groupId}
                </span>
                {groupName}
              </span>
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Giocatori
          </h3>

          {/* Defender — statistiche sempre visibili se > 0 */}
          <div className="rounded-xl bg-muted/40 px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/15">
                <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 4v6c0 5-7 10-7 10S5 17 5 12V6l7-4z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{team.defender}</p>
                <p className="text-xs text-muted-foreground">Difensore</p>
                {defenderHasStats && (
                  <p className="mt-1 text-xs text-foreground">
                    Gol {playerStats.defender.goals} · Autogol {playerStats.defender.autogoals}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Attacker — statistiche sempre visibili se > 0 */}
          <div className="rounded-xl bg-muted/40 px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
                <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{team.attacker}</p>
                <p className="text-xs text-muted-foreground">Attaccante</p>
                {attackerHasStats && (
                  <p className="mt-1 text-xs text-foreground">
                    Gol {playerStats.attacker.goals} · Autogol {playerStats.attacker.autogoals} · Flash {playerStats.attacker.flash}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {standing && (
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Statistiche squadra
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "G", value: standing.played, tooltip: "Partite giocate" },
                { label: "V", value: standing.won, tooltip: "Vittorie" },
                { label: "N", value: standing.drawn, tooltip: "Pareggi" },
                { label: "P", value: standing.lost, tooltip: "Sconfitte" },
              ].map(({ label, value, tooltip }) => (
                <div
                  key={label}
                  className="group relative flex cursor-help flex-col items-center rounded-xl bg-muted/40 py-2.5"
                  title={tooltip}
                >
                  <span className="text-lg font-bold tabular-nums text-foreground">{value}</span>
                  <span className="text-[10px] font-medium uppercase text-muted-foreground border-b border-dotted border-muted-foreground">
                    {label}
                  </span>
                  <span className="absolute left-1/2 top-full z-10 mt-1.5 hidden w-28 -translate-x-1/2 rounded-xl bg-zinc-700 px-3 py-2 text-xs font-medium text-zinc-100 shadow-lg ring-1 ring-border group-hover:block">
                    {tooltip}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "GF", value: standing.goalsFor, tooltip: "Gol fatti" },
                { label: "GS", value: standing.goalsAgainst, tooltip: "Gol subiti" },
                { label: "Punti", value: standing.points, tooltip: "Punti" },
              ].map(({ label, value, tooltip }) => (
                <div
                  key={label}
                  className="group relative flex cursor-help flex-col items-center rounded-xl bg-muted/40 py-2.5"
                  title={tooltip}
                >
                  <span className="text-lg font-bold tabular-nums text-foreground">{value}</span>
                  <span className="text-[10px] font-medium uppercase text-muted-foreground border-b border-dotted border-muted-foreground">
                    {label}
                  </span>
                  <span className="absolute left-1/2 top-full z-10 mt-1.5 hidden w-28 -translate-x-1/2 rounded-xl bg-zinc-700 px-3 py-2 text-xs font-medium text-zinc-100 shadow-lg ring-1 ring-border group-hover:block">
                    {tooltip}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
