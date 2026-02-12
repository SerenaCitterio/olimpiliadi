import { google } from "googleapis";

/* ── In-memory cache e deduplicazione (riducono chiamate API e rischio quota) ── */

const CACHE_TTL_MS = 90 * 1000; // 90 secondi

const tabCache = new Map<
  string,
  { data: string[][]; expiresAt: number }
>();

/** Richieste già in corso: evita di chiamare due volte lo stesso tab in parallelo. */
const inFlight = new Map<string, Promise<string[][] | null>>();

function getCachedTab(tabName: string): string[][] | null {
  const entry = tabCache.get(tabName);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.data;
}

function setCachedTab(tabName: string, data: string[][]) {
  tabCache.set(tabName, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /quota exceeded|rate limit|429/i.test(msg);
}

/* ── Google Sheets client (singleton) ────────────────────── */

function getSheets() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId = process.env.GOOGLE_SHEETS_ID;

  if (!email || !key || !sheetId) {
    return null;
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return { client: google.sheets({ version: "v4", auth }), sheetId };
}

/** Read all rows from a sheet tab. Returns null if not configured or on error. Uses cache and deduplication. */
async function readTab(tabName: string): Promise<string[][] | null> {
  const cached = getCachedTab(tabName);
  if (cached !== null) return cached;

  let promise = inFlight.get(tabName);
  if (promise) return promise;

  promise = doReadTab(tabName);
  inFlight.set(tabName, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(tabName);
  }
}

async function doReadTab(tabName: string): Promise<string[][] | null> {
  const sheets = getSheets();
  if (!sheets) return null;

  try {
    const res = await sheets.client.spreadsheets.values.get({
      spreadsheetId: sheets.sheetId,
      range: `${tabName}!A2:Z`, // skip header row
    });

    const data = (res.data.values as string[][]) ?? [];
    setCachedTab(tabName, data);
    return data;
  } catch (err) {
    if (isQuotaError(err)) {
      console.warn(
        "[sheets] Quota Google Sheets superata; verrà usato il fallback ai dati mock. Riprova tra qualche minuto.",
      );
    } else {
      console.error(
        `[sheets] Failed to read tab "${tabName}":`,
        err instanceof Error ? err.message : err,
      );
    }
    return null;
  }
}

/* ── Raw row types ───────────────────────────────────────── */

export interface RawTeamRow {
  id: string;
  name: string;
  emoji: string;
  defender: string;
  attacker: string;
  groupId: string;
  groupName: string;
}

export interface RawMatchStats {
  flash: number;
  goalAttacker: number;
  goalDefender: number;
  autogoalAttacker: number;
  autogoalDefender: number;
}

export interface RawMatchRow {
  id: string;
  team1Id: string;
  team2Id: string;
  score1: number;
  score2: number;
  date: string; // ISO date "2025-07-22"
  team1Stats: RawMatchStats;
  team2Stats: RawMatchStats;
}

export interface RawBracketRow {
  id: string;
  team1Id: string;
  team2Id: string;
  score1: number;
  score2: number;
  played: boolean;
  round: string; // "Quarti" | "Semifinali" | "Finale"
  side: string; // "left" | "right" | "final"
}

/* ── Parsers ─────────────────────────────────────────────── */

function parseTeamRow(row: string[]): RawTeamRow {
  return {
    id: row[0] ?? "",
    name: row[1] ?? "",
    emoji: row[2] ?? "",
    defender: row[3] ?? "",
    attacker: row[4] ?? "",
    groupId: row[5] ?? "",
    groupName: row[6] ?? "",
  };
}

/** Sheet: 5 columns per team — I:flashTeam1, J:goalT1Att, K:goalT1Def, L:autogoalT1Att, M:autogoalT1Def (then N–R team2). */
function parseStats(row: string[], startIndex: number): RawMatchStats {
  return {
    flash: Number(row[startIndex]) || 0,
    goalAttacker: Number(row[startIndex + 1]) || 0,
    goalDefender: Number(row[startIndex + 2]) || 0,
    autogoalAttacker: Number(row[startIndex + 3]) || 0,
    autogoalDefender: Number(row[startIndex + 4]) || 0,
  };
}

function parseMatchRow(row: string[]): RawMatchRow {
  // A(0):id  B(1):team1Id  C(2):team1Label  D(3):team2Id  E(4):team2Label
  // F(5):score1  G(6):score2  H(7):date
  // I(8):flashTeam1  J(9):goalTeam1Att  K(10):goalTeam1Def  L(11):autogoalTeam1Att  M(12):autogoalTeam1Def
  // N(13):flashTeam2  O(14):goalTeam2Att  P(15):goalTeam2Def  Q(16):autogoalTeam2Att  R(17):autogoalTeam2Def
  return {
    id: row[0] ?? "",
    team1Id: row[1] ?? "",
    team2Id: row[3] ?? "",
    score1: Number(row[5]) || 0,
    score2: Number(row[6]) || 0,
    date: row[7] ?? "",
    team1Stats: parseStats(row, 8),
    team2Stats: parseStats(row, 13),
  };
}

function parseBracketRow(row: string[]): RawBracketRow {
  return {
    id: row[0] ?? "",
    team1Id: row[1] ?? "",
    team2Id: row[2] ?? "",
    score1: Number(row[3]) || 0,
    score2: Number(row[4]) || 0,
    played: (row[5] ?? "").toUpperCase() === "TRUE",
    round: row[6] ?? "",
    side: row[7] ?? "",
  };
}

/* ── Public API ──────────────────────────────────────────── */

/** Returns null if Google Sheets is not configured. */
export async function fetchTeams(): Promise<RawTeamRow[] | null> {
  const rows = await readTab("Squadre");
  return rows?.map(parseTeamRow) ?? null;
}

/** Returns null if Google Sheets is not configured. */
export async function fetchMatches(): Promise<RawMatchRow[] | null> {
  const rows = await readTab("Partite");
  return rows?.map(parseMatchRow) ?? null;
}

/** Returns null if Google Sheets is not configured. */
export async function fetchBracket(): Promise<RawBracketRow[] | null> {
  const rows = await readTab("Bracket");
  return rows?.map(parseBracketRow) ?? null;
}

/**
 * Check if Google Sheets should be used as the data source.
 * Returns false (→ use mock data) when:
 *  - Any of the three required env vars is missing, OR
 *  - USE_MOCK_DATA is explicitly set to "true" (handy for local dev)
 */
export function isSheetsConfigured(): boolean {
  if (process.env.USE_MOCK_DATA === "true") return false;

  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_SHEETS_ID
  );
}

