import type { Team, GroupStanding, Group, Tournament } from "@/types/tournament";

/* ── Shared type used by client components ───────────────── */

export interface TeamWithGroup {
  team: Team;
  groupId: string;
  groupName: string;
  group: Group;
  standing: GroupStanding | undefined;
}

/* ── Helpers (pure functions, no server deps) ────────────── */

export function findTeamByName(
  tournament: Tournament,
  name: string,
): TeamWithGroup | null {
  for (const group of tournament.groups) {
    const team = group.teams.find((t) => t.name === name);
    if (team) {
      return {
        team,
        groupId: group.id,
        groupName: group.name,
        group,
        standing: group.standings.find((s) => s.teamId === team.id),
      };
    }
  }
  return null;
}

export function findTeamByPlayerName(
  tournament: Tournament,
  playerName: string,
): TeamWithGroup | null {
  for (const group of tournament.groups) {
    const team = group.teams.find(
      (t) => t.defender === playerName || t.attacker === playerName
    );
    if (team) {
      return {
        team,
        groupId: group.id,
        groupName: group.name,
        group,
        standing: group.standings.find((s) => s.teamId === team.id),
      };
    }
  }
  return null;
}
