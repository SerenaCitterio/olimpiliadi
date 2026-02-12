export interface BracketTeam {
  id: string;
  name: string;
  abbr: string; // 3 lettere es. "DRA", "LUP"
  emoji: string;
}

export interface BracketMatch {
  id: string;
  team1: BracketTeam | null;
  team2: BracketTeam | null;
  score1: number | null;
  score2: number | null;
  played: boolean;
}

export interface BracketRound {
  id: string;
  name: string;
  matches: BracketMatch[];
}

export interface Bracket {
  leftRounds: BracketRound[];
  rightRounds: BracketRound[];
  final: BracketMatch;
}
