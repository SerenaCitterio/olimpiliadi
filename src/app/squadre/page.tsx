import type { Metadata } from "next";
import { getTournamentData } from "@/lib/tournament";
import SquadreClient from "@/components/SquadreClient";

export const metadata: Metadata = {
  title: "Squadre",
  description: "Tutte le squadre del torneo di calcio balilla con giocatori e statistiche.",
};

export const revalidate = 60;

export default async function SquadrePage() {
  const tournament = await getTournamentData();

  return (
    <main className="min-h-screen bg-background px-6 pt-24 pb-24 md:px-8 md:pt-28 md:pb-12 lg:px-12">
      <SquadreClient tournament={tournament} />
    </main>
  );
}
