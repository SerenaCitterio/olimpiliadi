export type MatchStatus =
  | "Fischio finale"
  | "In diretta"
  | "Da giocare"
  | "Rinviata";

export interface CalendarMatchStats {
  flash: number;
  goalAttacker: number;
  goalDefender: number;
  autogoalAttacker: number;
  autogoalDefender: number;
}

export interface CalendarMatch {
  id: string;
  team1Name: string;
  team2Name: string;
  score1: number;
  score2: number;
  status: MatchStatus;
  team1Stats: CalendarMatchStats;
  team2Stats: CalendarMatchStats;
}

export interface CalendarDay {
  id: string;
  date: Date;
  dateLabel: string; // e.g. "martedì 22 luglio 2025"
  roundLabel: string; // e.g. "Giornata 1 - Fase a gironi"
  matches: CalendarMatch[];
}
