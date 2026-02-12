import { Group } from "@/types/tournament";

interface GroupStandingsProps {
  group: Group;
  onTeamClick?: (teamName: string) => void;
}

export default function GroupStandings({ group, onTeamClick }: GroupStandingsProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg h-full">
      <h2 className="text-2xl font-bold mb-6 text-foreground">
        {group.name}
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground" title="Posizione in classifica">
                <span className="group relative cursor-help border-b border-dotted border-muted-foreground">
                  Pos
                  <span className="absolute left-0 top-full z-10 mt-1.5 hidden w-40 rounded-xl bg-zinc-700 px-3 py-2 text-xs font-medium text-zinc-100 shadow-lg ring-1 ring-border group-hover:block">
                    Posizione in classifica
                  </span>
                </span>
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Squadra</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                <span className="group relative cursor-help border-b border-dotted border-muted-foreground" title="Partite giocate">
                  G
                  <span className="absolute left-1/2 top-full z-10 mt-1.5 hidden w-36 -translate-x-1/2 rounded-xl bg-zinc-700 px-3 py-2 text-xs font-medium text-zinc-100 shadow-lg ring-1 ring-border group-hover:block">
                    Partite giocate
                  </span>
                </span>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                <span className="group relative cursor-help border-b border-dotted border-muted-foreground" title="Vittorie">
                  V
                  <span className="absolute left-1/2 top-full z-10 mt-1.5 hidden w-28 -translate-x-1/2 rounded-xl bg-zinc-700 px-3 py-2 text-xs font-medium text-zinc-100 shadow-lg ring-1 ring-border group-hover:block">
                    Vittorie
                  </span>
                </span>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                <span className="group relative cursor-help border-b border-dotted border-muted-foreground" title="Sconfitte">
                  P
                  <span className="absolute left-1/2 top-full z-10 mt-1.5 hidden w-28 -translate-x-1/2 rounded-xl bg-zinc-700 px-3 py-2 text-xs font-medium text-zinc-100 shadow-lg ring-1 ring-border group-hover:block">
                    Sconfitte
                  </span>
                </span>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                <span className="group relative cursor-help border-b border-dotted border-muted-foreground" title="Gol fatti">
                  GF
                  <span className="absolute left-1/2 top-full z-10 mt-1.5 hidden w-28 -translate-x-1/2 rounded-xl bg-zinc-700 px-3 py-2 text-xs font-medium text-zinc-100 shadow-lg ring-1 ring-border group-hover:block">
                    Gol fatti
                  </span>
                </span>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                <span className="group relative cursor-help border-b border-dotted border-muted-foreground" title="Gol subiti">
                  GS
                  <span className="absolute left-1/2 top-full z-10 mt-1.5 hidden w-28 -translate-x-1/2 rounded-xl bg-zinc-700 px-3 py-2 text-xs font-medium text-zinc-100 shadow-lg ring-1 ring-border group-hover:block">
                    Gol subiti
                  </span>
                </span>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                <span className="group relative cursor-help border-b border-dotted border-muted-foreground" title="Differenza reti">
                  DR
                  <span className="absolute left-1/2 top-full z-10 mt-1.5 hidden w-36 -translate-x-1/2 rounded-xl bg-zinc-700 px-3 py-2 text-xs font-medium text-zinc-100 shadow-lg ring-1 ring-border group-hover:block">
                    Differenza reti
                  </span>
                </span>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                <span className="group relative cursor-help border-b border-dotted border-muted-foreground" title="Punti">
                  <span className="font-bold text-foreground">
                    P
                  </span>
                  <span className="absolute left-1/2 top-full z-10 mt-1.5 hidden w-24 -translate-x-1/2 rounded-xl bg-zinc-700 px-3 py-2 text-xs font-medium text-zinc-100 shadow-lg ring-1 ring-border group-hover:block">
                    Punti
                  </span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {group.standings.map((standing, index) => {
              const isTopTwo = index < 2;
              
              return (
                <tr
                  key={standing.teamId}
                  className={`border-b border-border/20 transition-colors hover:bg-accent/50 ${
                    isTopTwo ? "bg-muted/50" : ""
                  }`}
                >
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        index === 0
                          ? "bg-amber-400 text-amber-950"
                          : index === 1
                          ? "bg-zinc-400 text-zinc-900"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-foreground">
                    <button
                      type="button"
                      onClick={() => onTeamClick?.(standing.teamName)}
                      className="text-left hover:underline"
                    >
                      {standing.teamName}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-center text-muted-foreground">
                    {standing.played}
                  </td>
                  <td className="py-4 px-4 text-center text-muted-foreground">
                    {standing.won}
                  </td>
                  <td className="py-4 px-4 text-center text-muted-foreground">
                    {standing.lost}
                  </td>
                  <td className="py-4 px-4 text-center text-muted-foreground">
                    {standing.goalsFor}
                  </td>
                  <td className="py-4 px-4 text-center text-muted-foreground">
                    {standing.goalsAgainst}
                  </td>
                  <td
                    className={`py-4 px-4 text-center font-medium ${
                      standing.goalDifference > 0
                        ? "text-green-400"
                        : standing.goalDifference < 0
                        ? "text-red-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {standing.goalDifference > 0 ? "+" : ""}
                    {standing.goalDifference}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg">
                      {standing.points}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
