"use client";

import { Bracket as BracketType, BracketMatch } from "@/types/bracket";

/* ── Types ───────────────────────────────────────────────── */

interface BracketProps {
  data: BracketType;
  onTeamClick?: (teamName: string) => void;
}

/* ── Team row ────────────────────────────────────────────── */

function TeamRow({
  name,
  emoji,
  score,
  played,
  isWinner,
  onTeamClick,
}: {
  name: string | null;
  emoji: string | null;
  score: number | null;
  played: boolean;
  isWinner: boolean;
  onTeamClick?: (teamName: string) => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 ${
        isWinner ? "bg-muted/50" : ""
      }`}
    >
      {/* Emoji / initials */}
      {emoji && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold leading-none">
          {emoji}
        </span>
      )}

      {/* Team name */}
      {name && onTeamClick ? (
        <button
          onClick={() => onTeamClick(name)}
          className={`min-w-0 flex-1 truncate text-left text-sm hover:underline ${
            isWinner ? "font-bold text-foreground" : "text-muted-foreground"
          }`}
        >
          {name}
        </button>
      ) : (
        <span
          className={`min-w-0 flex-1 truncate text-sm ${
            name === null
              ? "italic text-muted-foreground/50"
              : isWinner
              ? "font-bold text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {name ?? "TBD"}
        </span>
      )}

      {/* Score */}
      <span
        className={`text-sm tabular-nums ${
          isWinner ? "font-bold text-foreground" : "text-muted-foreground"
        }`}
      >
        {played && score !== null ? score : "\u2013"}
      </span>
    </div>
  );
}

/* ── Match cell ──────────────────────────────────────────── */

function MatchCell({
  match,
  onTeamClick,
}: {
  match: BracketMatch;
  onTeamClick?: (teamName: string) => void;
}) {
  const w1 =
    match.played &&
    match.score1 !== null &&
    match.score2 !== null &&
    match.score1 > match.score2;
  const w2 =
    match.played &&
    match.score1 !== null &&
    match.score2 !== null &&
    match.score2 > match.score1;

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <TeamRow
        name={match.team1?.name ?? null}
        emoji={match.team1?.emoji ?? null}
        score={match.score1}
        played={match.played}
        isWinner={w1}
        onTeamClick={onTeamClick}
      />
      <div className="border-t border-border" />
      <TeamRow
        name={match.team2?.name ?? null}
        emoji={match.team2?.emoji ?? null}
        score={match.score2}
        played={match.played}
        isWinner={w2}
        onTeamClick={onTeamClick}
      />
    </div>
  );
}

/* ── Main bracket ────────────────────────────────────────── */

export default function Bracket({ data, onTeamClick }: BracketProps) {
  /* Right rounds are stored outermost-first [QF, SF],
     but displayed innermost-first [SF, QF] (left-to-right). */
  const rightRoundsDisplay = [...data.rightRounds].reverse();

  const winner =
    data.final.played &&
    data.final.score1 !== null &&
    data.final.score2 !== null
      ? data.final.score1 > data.final.score2
        ? data.final.team1
        : data.final.score2 > data.final.score1
        ? data.final.team2
        : null
      : null;

  return (
    <div className="overflow-x-auto">
      <div className="bracket-root" style={{ minWidth: "720px" }}>
        {/* ── Left rounds (LTR) ── */}
        {data.leftRounds.map((round) => (
          <div key={round.id} className="bracket-round bracket-round-ltr">
            <div className="bracket-title">{round.name}</div>
            <div className="bracket-seeds">
              {round.matches.map((match) => (
                <div key={match.id} className="bracket-seed">
                  <MatchCell match={match} onTeamClick={onTeamClick} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* ── Final ── */}
        <div className="bracket-round">
          <div className="bracket-title">Finale</div>
          <div className="bracket-seeds">
            <div className="bracket-seed">
              <MatchCell match={data.final} onTeamClick={onTeamClick} />
              {winner && (
                <p className="mt-2 text-center text-xs font-semibold text-amber-500">
                  Vincitore: {winner.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right rounds (RTL, displayed inner → outer) ── */}
        {rightRoundsDisplay.map((round) => (
          <div key={round.id} className="bracket-round bracket-round-rtl">
            <div className="bracket-title">{round.name}</div>
            <div className="bracket-seeds">
              {round.matches.map((match) => (
                <div key={match.id} className="bracket-seed">
                  <MatchCell match={match} onTeamClick={onTeamClick} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