/* ── Write API ───────────────────────────────────────────── */

export interface NewMatchPayload {
  team1Id: string;
  team1Label: string;
  team2Id: string;
  team2Label: string;
  score1: number;
  score2: number;
  date: string; // "YYYY-MM-DD"
  team1Stats: RawMatchStats;
  team2Stats: RawMatchStats;
}

/**
 * Append a new match row to the "Partite" sheet.
 * The ID is auto-incremented based on the current row count.
 * Returns the generated ID, or throws on failure.
 */
export async function appendMatchRow(payload: NewMatchPayload): Promise<string> {
  const sheets = getSheets();
  if (!sheets) throw new Error("Google Sheets non configurato");

  // Read existing rows to compute next ID (formato A1, A2, A3...)
  const existing = await readTab("Partite");
  const nextNum = (existing?.length ?? 0) + 1;
  const nextId = `A${nextNum}`;

  // Build row: A:id  B:team1Id  C:team1Label  D:team2Id  E:team2Label  F:score1  G:score2  H:date
  // I:flashTeam1  J:goalTeam1Att  K:goalTeam1Def  L:autogoalTeam1Att  M:autogoalTeam1Def
  // N:flashTeam2  O:goalTeam2Att  P:goalTeam2Def  Q:autogoalTeam2Att  R:autogoalTeam2Def
  const row = [
    nextId,                                      // A: id
    payload.team1Id,                             // B: team1Id
    payload.team1Label,                           // C: team1Label
    payload.team2Id,                              // D: team2Id
    payload.team2Label,                           // E: team2Label
    String(payload.score1),                       // F: score1
    String(payload.score2),                      // G: score2
    payload.date,                                // H: date
    String(payload.team1Stats.flash),             // I: flashTeam1
    String(payload.team1Stats.goalAttacker),     // J: goalTeam1Attacker
    String(payload.team1Stats.goalDefender),     // K: goalTeam1Defender
    String(payload.team1Stats.autogoalAttacker), // L: autogoalTeam1Attacker
    String(payload.team1Stats.autogoalDefender), // M: autogoalTeam1Defender
    String(payload.team2Stats.flash),             // N: flashTeam2
    String(payload.team2Stats.goalAttacker),     // O: goalTeam2Attacker
    String(payload.team2Stats.goalDefender),     // P: goalTeam2Defender
    String(payload.team2Stats.autogoalAttacker), // Q: autogoalTeam2Attacker
    String(payload.team2Stats.autogoalDefender), // R: autogoalTeam2Defender
  ];

  await sheets.client.spreadsheets.values.append({
    spreadsheetId: sheets.sheetId,
    range: "Partite!A:R",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });

  return nextId;
}
