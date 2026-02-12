"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { Tournament } from "@/types/tournament";
import type { CalendarDay } from "@/types/calendar";
import { findTeamByName, findTeamByPlayerName } from "@/lib/team-utils";
import { getTournamentStats } from "@/lib/stats";
import { GLOW_COLOR, PARTICLE_COUNT, SPOTLIGHT_RADIUS } from "@/lib/constants";
import { useTeamSelection } from "@/hooks/useTeamSelection";
import TeamDetailModal from "@/components/TeamDetailModal";
import NewMatchModal from "@/components/NewMatchModal";
import { ParticleCard, GlobalSpotlight } from "@/components/MagicBento";
import "@/components/MagicBento.css";

/* ── helpers ────────────────────────────────────────────── */

function getLastPlayedMatch(calendarDays: CalendarDay[]) {
  for (let d = calendarDays.length - 1; d >= 0; d--) {
    const day = calendarDays[d];
    for (let m = day.matches.length - 1; m >= 0; m--) {
      if (day.matches[m].status === "Fischio finale") {
        return { match: day.matches[m], dateLabel: day.dateLabel, roundLabel: day.roundLabel };
      }
    }
  }
  return null;
}

/* ── component ──────────────────────────────────────────── */

interface HomeClientProps {
  tournament: Tournament;
  calendarDays: CalendarDay[];
}

