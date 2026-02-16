"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Team } from "@/types/tournament";

/* ── Types ───────────────────────────────────────────────── */

interface NewMatchModalProps {
  teams: Team[];
  onClose: () => void;
  onSaved: () => void;
}

interface StatsForm {
  flash: number;
  goalAttacker: number;
  goalDefender: number;
  autogoalAttacker: number;
  autogoalDefender: number;
}

const emptyStats = (): StatsForm => ({
  flash: 0,
  goalAttacker: 0,
  goalDefender: 0,
  autogoalAttacker: 0,
  autogoalDefender: 0,
});

/* ── Stepper component ───────────────────────────────────── */

function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange(min);
      return;
    }
    const v = parseInt(raw, 10);
    if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-base font-bold text-foreground transition-colors active:bg-accent disabled:opacity-30 sm:h-9 sm:w-9 sm:text-lg"
        >
          −
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleInputChange}
          className="w-12 rounded-lg border border-border bg-background text-center text-base font-bold tabular-nums text-foreground outline-none focus:ring-2 focus:ring-primary sm:w-14 sm:text-lg [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-base font-bold text-foreground transition-colors active:bg-accent disabled:opacity-30 sm:h-9 sm:w-9 sm:text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ── Team select ─────────────────────────────────────────── */

function TeamSelect({
  label,
  value,
  options,
  disabledId,
  onChange,
}: {
  label: string;
  value: string;
  options: Team[];
  disabledId?: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-medium text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary"
      >
        <option value="">Seleziona squadra…</option>
        {options.map((t) => (
          <option key={t.id} value={t.id} disabled={t.id === disabledId}>
            {t.emoji} {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Stats section for a team ────────────────────────────── */

const statFields: { key: keyof StatsForm; label: string }[] = [
  { key: "goalAttacker", label: "Gol Att." },
  { key: "goalDefender", label: "Gol Dif." },
  { key: "autogoalAttacker", label: "Autogol Att." },
  { key: "autogoalDefender", label: "Autogol Dif." },
  { key: "flash", label: "Flash" },
];

function StatsSection({
  team,
  stats,
  onChange,
  showPlayerNames = false,
}: {
  team: Team,
  stats: StatsForm;
  onChange: (s: StatsForm) => void;
  showPlayerNames?: boolean;
}) {
  // helper to produce label based on key and showPlayerNames
  const getLabel = (key: keyof StatsForm, defaultLabel: string) => {
    if (!showPlayerNames) return defaultLabel;

    // Use attacker/defender names from team if available
    const attacker = team.attacker || "Attaccante";
    const defender = team.defender || "Difensore";

    switch (key) {
      case "goalAttacker":
        return `Gol ${attacker}`;
      case "goalDefender":
        return `Gol ${defender}`;
      case "autogoalAttacker":
        return `Autogol ${attacker}`;
      case "autogoalDefender":
        return `Autogol ${defender}`;
      case "flash":
        return "Flash";
      default:
        return defaultLabel;
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        {team.emoji && (
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-xs font-bold">
            {team.emoji}
          </span>
        )}
        <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {team.name || "Squadra"}
        </h4>
      </div>
      <div className="flex flex-col gap-1.5">
        {statFields.map(({ key, label }) => (
          <Stepper
            key={key}
            label={getLabel(key, label)}
            value={stats[key]}
            onChange={(v) => onChange({ ...stats, [key]: v })}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Score helpers ────────────────────────────────────────── */

/** Score = own goals (att + def) + opponent's autogoals (att + def) */
function computeScore(ownStats: StatsForm, opponentStats: StatsForm): number {
  return (
    ownStats.goalAttacker +
    ownStats.goalDefender +
    opponentStats.autogoalAttacker +
    opponentStats.autogoalDefender
  );
}

/* ── Main modal ──────────────────────────────────────────── */

export default function NewMatchModal({ teams, onClose, onSaved }: NewMatchModalProps) {
  const [team1Id, setTeam1Id] = useState("");
  const [team2Id, setTeam2Id] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [team1Stats, setTeam1Stats] = useState<StatsForm>(emptyStats);
  const [team2Stats, setTeam2Stats] = useState<StatsForm>(emptyStats);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlayerNames, setShowPlayerNames] = useState(false);

  const team1 = teams.find((t) => t.id === team1Id) || {
    id: "team1",
    name: "Squadra 1",
    emoji: "🍆",
    defender: "Difensore 1",
    attacker: "Attaccante 1",
  };
  const team2 = teams.find((t) => t.id === team2Id) || {
    id: "team2",
    name: "Squadra 2",
    emoji: "🍆",
    defender: "Difensore 2",
    attacker: "Attaccante 2",
  }

  // Auto-computed scores
  const score1 = useMemo(() => computeScore(team1Stats, team2Stats), [team1Stats, team2Stats]);
  const score2 = useMemo(() => computeScore(team2Stats, team1Stats), [team1Stats, team2Stats]);

  const hasMinScore = score1 >= 10 || score2 >= 10;
  const canSave =
    team1Id &&
    team2Id &&
    team1Id !== team2Id &&
    date &&
    hasMinScore &&
    !saving;

  /* close on Escape */
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  /* ── Submit ── */
  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team1Id,
          team1Label: team1?.name ?? "",
          team2Id,
          team2Label: team2?.name ?? "",
          score1,
          score2,
          date,
          team1Stats,
          team2Stats,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Errore nel salvataggio");
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-4 pt-28 pb-24 md:pt-36 md:pb-6">
      {/* Backdrop (sotto la navbar z-50) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6 md:p-8">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Chiudi"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="mb-6 text-xl font-bold text-foreground">Nuova partita</h2>

        <div className="flex flex-col gap-5">
          {/* ── Team selects ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TeamSelect
              label="Squadra 1"
              value={team1Id}
              options={teams}
              disabledId={team2Id}
              onChange={setTeam1Id}
            />
            <TeamSelect
              label="Squadra 2"
              value={team2Id}
              options={teams}
              disabledId={team1Id}
              onChange={setTeam2Id}
            />
          </div>

          {/* ── Date ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-medium text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* ── Auto-computed score display ── */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Risultato (calcolato automaticamente)
            </p>
            <div className="rounded-2xl flex items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-1">
                {team1 && (
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-lg font-bold">
                    {team1.emoji}
                  </span>
                )}
                <span className="max-w-[100px] truncate text-xs font-medium text-muted-foreground">
                  {team1?.name ?? "Squadra 1"}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tabular-nums text-foreground">
                  {score1}
                </span>
                <span className="text-xl font-bold text-muted-foreground/30">–</span>
                <span className="text-4xl font-black tabular-nums text-foreground">
                  {score2}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                {team2 && (
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-lg font-bold">
                    {team2.emoji}
                  </span>
                )}
                <span className="max-w-[100px] truncate text-xs font-medium text-muted-foreground">
                  {team2?.name ?? "Squadra 2"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Stats: two columns on md+, stacked on mobile ── */}
          {/* Toggle to switch labels between short and player names */}
          <div className="flex items-center justify-end">
            <label className="inline-flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={showPlayerNames}
                onChange={(e) => setShowPlayerNames(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-0"
              />
              <span>Mostra nomi giocatori</span>
            </label>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <StatsSection
              team={team1}
              stats={team1Stats}
              onChange={setTeam1Stats}
              showPlayerNames={showPlayerNames}
            />
            <StatsSection
              team={team2}
              stats={team2Stats}
              onChange={setTeam2Stats}
              showPlayerNames={showPlayerNames}
            />
          </div>

          {/* ── Min score hint ── */}
          {team1Id && team2Id && team1Id !== team2Id && date && !hasMinScore && (
            <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-600 dark:text-amber-400">
              Il salvataggio è consentito solo con almeno 10 punti per una delle due squadre.
            </p>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500">
              {error}
            </div>
          )}

          {/* ── Save button ── */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            {saving ? "Salvataggio…" : "Salva partita"}
          </button>
        </div>
      </div>
    </div>
  );
}
