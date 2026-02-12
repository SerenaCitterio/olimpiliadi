/**
 * Server-only data fetching layer.
 * Do NOT import this file from "use client" components — use @/lib/team-utils instead.
 */

import {
  type Team,
  type Match,
  type Group,
  type GroupStanding,
  type Tournament,
} from "@/types/tournament";
import type { CalendarDay, CalendarMatch, MatchStatus } from "@/types/calendar";
import type {
  Bracket,
  BracketMatch,
  BracketRound,
  BracketTeam,
} from "@/types/bracket";
import {
  fetchTeams,
  fetchMatches,
  fetchBracket,
  isSheetsConfigured,
  type RawTeamRow,
  type RawMatchRow,
  type RawBracketRow,
} from "./sheets";

/* ── Standings calculator ────────────────────────────────── */

function calculateStandings(
  teams: Team[],
  matches: Match[],
): GroupStanding[] {
  const map = new Map<string, GroupStanding>();

  for (const team of teams) {
    map.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    const s1 = map.get(match.team1);
    const s2 = map.get(match.team2);
    if (!s1 || !s2) continue;

    s1.played++;
    s2.played++;
    s1.goalsFor += match.score1;
    s1.goalsAgainst += match.score2;
    s2.goalsFor += match.score2;
    s2.goalsAgainst += match.score1;

    const isVantaggi = Math.max(match.score1, match.score2) > 10;

    if (match.score1 > match.score2) {
      s1.won++;
      s2.lost++;
      if (isVantaggi) {
        s1.points += 2;
        s2.points += 1;
      } else {
        s1.points += 3;
      }
    } else if (match.score1 < match.score2) {
      s2.won++;
      s1.lost++;
      if (isVantaggi) {
        s2.points += 2;
        s1.points += 1;
      } else {
        s2.points += 3;
      }
    } else {
      s1.drawn++;
      s2.drawn++;
      s1.points += 1;
      s2.points += 1;
    }
  }

  // Compute goal difference and sort
  const standings = Array.from(map.values());
  for (const s of standings) {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
  }

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return standings;
}

/* ── Assemblers (from Google Sheets raw rows) ────────────── */

function assembleTeam(row: RawTeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    defender: row.defender,
    attacker: row.attacker,
  };
}

function assembleTournament(
  teamRows: RawTeamRow[],
  matchRows: RawMatchRow[],
): Tournament {
  // Group teams by groupId
  const groupMap = new Map<string, { id: string; name: string; teams: Team[]; matches: Match[] }>();

  for (const row of teamRows) {
    if (!groupMap.has(row.groupId)) {
      groupMap.set(row.groupId, {
        id: row.groupId,
        name: row.groupName,
        teams: [],
        matches: [],
      });
    }
    groupMap.get(row.groupId)!.teams.push(assembleTeam(row));
  }

  // Assign matches to groups — only rows with a date filled in
  const datedMatchRows = matchRows.filter((r) => r.date.trim() !== "");
  for (const row of datedMatchRows) {
    const team = teamRows.find((t) => t.id === row.team1Id);
    if (!team) continue;
    const group = groupMap.get(team.groupId);
    if (!group) continue;

    group.matches.push({
      id: row.id,
      team1: row.team1Id,
      team2: row.team2Id,
      score1: row.score1,
      score2: row.score2,
      team1Stats: row.team1Stats,
      team2Stats: row.team2Stats,
    });
  }

  // Build groups with calculated standings
  const groups: Group[] = Array.from(groupMap.values())
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((g) => ({
      ...g,
      standings: calculateStandings(g.teams, g.matches),
    }));

  return { groups };
}

function assembleCalendar(
  matchRows: RawMatchRow[],
  teamRows: RawTeamRow[],
): CalendarDay[] {
  const teamMap = new Map(teamRows.map((t) => [t.id, t.name]));

  // Only include matches with a date filled in
  const datedRows = matchRows.filter((r) => r.date.trim() !== "");

  // Group matches by date
  const dayMap = new Map<string, { date: string; matches: RawMatchRow[] }>();

  for (const row of datedRows) {
    const key = row.date;
    if (!dayMap.has(key)) {
      dayMap.set(key, { date: row.date, matches: [] });
    }
    dayMap.get(key)!.matches.push(row);
  }

  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, day], i) => ({
      id: `day-${i + 1}`,
      date: new Date(day.date),
      dateLabel: day.date,
      roundLabel: `Giornata ${i + 1}`,
      matches: day.matches.map(
        (m): CalendarMatch => ({
          id: m.id,
          team1Name: teamMap.get(m.team1Id) ?? m.team1Id,
          team2Name: teamMap.get(m.team2Id) ?? m.team2Id,
          score1: m.score1,
          score2: m.score2,
          status: "Fischio finale" as MatchStatus,
          team1Stats: m.team1Stats,
          team2Stats: m.team2Stats,
        }),
      ),
    }));
}

