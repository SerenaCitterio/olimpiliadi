"use client";

import type { Tournament } from "@/types/tournament";
import {
  getTop5Capocannoniere,
  getTop5IlMuro,
  getTop5BoomerangOro,
  getTop5MigliorFotografo,
  type PlayerStatRow,
} from "@/lib/stats";
import { useTeamSelection } from "@/hooks/useTeamSelection";
import TeamDetailModal from "@/components/TeamDetailModal";

interface StatisticheClientProps {
  tournament: Tournament;
}

function StatTable({
  title,
  subtitle,
  emoji,
  rows,
  mainStatLabel,
  mainStatKey,
  onTeamClick,
}: {
  title: string;
  subtitle: string;
  emoji: string;
  rows: PlayerStatRow[];
  mainStatLabel: string;
  mainStatKey: keyof PlayerStatRow;
  onTeamClick: (teamName: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30">
              <th className="py-3 pr-4 text-left font-semibold text-muted-foreground">#</th>
              <th className="py-3 pr-4 text-left font-semibold text-muted-foreground">Giocatore</th>
              <th className="py-3 pr-4 text-left font-semibold text-muted-foreground">Squadra</th>
              <th className="py-3 px-4 text-center font-semibold text-muted-foreground">{mainStatLabel}</th>
              <th className="py-3 px-4 text-center font-semibold text-muted-foreground" title="Gol da attaccante">G (A)</th>
              <th className="py-3 px-4 text-center font-semibold text-muted-foreground" title="Gol da difensore">G (D)</th>
              <th className="py-3 px-4 text-center font-semibold text-muted-foreground">Autogol</th>
              <th className="py-3 px-4 text-center font-semibold text-muted-foreground">Flash</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  Nessun dato
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={`${row.playerName}-${row.teamName}`}
                  className="border-b border-border/20 hover:bg-muted/30"
                >
                  <td className="py-3 pr-4 font-medium text-muted-foreground">{i + 1}</td>
                  <td className="py-3 pr-4 font-medium text-foreground">{row.playerName}</td>
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => onTeamClick(row.teamName)}
                      className="flex items-center gap-2 text-left font-medium text-foreground hover:underline"
                    >
                      <span className="text-base">{row.teamEmoji}</span>
                      {row.teamName}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center font-bold tabular-nums text-foreground">
                    {Number(row[mainStatKey])}
                  </td>
                  <td className="py-3 px-4 text-center tabular-nums text-muted-foreground">
                    {row.goalAttacker}
                  </td>
                  <td className="py-3 px-4 text-center tabular-nums text-muted-foreground">
                    {row.goalDefender}
                  </td>
                  <td className="py-3 px-4 text-center tabular-nums text-muted-foreground">
                    {row.autogoalsTotal}
                  </td>
                  <td className="py-3 px-4 text-center tabular-nums text-muted-foreground">
                    {row.flash}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function StatisticheClient({ tournament }: StatisticheClientProps) {
  const { selected, handleTeamClick, clearSelection } = useTeamSelection(tournament);

  const top5Capocannoniere = getTop5Capocannoniere(tournament);
  const top5IlMuro = getTop5IlMuro(tournament);
  const top5BoomerangOro = getTop5BoomerangOro(tournament);
  const top5MigliorFotografo = getTop5MigliorFotografo(tournament);

  return (
    <>
      <div className="space-y-8">
        <StatTable
          title="Capocannoniere"
          subtitle="Attaccanti con più goal"
          emoji="🏆"
          rows={top5Capocannoniere}
          mainStatLabel="Gol"
          mainStatKey="goalAttacker"
          onTeamClick={handleTeamClick}
        />
        <StatTable
          title="Il muro"
          subtitle="Difensori con più goal"
          emoji="🛡️"
          rows={top5IlMuro}
          mainStatLabel="Gol"
          mainStatKey="goalDefender"
          onTeamClick={handleTeamClick}
        />
        <StatTable
          title="Boomerang d'Oro"
          subtitle="Chi ha realizzato più autogol"
          emoji="🤦‍♂️"
          rows={top5BoomerangOro}
          mainStatLabel="Autogol"
          mainStatKey="autogoalsTotal"
          onTeamClick={handleTeamClick}
        />
        <StatTable
          title="Miglior fotografo"
          subtitle="Chi ha realizzato più flash"
          emoji="📸"
          rows={top5MigliorFotografo}
          mainStatLabel="Flash"
          mainStatKey="flash"
          onTeamClick={handleTeamClick}
        />
      </div>

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
