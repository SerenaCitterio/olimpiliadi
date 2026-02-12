"use client";

import { useRef } from "react";
import type { Tournament } from "@/types/tournament";
import { GLOW_COLOR, PARTICLE_COUNT, SPOTLIGHT_RADIUS } from "@/lib/constants";
import { useTeamSelection } from "@/hooks/useTeamSelection";
import GroupStandings from "@/components/GroupStandings";
import TeamDetailModal from "@/components/TeamDetailModal";
import { ParticleCard, GlobalSpotlight } from "@/components/MagicBento";
import "@/components/MagicBento.css";

interface GironiClientProps {
  tournament: Tournament;
}

export default function GironiClient({ tournament }: GironiClientProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const { selected, handleTeamClick, clearSelection } = useTeamSelection(tournament);

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Gironi
          </h1>
          <p className="mt-2 text-muted-foreground">
            Fase a gironi
          </p>
        </header>

        <GlobalSpotlight
          gridRef={gridRef}
          enabled
          spotlightRadius={SPOTLIGHT_RADIUS}
          glowColor={GLOW_COLOR}
        />
        <div
          ref={gridRef}
          className="bento-section grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8"
        >
          {tournament.groups.map((group) => (
            <ParticleCard
              key={group.id}
              className="magic-bento-card magic-bento-card--border-glow rounded-2xl h-full"
              style={{ "--glow-color": GLOW_COLOR } as React.CSSProperties}
              particleCount={PARTICLE_COUNT}
              glowColor={GLOW_COLOR}
              enableTilt={false}
              clickEffect
              enableMagnetism={false}
            >
              <GroupStandings
                group={group}
                onTeamClick={handleTeamClick}
              />
            </ParticleCard>
          ))}
        </div>
      </div>

      {/* Modal */}
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
    </>
  );
}
