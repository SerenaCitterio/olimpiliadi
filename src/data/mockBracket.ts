import { Bracket, BracketMatch, BracketTeam } from "@/types/bracket";

const teams: Record<string, BracketTeam> = {
  DRA: { id: "DRA", name: "I Draghi", abbr: "DRA", emoji: "🐉" },
  LUP: { id: "LUP", name: "I Lupi", abbr: "LUP", emoji: "🐺" },
  AQU: { id: "AQU", name: "Le Aquile", abbr: "AQU", emoji: "AQ" },
  FAL: { id: "FAL", name: "I Falchi", abbr: "FAL", emoji: "FA" },
  GHE: { id: "GHE", name: "I Ghepardi", abbr: "GHE", emoji: "GH" },
  COB: { id: "COB", name: "I Cobra", abbr: "COB", emoji: "🐍" },
  MAN: { id: "MAN", name: "Le Mantidi", abbr: "MAN", emoji: "MA" },
  DEL: { id: "DEL", name: "I Delfini", abbr: "DEL", emoji: "🐬" },
};

function m(
  id: string,
  team1: BracketTeam | null,
  team2: BracketTeam | null,
  score1: number | null,
  score2: number | null,
  played: boolean
): BracketMatch {
  return { id, team1, team2, score1, score2, played };
}

export const mockBracket: Bracket = {
  leftRounds: [
    {
      id: "q-left",
      name: "Quarti",
      matches: [
        m("q1", teams.DRA, teams.LUP, 3, 1, true),
        m("q2", teams.AQU, teams.FAL, 2, 0, true),
      ],
    },
    {
      id: "s-left",
      name: "Semifinali",
      matches: [
        m("s1", teams.DRA, teams.AQU, 2, 1, true),
      ],
    },
  ],
  rightRounds: [
    {
      id: "q-right",
      name: "Quarti",
      matches: [
        m("q3", teams.GHE, teams.COB, 4, 2, true),
        m("q4", teams.MAN, teams.DEL, 0, 1, true),
      ],
    },
    {
      id: "s-right",
      name: "Semifinali",
      matches: [
        m("s2", teams.GHE, teams.DEL, 3, 0, true),
      ],
    },
  ],
  final: m("f1", teams.DRA, teams.GHE, 2, 0, true),
};
