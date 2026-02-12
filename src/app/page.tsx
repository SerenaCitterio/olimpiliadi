import { getTournamentData, getCalendarData } from "@/lib/tournament";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60;

export default async function Home() {
  const [tournament, calendarDays] = await Promise.all([
    getTournamentData(),
    getCalendarData(),
  ]);

  return (
    <main className="min-h-screen bg-background px-6 pt-24 pb-24 md:px-8 md:pt-28 md:pb-12 lg:px-12">
      <HomeClient tournament={tournament} calendarDays={calendarDays} />
    </main>
  );
}
