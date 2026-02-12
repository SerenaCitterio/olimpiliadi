export interface Team {
  id: string;
  name: string;
  emoji: string;
  defender: string;
  attacker: string;
}

export interface TeamMatchStats {
  flash: number;
  goalAttacker: number;
  goalDefender: number;
  autogoalAttacker: number;
  autogoalDefender: number;
}

export interface Match {
  id: string;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  team1Stats: TeamMatchStats;
  team2Stats: TeamMatchStats;
}

export interface GroupStanding {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Group {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
  standings: GroupStanding[];
}

export interface Tournament {
  groups: Group[];
}