function assembleBracket(
  bracketRows: RawBracketRow[],
  teamRows: RawTeamRow[],
): Bracket {
  const teamMap = new Map(teamRows.map((t) => [t.id, t]));

  function toBracketTeam(id: string): BracketTeam | null {
    const t = teamMap.get(id);
    if (!t) return null;
    return {
      id: t.id,
      name: t.name,
      abbr: t.id.replace(/^[A-Z]/, "").length >= 3
        ? t.name.substring(0, 3).toUpperCase()
        : t.id,
      emoji: t.emoji,
    };
  }

  function toBracketMatch(row: RawBracketRow): BracketMatch {
    return {
      id: row.id,
      team1: row.team1Id ? toBracketTeam(row.team1Id) : null,
      team2: row.team2Id ? toBracketTeam(row.team2Id) : null,
      score1: row.played ? row.score1 : null,
      score2: row.played ? row.score2 : null,
      played: row.played,
    };
  }

  // Separate rows by round and side
  const leftQF = bracketRows.filter((r) => r.round === "Quarti" && r.side === "left");
  const leftSF = bracketRows.filter((r) => r.round === "Semifinali" && r.side === "left");
  const rightQF = bracketRows.filter((r) => r.round === "Quarti" && r.side === "right");
  const rightSF = bracketRows.filter((r) => r.round === "Semifinali" && r.side === "right");
  const finalRow = bracketRows.find((r) => r.round === "Finale");

  const leftRounds: BracketRound[] = [
    { id: "q-left", name: "Quarti", matches: leftQF.map(toBracketMatch) },
    { id: "s-left", name: "Semifinali", matches: leftSF.map(toBracketMatch) },
  ];

  const rightRounds: BracketRound[] = [
    { id: "q-right", name: "Quarti", matches: rightQF.map(toBracketMatch) },
    { id: "s-right", name: "Semifinali", matches: rightSF.map(toBracketMatch) },
  ];

  const final: BracketMatch = finalRow
    ? toBracketMatch(finalRow)
    : { id: "f1", team1: null, team2: null, score1: null, score2: null, played: false };

  return { leftRounds, rightRounds, final };
}

/* ── Logging helper ───────────────────────────────────────── */

type DataSource = "sheets" | "mock";
type DataKind = "tournament" | "calendar" | "bracket";

function logSource(kind: DataKind, source: DataSource, reason?: string) {
  const label = source === "sheets" ? "Google Sheets" : "mock data (sviluppo)";
  const extra = reason ? ` — ${reason}` : "";
  console.log(`[data] ${kind}: caricato da ${label}${extra}`);
}

/* ── Public data loaders ─────────────────────────────────── */

/**
 * Load tournament data from Google Sheets, or fall back to mock data.
 * Designed for use in Next.js Server Components.
 *
 * Fallback triggers:
 *  - Google Sheets env vars are missing
 *  - USE_MOCK_DATA=true is set
 *  - Google Sheets API call fails at runtime
 */
export async function getTournamentData(): Promise<Tournament> {
  if (!isSheetsConfigured()) {
    logSource("tournament", "mock", "sheets non configurato");
    const { mockTournament } = await import("@/data/mockData");
    return mockTournament;
  }

  const [teamRows, matchRows] = await Promise.all([
    fetchTeams(),
    fetchMatches(),
  ]);

  if (!teamRows || !matchRows) {
    logSource("tournament", "mock", "fetch da sheets fallito");
    const { mockTournament } = await import("@/data/mockData");
    return mockTournament;
  }

  logSource("tournament", "sheets");
  return assembleTournament(teamRows, matchRows);
}

/**
 * Load calendar data from Google Sheets, or fall back to mock data.
 */
export async function getCalendarData(): Promise<CalendarDay[]> {
  if (!isSheetsConfigured()) {
    logSource("calendar", "mock", "sheets non configurato");
    const { mockCalendarDays } = await import("@/data/mockCalendar");
    return mockCalendarDays;
  }

  const [teamRows, matchRows] = await Promise.all([
    fetchTeams(),
    fetchMatches(),
  ]);

  if (!teamRows || !matchRows) {
    logSource("calendar", "mock", "fetch da sheets fallito");
    const { mockCalendarDays } = await import("@/data/mockCalendar");
    return mockCalendarDays;
  }

  logSource("calendar", "sheets");
  return assembleCalendar(matchRows, teamRows);
}

/**
 * Load bracket data from Google Sheets, or fall back to mock data.
 */
export async function getBracketData(): Promise<Bracket> {
  if (!isSheetsConfigured()) {
    logSource("bracket", "mock", "sheets non configurato");
    const { mockBracket } = await import("@/data/mockBracket");
    return mockBracket;
  }

  const [teamRows, bracketRows] = await Promise.all([
    fetchTeams(),
    fetchBracket(),
  ]);

  if (!teamRows || !bracketRows) {
    logSource("bracket", "mock", "fetch da sheets fallito");
    const { mockBracket } = await import("@/data/mockBracket");
    return mockBracket;
  }

  logSource("bracket", "sheets");
  return assembleBracket(bracketRows, teamRows);
}
