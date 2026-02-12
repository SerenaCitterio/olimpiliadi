import type { Metadata } from "next";
import { getTournamentData, getCalendarData } from "@/lib/tournament";
import CalendarioClient from "@/components/CalendarioClient";

export const metadata: Metadata = {
  title: "Calendario",
  description: "Calendario completo delle partite del torneo di calcio balilla.",
};

export const revalidate = 60;

export default async function CalendarioPage() {
  const [tournament, calendarDays] = await Promise.all([
    getTournamentData(),
    getCalendarData(),
  ]);

  return (
    <main className="min-h-screen bg-background pt-24 pb-24 px-6 md:pt-28 md:pb-12 md:px-8 lg:px-12">
      <CalendarioClient tournament={tournament} calendarDays={calendarDays} />
    </main>
  );
}
