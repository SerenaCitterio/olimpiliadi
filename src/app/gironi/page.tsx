import type { Metadata } from "next";
import { getTournamentData } from "@/lib/tournament";
import GironiClient from "@/components/GironiClient";

export const metadata: Metadata = {
  title: "Gironi",
  description: "Classifiche e risultati della fase a gironi del torneo di calcio balilla.",
};

export const revalidate = 60;

export default async function GironiPage() {
  const tournament = await getTournamentData();

  return (
    <main className="min-h-screen bg-background pt-24 pb-24 px-6 md:pt-28 md:pb-12 md:px-8 lg:px-12">
      <GironiClient tournament={tournament} />
    </main>
  );
}
