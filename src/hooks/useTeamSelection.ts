"use client";

import { useState, useCallback } from "react";
import type { Tournament } from "@/types/tournament";
import { findTeamByName, type TeamWithGroup } from "@/lib/team-utils";

export function useTeamSelection(tournament: Tournament) {
  const [selected, setSelected] = useState<TeamWithGroup | null>(null);

  const handleTeamClick = useCallback(
    (teamName: string) => {
      const found = findTeamByName(tournament, teamName);
      if (found) setSelected(found);
    },
    [tournament]
  );

  const clearSelection = useCallback(() => setSelected(null), []);

  return { selected, handleTeamClick, clearSelection };
}
