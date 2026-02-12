import { NextResponse } from "next/server";
import { appendMatchRow, type NewMatchPayload, type RawMatchStats } from "@/lib/sheets";

function isValidStats(s: unknown): s is RawMatchStats {
  if (!s || typeof s !== "object") return false;
  const obj = s as Record<string, unknown>;
  return (
    typeof obj.flash === "number" &&
    typeof obj.goalAttacker === "number" &&
    typeof obj.goalDefender === "number" &&
    typeof obj.autogoalAttacker === "number" &&
    typeof obj.autogoalDefender === "number"
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      team1Id,
      team1Label,
      team2Id,
      team2Label,
      score1,
      score2,
      date,
      team1Stats,
      team2Stats,
    } = body as NewMatchPayload;

    // Basic validation
    if (!team1Id || !team2Id || !date) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti (team1Id, team2Id, date)" },
        { status: 400 },
      );
    }

    if (team1Id === team2Id) {
      return NextResponse.json(
        { error: "Le due squadre devono essere diverse" },
        { status: 400 },
      );
    }

    if (!isValidStats(team1Stats) || !isValidStats(team2Stats)) {
      return NextResponse.json(
        { error: "Statistiche non valide" },
        { status: 400 },
      );
    }

    const payload: NewMatchPayload = {
      team1Id,
      team1Label: team1Label ?? "",
      team2Id,
      team2Label: team2Label ?? "",
      score1: Number(score1) || 0,
      score2: Number(score2) || 0,
      date,
      team1Stats,
      team2Stats,
    };

    const newId = await appendMatchRow(payload);

    return NextResponse.json({ success: true, id: newId });
  } catch (err) {
    console.error("[api/matches] POST error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore interno" },
      { status: 500 },
    );
  }
}
