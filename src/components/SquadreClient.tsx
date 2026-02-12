"use client";

import { useState, useMemo } from "react";
import type { Tournament } from "@/types/tournament";
import { type TeamWithGroup } from "@/lib/team-utils";
import { useTeamSelection } from "@/hooks/useTeamSelection";
import TeamDetailModal from "@/components/TeamDetailModal";

/* ── helpers ─────────────────────────────────────────────── */

function buildAllTeams(tournament: Tournament): TeamWithGroup[] {
  return tournament.groups.flatMap((group) =>
    group.teams.map((team) => ({
      team,
      groupId: group.id,
      groupName: group.name,
      group,
      standing: group.standings.find((s) => s.teamId === team.id),
    })),
  );
}

/* ── component ──────────────────────────────────────────── */

interface SquadreClientProps {
  tournament: Tournament;
}

export default function SquadreClient({ tournament }: SquadreClientProps) {
  const groupIds = tournament.groups.map((g) => g.id);
  const allTeams = useMemo(() => buildAllTeams(tournament), [tournament]);
  const { selected, clearSelection } = useTeamSelection(tournament);
  const [selectedEntry, setSelectedEntry] = useState<TeamWithGroup | null>(null);
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allTeams.filter((entry) => {
      if (activeGroup && entry.groupId !== activeGroup) return false;
      if (!q) return true;
      return (
        entry.team.name.toLowerCase().includes(q) ||
        entry.team.defender.toLowerCase().includes(q) ||
        entry.team.attacker.toLowerCase().includes(q)
      );
    });
  }, [search, activeGroup, allTeams]);

  // Use local selection for this page since clicking directly gives full TeamWithGroup
  const activeSelection = selectedEntry ?? selected;

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Le Squadre
          </h1>
          <p className="mt-2 text-muted-foreground">
            Tutte le squadre del torneo
          </p>
        </header>

        {/* ── Toolbar: search + group filter ── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca squadra o giocatore..."
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1.5" role="group" aria-label="Filtra per girone">
            <button
              onClick={() => setActiveGroup(null)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                activeGroup === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Tutti
            </button>
            {groupIds.map((gId) => (
              <button
                key={gId}
                onClick={() =>
                  setActiveGroup(activeGroup === gId ? null : gId)
                }
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  activeGroup === gId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {gId}
              </button>
            ))}
          </div>
        </div>

        {/* ── Team grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((entry) => (
              <button
                key={entry.team.id}
                onClick={() => setSelectedEntry(entry)}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-lg transition-all hover:border-primary/30 md:p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl font-bold">
                  {entry.team.emoji}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {entry.team.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-3 w-3 shrink-0 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 2l7 4v6c0 5-7 10-7 10S5 17 5 12V6l7-4z"
                        />
                      </svg>
                      <span>{entry.team.defender}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-3 w-3 shrink-0 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>{entry.team.attacker}</span>
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-center gap-1">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                    {entry.groupId}
                  </span>
                  {entry.standing && (
                    <span className="text-xs font-bold tabular-nums text-muted-foreground">
                      {entry.standing.points} pt
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[20vh] items-center justify-center rounded-2xl border border-dashed border-border bg-card/30">
            <p className="text-sm text-muted-foreground">
              Nessuna squadra trovata.
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {filtered.length} di {allTeams.length} squadre &middot;{" "}
          {tournament.groups.length} gironi
        </p>
      </div>

      {/* Modal */}
      {activeSelection && (
        <TeamDetailModal
          team={activeSelection.team}
          groupId={activeSelection.groupId}
          groupName={activeSelection.groupName}
          group={activeSelection.group}
          standing={activeSelection.standing}
          onClose={() => {
            setSelectedEntry(null);
            clearSelection();
          }}
        />
      )}
    </>
  );
}
