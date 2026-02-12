import type { Metadata } from "next";
import { getTournamentData, getBracketData } from "@/lib/tournament";
import TabelloneClient from "@/components/TabelloneClient";

export const metadata: Metadata = {
  title: "Tabellone",
  description: "Tabellone della fase finale ad eliminazione diretta del torneo di calcio balilla.",
};

export const revalidate = 60;

export default async function TabellonePage() {
  const [tournament, bracket] = await Promise.all([
    getTournamentData(),
    getBracketData(),
  ]);

  return (
    <main className="min-h-screen bg-background pt-24 pb-24 px-6 md:pt-28 md:pb-12 md:px-8 lg:px-12">
      <TabelloneClient tournament={tournament} bracket={bracket} />
    </main>
  );
}