export default function HomeClient({ tournament, calendarDays }: HomeClientProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { selected, handleTeamClick, clearSelection } = useTeamSelection(tournament);
  const [showNewMatch, setShowNewMatch] = useState(false);

  const lastMatch = useMemo(() => getLastPlayedMatch(calendarDays), [calendarDays]);

  const groupLeaders = useMemo(
    () =>
      tournament.groups.map((group) => ({
        groupId: group.id,
        groupName: group.name,
        leader: group.standings[0],
        leaderEmoji:
          group.teams.find((t) => t.id === group.standings[0].teamId)?.emoji ?? "",
      })),
    [tournament]
  );

  const allTeams = useMemo(
    () =>
      tournament.groups.flatMap((group) =>
        group.teams.map((team) => ({ ...team, groupId: group.id }))
      ),
    [tournament]
  );

  const stats = useMemo(() => getTournamentStats(tournament), [tournament]);

  const team1Emoji = lastMatch
    ? findTeamByName(tournament, lastMatch.match.team1Name)?.team.emoji
    : undefined;
  const team2Emoji = lastMatch
    ? findTeamByName(tournament, lastMatch.match.team2Name)?.team.emoji
    : undefined;

  return (
    <>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Torneo Calcio Balilla
            </h1>
            <p className="mt-2 text-muted-foreground">
              Tutto il torneo in un colpo d&apos;occhio.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewMatch(true)}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Nuova partita
          </button>
        </header>

        {/* ── Bento Grid ──────────────────────────────── */}
        <GlobalSpotlight
          gridRef={gridRef}
          enabled
          spotlightRadius={SPOTLIGHT_RADIUS}
          glowColor={GLOW_COLOR}
        />
        <div
          ref={gridRef}
          className="bento-section grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5"
        >

          {/* ── Card: Ultima Partita ── */}
          <ParticleCard
            className="magic-bento-card magic-bento-card--border-glow group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-lg"
            style={{ "--glow-color": GLOW_COLOR } as React.CSSProperties}
            particleCount={PARTICLE_COUNT}
            glowColor={GLOW_COLOR}
            enableTilt={false}
            clickEffect
            enableMagnetism={false}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Ultima partita
              </span>
              <Link
                href="/calendario"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border"
              >
                Calendario →
              </Link>
            </div>

            {lastMatch ? (
              <>
                <p className="mb-6 text-sm capitalize text-muted-foreground">
                  {lastMatch.dateLabel}
                </p>

                <div className="flex flex-1 items-center justify-between gap-3">
                  <div className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl font-bold">
                      {team1Emoji ?? "⚽"}
                    </div>
                    <button
                      onClick={() => handleTeamClick(lastMatch.match.team1Name)}
                      className="max-w-full truncate text-center text-sm font-semibold leading-tight text-foreground hover:underline"
                    >
                      {lastMatch.match.team1Name}
                    </button>
                    <span className="text-2xl font-black tabular-nums text-foreground">
                      {lastMatch.match.score1}
                    </span>
                  </div>

                  <span className="text-lg font-black text-muted-foreground/30">—</span>

                  <div className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl font-bold">
                      {team2Emoji ?? "⚽"}
                    </div>
                    <button
                      onClick={() => handleTeamClick(lastMatch.match.team2Name)}
                      className="max-w-full truncate text-center text-sm font-semibold leading-tight text-foreground hover:underline"
                    >
                      {lastMatch.match.team2Name}
                    </button>
                    <span className="text-2xl font-black tabular-nums text-foreground">
                      {lastMatch.match.score2}
                    </span>
                  </div>
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                  {lastMatch.roundLabel}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nessuna partita giocata
              </p>
            )}
          </ParticleCard>

          {/* ── Card: Primi in Classifica ── */}
          <ParticleCard
            className="magic-bento-card magic-bento-card--border-glow group rounded-2xl border border-border bg-card p-6 shadow-lg lg:col-span-2"
            style={{ "--glow-color": GLOW_COLOR } as React.CSSProperties}
            particleCount={PARTICLE_COUNT}
            glowColor={GLOW_COLOR}
            enableTilt={false}
            clickEffect
            enableMagnetism={false}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Primi in classifica
              </span>
              <Link
                href="/gironi"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border"
              >
                Vedi gironi →
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {groupLeaders.map((g) => (
                <div
                  key={g.groupId}
                  className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-sm font-bold text-amber-500">
                    {g.groupId}
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-bold leading-none">
                    {g.leaderEmoji}
                  </span>
                  <button
                    onClick={() => handleTeamClick(g.leader.teamName)}
                    className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-foreground hover:underline"
                  >
                    {g.leader.teamName}
                  </button>
                  <span className="text-lg font-bold tabular-nums text-foreground">
                    {g.leader.points}
                  </span>
                  <span className="text-xs text-muted-foreground">pt</span>
                </div>
              ))}
            </div>
          </ParticleCard>

          {/* ── Card: Le Squadre (a sinistra, stessa altezza di Statistiche) ── */}
          <ParticleCard
            className="magic-bento-card magic-bento-card--border-glow group flex h-full min-h-0 flex-col rounded-2xl border border-border bg-card p-6 shadow-lg md:col-span-1 lg:col-span-2"
            style={{ "--glow-color": GLOW_COLOR } as React.CSSProperties}
            particleCount={PARTICLE_COUNT}
            glowColor={GLOW_COLOR}
            enableTilt={false}
            clickEffect
            enableMagnetism={false}
          >
            <div className="mb-5 flex shrink-0 items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Le Squadre
              </span>
              <Link
                href="/squadre"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border"
              >
                Vedi tutte →
              </Link>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {allTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamClick(team.name)}
                  className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2.5 text-left transition-colors hover:bg-muted/70"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold leading-none">
                    {team.emoji}
                  </span>
                  <span className="min-w-0 truncate text-xs font-medium text-foreground hover:underline">
                    {team.name}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-4 shrink-0 text-center text-xs text-muted-foreground">
              {allTeams.length} squadre &middot;{" "}
              {tournament.groups.length} gironi
            </p>
          </ParticleCard>

          {/* ── Card: Statistiche (a destra, stessa altezza di Le Squadre) ── */}
          <ParticleCard
            className="magic-bento-card magic-bento-card--border-glow group flex h-full min-h-0 flex-col rounded-2xl border border-border bg-card p-6 shadow-lg w-full md:col-span-1 lg:col-span-1"
            style={{ "--glow-color": GLOW_COLOR } as React.CSSProperties}
            particleCount={PARTICLE_COUNT}
            glowColor={GLOW_COLOR}
            enableTilt={false}
            clickEffect
            enableMagnetism={false}
          >
            <div className="mb-5 flex shrink-0 items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Statistiche
              </span>
              <Link
                href="/statistiche"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-muted"
              >
                Vedi tutte →
              </Link>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              {/* Capocannoniere */}
              <div className="rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">🏆</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Capocannoniere</p>
                    <p className="text-xs text-muted-foreground">All&apos;attaccante con più goal</p>
                    {stats.capocannoniere ? (
                      stats.capocannoniere.isTie ? (
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">
                          Non c&apos;è un vincitore assoluto
                        </p>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const teamInfo = findTeamByPlayerName(tournament, stats.capocannoniere!.name);
                            if (teamInfo) {
                              handleTeamClick(teamInfo.team.name);
                            }
                          }}
                          className="mt-1 block text-left text-sm font-semibold text-foreground hover:underline"
                        >
                          {stats.capocannoniere.name}
                        </button>
                      )
                    ) : (
                      <p className="mt-1 text-sm italic text-muted-foreground">—</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Il muro */}
              <div className="rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">🛡️</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Il muro</p>
                    <p className="text-xs text-muted-foreground">Al difensore con più goal</p>
                    {stats.ilMuro ? (
                      stats.ilMuro.isTie ? (
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">
                          Non c&apos;è un vincitore assoluto
                        </p>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const teamInfo = findTeamByPlayerName(tournament, stats.ilMuro!.name);
                            if (teamInfo) {
                              handleTeamClick(teamInfo.team.name);
                            }
                          }}
                          className="mt-1 block text-left text-sm font-semibold text-foreground hover:underline"
                        >
                          {stats.ilMuro.name}
                        </button>
                      )
                    ) : (
                      <p className="mt-1 text-sm italic text-muted-foreground">—</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Boomerang d'Oro */}
              <div className="rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">🤦‍♂️</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Boomerang d&apos;Oro</p>
                    <p className="text-xs text-muted-foreground">A chi ha realizzato più autogol</p>
                    {stats.boomerangOro ? (
                      stats.boomerangOro.isTie ? (
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">
                          Non c&apos;è un vincitore assoluto
                        </p>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const teamInfo = findTeamByPlayerName(tournament, stats.boomerangOro!.name);
                            if (teamInfo) {
                              handleTeamClick(teamInfo.team.name);
                            }
                          }}
                          className="mt-1 block text-left text-sm font-semibold text-foreground hover:underline"
                        >
                          {stats.boomerangOro.name}
                        </button>
                      )
                    ) : (
                      <p className="mt-1 text-sm italic text-muted-foreground">—</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Miglior fotografo */}
              <div className="rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">📸</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Miglior fotografo</p>
                    <p className="text-xs text-muted-foreground">A chi ha realizzato più flash</p>
                    {stats.migliorFotografo ? (
                      stats.migliorFotografo.isTie ? (
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">
                          Non c&apos;è un vincitore assoluto
                        </p>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const teamInfo = findTeamByPlayerName(tournament, stats.migliorFotografo!.name);
                            if (teamInfo) {
                              handleTeamClick(teamInfo.team.name);
                            }
                          }}
                          className="mt-1 block text-left text-sm font-semibold text-foreground hover:underline"
                        >
                          {stats.migliorFotografo.name}
                        </button>
                      )
                    ) : (
                      <p className="mt-1 text-sm italic text-muted-foreground">—</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ParticleCard>
        </div>
      </div>

      {/* Team detail modal */}
      {selected && (
        <TeamDetailModal
          team={selected.team}
          groupId={selected.groupId}
          groupName={selected.groupName}
          group={selected.group}
          standing={selected.standing}
          onClose={clearSelection}
        />
      )}

      {/* New match modal */}
      {showNewMatch && (
        <NewMatchModal
          teams={allTeams}
          onClose={() => setShowNewMatch(false)}
          onSaved={() => router.refresh()}
        />
      )}
    </>
  );
}
