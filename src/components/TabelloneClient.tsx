"use client";

import type { Tournament } from "@/types/tournament";
import type { Bracket as BracketType } from "@/types/bracket";
import { useTeamSelection } from "@/hooks/useTeamSelection";
import Bracket from "@/components/Bracket";
import TeamDetailModal from "@/components/TeamDetailModal";

interface TabelloneClientProps {
  tournament: Tournament;
  bracket: BracketType;
}

function isBracketEmpty(bracket: BracketType): boolean {
  const allMatches = [
    ...bracket.leftRounds.flatMap((r) => r.matches),
    ...bracket.rightRounds.flatMap((r) => r.matches),
    bracket.final,
  ];
  return allMatches.every((m) => m.team1 === null && m.team2 === null);
}

export default function TabelloneClient({
  tournament,
  bracket,
}: TabelloneClientProps) {
  const { selected, handleTeamClick, clearSelection } = useTeamSelection(tournament);
  const empty = isBracketEmpty(bracket);

  return (
    <>
      <div className="w-full max-w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Il Tabellone
          </h1>
          <p className="mt-2 text-muted-foreground">
            Fase finale
          </p>
        </header>

        {empty ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/30 px-6 py-20 text-center">
            <span className="text-5xl">&#9203;</span>
            <h2 className="mt-6 text-xl font-bold text-foreground md:text-2xl">
              Un attimo di pazienza
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              I gironi stanno ancora giocando: la fase finale arriva a breve!
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-card/30 p-4 md:p-6 lg:p-8">
              <Bracket data={bracket} onTeamClick={handleTeamClick} />
            </div>

            <p className="mt-6 text-left text-sm text-muted-foreground">
              Eliminazione diretta · 8 squadre
            </p>
          </>
        )}
      </div>

      {/* Modal */}
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
    </>
  );
}
