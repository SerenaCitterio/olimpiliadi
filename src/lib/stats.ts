import type { Tournament, Group, Team } from "@/types/tournament";

export interface StatWinner {
  name: string;
  value: number;
  isTie: boolean;
}

export interface TournamentStats {
  capocannoniere: StatWinner | null;
  ilMuro: StatWinner | null;
  boomerangOro: StatWinner | null;
  migliorFotografo: StatWinner | null;
}

/** Statistiche complete di un giocatore (per tabella top 5) */
export interface PlayerStatRow {
  playerName: string;
  teamName: string;
  teamEmoji: string;
  role: "attacker" | "defender";
  goalAttacker: number;
  goalDefender: number;
  autogoalAttacker: number;
  autogoalDefender: number;
  autogoalsTotal: number;
  flash: number;
}

function findTeamById(group: Group, id: string): Team | undefined {
  return group.teams.find((t) => t.id === id);
}

/** Aggrega tutte le statistiche per giocatore con squadra. */
function buildPlayerStatsMap(tournament: Tournament): Map<string, PlayerStatRow> {
  const map = new Map<string, PlayerStatRow>();

  for (const group of tournament.groups) {
    for (const team of group.teams) {
      const attackerKey = `attacker:${team.attacker}:${team.id}`;
      const defenderKey = `defender:${team.defender}:${team.id}`;
      if (!map.has(attackerKey)) {
        map.set(attackerKey, {
          playerName: team.attacker,
          teamName: team.name,
          teamEmoji: team.emoji,
          role: "attacker",
          goalAttacker: 0,
          goalDefender: 0,
          autogoalAttacker: 0,
          autogoalDefender: 0,
          autogoalsTotal: 0,
          flash: 0,
        });
      }
      if (!map.has(defenderKey)) {
        map.set(defenderKey, {
          playerName: team.defender,
          teamName: team.name,
          teamEmoji: team.emoji,
          role: "defender",
          goalAttacker: 0,
          goalDefender: 0,
          autogoalAttacker: 0,
          autogoalDefender: 0,
          autogoalsTotal: 0,
          flash: 0,
        });
      }
    }
  }

  for (const group of tournament.groups) {
    for (const m of group.matches) {
      const t1 = findTeamById(group, m.team1);
      const t2 = findTeamById(group, m.team2);

      if (t1) {
        const aKey = `attacker:${t1.attacker}:${t1.id}`;
        const dKey = `defender:${t1.defender}:${t1.id}`;
        const ar = map.get(aKey)!;
        const dr = map.get(dKey)!;
        ar.goalAttacker += m.team1Stats.goalAttacker;
        ar.autogoalAttacker += m.team1Stats.autogoalAttacker;
        ar.flash += m.team1Stats.flash;
        dr.goalDefender += m.team1Stats.goalDefender;
        dr.autogoalDefender += m.team1Stats.autogoalDefender;
      }
      if (t2) {
        const aKey = `attacker:${t2.attacker}:${t2.id}`;
        const dKey = `defender:${t2.defender}:${t2.id}`;
        const ar = map.get(aKey)!;
        const dr = map.get(dKey)!;
        ar.goalAttacker += m.team2Stats.goalAttacker;
        ar.autogoalAttacker += m.team2Stats.autogoalAttacker;
        ar.flash += m.team2Stats.flash;
        dr.goalDefender += m.team2Stats.goalDefender;
        dr.autogoalDefender += m.team2Stats.autogoalDefender;
      }
    }
  }

  for (const row of map.values()) {
    row.autogoalsTotal = row.autogoalAttacker + row.autogoalDefender;
  }
  return map;
}

/** Top 5 per una metrica, con tutte le statistiche in tabella. */
export function getTop5Capocannoniere(tournament: Tournament): PlayerStatRow[] {
  const map = buildPlayerStatsMap(tournament);
  const onlyAttackers = [...map.values()].filter((r) => r.role === "attacker");
  return onlyAttackers
    .sort((a, b) => b.goalAttacker - a.goalAttacker)
    .slice(0, 5);
}

export function getTop5IlMuro(tournament: Tournament): PlayerStatRow[] {
  const map = buildPlayerStatsMap(tournament);
  const onlyDefenders = [...map.values()].filter((r) => r.role === "defender");
  return onlyDefenders
    .sort((a, b) => b.goalDefender - a.goalDefender)
    .slice(0, 5);
}

export function getTop5BoomerangOro(tournament: Tournament): PlayerStatRow[] {
  const map = buildPlayerStatsMap(tournament);
  const all = [...map.values()];
  return all
    .sort((a, b) => b.autogoalsTotal - a.autogoalsTotal)
    .slice(0, 5);
}

export function getTop5MigliorFotografo(tournament: Tournament): PlayerStatRow[] {
  const map = buildPlayerStatsMap(tournament);
  const onlyAttackers = [...map.values()].filter((r) => r.role === "attacker");
  return onlyAttackers
    .sort((a, b) => b.flash - a.flash)
    .slice(0, 5);
}

function getMaxEntry(
  map: Map<string, number>
): { name: string; value: number; isTie: boolean } | null {
  let maxNames: string[] = [];
  let maxVal = 0;
  for (const [name, value] of map) {
    if (value > maxVal) {
      maxVal = value;
      maxNames = [name];
    } else if (value === maxVal && maxVal > 0) {
      maxNames.push(name);
    }
  }
  if (maxNames.length === 0 || maxVal === 0) {
    return null;
  }
  return {
    name: maxNames.length === 1 ? maxNames[0] : maxNames.join(", "),
    value: maxVal,
    isTie: maxNames.length > 1,
  };
}

export function getTournamentStats(tournament: Tournament): TournamentStats {
  const attackerGoals = new Map<string, number>();
  const defenderGoals = new Map<string, number>();
  const autogoals = new Map<string, number>();
  const flash = new Map<string, number>();

  for (const group of tournament.groups) {
    for (const m of group.matches) {
      const t1 = findTeamById(group, m.team1);
      const t2 = findTeamById(group, m.team2);

      if (t1) {
        const a1 = t1.attacker;
        const d1 = t1.defender;
        attackerGoals.set(a1, (attackerGoals.get(a1) ?? 0) + m.team1Stats.goalAttacker);
        defenderGoals.set(d1, (defenderGoals.get(d1) ?? 0) + m.team1Stats.goalDefender);
        autogoals.set(a1, (autogoals.get(a1) ?? 0) + m.team1Stats.autogoalAttacker);
        autogoals.set(d1, (autogoals.get(d1) ?? 0) + m.team1Stats.autogoalDefender);
        flash.set(a1, (flash.get(a1) ?? 0) + m.team1Stats.flash);
      }
      if (t2) {
        const a2 = t2.attacker;
        const d2 = t2.defender;
        attackerGoals.set(a2, (attackerGoals.get(a2) ?? 0) + m.team2Stats.goalAttacker);
        defenderGoals.set(d2, (defenderGoals.get(d2) ?? 0) + m.team2Stats.goalDefender);
        autogoals.set(a2, (autogoals.get(a2) ?? 0) + m.team2Stats.autogoalAttacker);
        autogoals.set(d2, (autogoals.get(d2) ?? 0) + m.team2Stats.autogoalDefender);
        flash.set(a2, (flash.get(a2) ?? 0) + m.team2Stats.flash);
      }
    }
  }

  return {
    capocannoniere: getMaxEntry(attackerGoals),
    ilMuro: getMaxEntry(defenderGoals),
    boomerangOro: getMaxEntry(autogoals),
    migliorFotografo: getMaxEntry(flash),
  };
}
