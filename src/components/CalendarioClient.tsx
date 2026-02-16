"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Tournament } from "@/types/tournament";
import type { CalendarDay } from "@/types/calendar";
import { findTeamByName } from "@/lib/team-utils";
import { useTeamSelection } from "@/hooks/useTeamSelection";
import MatchCard from "@/components/MatchCard";
import TeamDetailModal from "@/components/TeamDetailModal";
import NewMatchModal from "@/components/NewMatchModal";

/* ── helpers ────────────────────────────────────────────── */

function getEmoji(tournament: Tournament, name: string): string | undefined {
  return findTeamByName(tournament, name)?.team.emoji;
}

/** Capitalize first letter of each word in dateLabel. */
function capitalize(label: string): string {
  return label.replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── component ──────────────────────────────────────────── */

interface CalendarioClientProps {
  tournament: Tournament;
  calendarDays: CalendarDay[];
}

export default function CalendarioClient({
  tournament,
  calendarDays,
}: CalendarioClientProps) {
  const router = useRouter();
  const { selected, handleTeamClick, clearSelection } = useTeamSelection(tournament);
  const [showNewMatch, setShowNewMatch] = useState(false);
  const empty = calendarDays.length === 0;

  const allTeams = useMemo(
    () =>
      tournament.groups.flatMap((g) => g.teams),
    [tournament]
  );

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Calendario
            </h1>
            <p className="mt-2 text-muted-foreground">
              Tutte le partite del torneo
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewMatch(true)}
            className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
          >
            + Nuova partita
          </button>
        </header>

        {empty ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/30 px-6 py-20 text-center">
            <span className="text-5xl">&#128197;</span>
            <h2 className="mt-6 text-xl font-bold text-foreground md:text-2xl">
              Un attimo di pazienza
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              Il calendario non è ancora disponibile: le partite verranno pubblicate a breve!
            </p>
          </div>
        ) : (
          calendarDays.map((day) => (
            <section key={day.id} className="mb-12 last:mb-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {capitalize(day.dateLabel)}
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {day.roundLabel}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {day.matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    team1Emoji={getEmoji(tournament, match.team1Name)}
                    team2Emoji={getEmoji(tournament, match.team2Name)}
                    onTeamClick={handleTeamClick}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Team detail modal */}
      {selected && (
        <TeamDetailModal
          team={selected.team}
          groupId={selected.groupId}
          groupName={selected.groupName}
          group={selected.group}
          standing={selected.standing}
          onClose={clearSelection}
        />
      )}

      {/* New match modal */}
      {showNewMatch && (
        <NewMatchModal
          teams={allTeams}
          onClose={() => setShowNewMatch(false)}
          onSaved={() => router.refresh()}
        />
      )}
    </>
  );
}
