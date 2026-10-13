import { getUser } from "~/appwrite/auth";
import { Header, StatsCard } from "~/components";
import TripCard from "~/components/TripCard";
import { dashboardStats, user, allTrips } from "~/constants";
import { getAllTrips } from "~/routes/api/trips";
import type { Route } from "./+types/dashboard";

const { totalUsers, usersJoined, totalTrips, tripsCreated, userRole } =
  dashboardStats;

export const clientLoader = async () => {
  const [user, { trips }] = await Promise.all([getUser(), getAllTrips(8, 0)]);
  return { user, trips };
};

const dashboard = ({ loaderData }: Route.ComponentProps) => {
  const { user, trips } = loaderData;
  return (
    <main className="dashboard wrapper">
      <Header
        title={`Welcome ${user?.name ?? "Guest"} 👋`}
        description="Track activity, trenz and popular destinations in real time"
      />
      {/* Stats */}
      <section className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <StatsCard
            headerTitle="Total Users"
            total={totalUsers}
            currentMonthCount={usersJoined.currentMonth}
            lastMonthCount={usersJoined.lastMonth}
          />
          <StatsCard
            headerTitle="Total Trips"
            total={totalTrips}
            currentMonthCount={tripsCreated.currentMonth}
            lastMonthCount={tripsCreated.lastMonth}
          />
          <StatsCard
            headerTitle="Active Users"
            total={userRole.total}
            currentMonthCount={usersJoined.currentMonth}
            lastMonthCount={usersJoined.lastMonth}
          />
        </div>
      </section>

      {/* Trips */}
      <section className="container">
        <h1 className="text-xl font-semibold text-dark-100">Created Trips</h1>

        <div className="trip-grid">
          {trips.map((trip) => (
            <TripCard key={trip.id} {...trip} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default dashboard;
