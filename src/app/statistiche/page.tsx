import type { Metadata } from "next";
import { getTournamentData } from "@/lib/tournament";
import StatisticheClient from "@/components/StatisticheClient";

export const metadata: Metadata = {
  title: "Statistiche",
  description: "Capocannoniere, Il muro, Boomerang d'Oro e Miglior fotografo del torneo.",
};

export const revalidate = 60;

export default async function StatistichePage() {
  const tournament = await getTournamentData();

  return (
    <main className="min-h-screen bg-background pt-24 pb-24 px-6 md:pt-28 md:pb-12 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Statistiche
          </h1>
          <p className="mt-2 text-muted-foreground">
            I protagonisti del torneo
          </p>
        </header>
        <StatisticheClient tournament={tournament} />
      </div>
    </main>
  );
}
