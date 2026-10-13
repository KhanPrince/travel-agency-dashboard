import { getUser } from "~/appwrite/auth";
import { getAllTrips } from "~/routes/api/trips";
import { Header } from "~/components";
import TripCard from "~/components/TripCard";
import type { Route } from "./+types/trips";

export const clientLoader = async () => {
  const user = await getUser();

  // getUser throws a redirect to /sign-in if there is no session,
  // so a user is present here. This only guards against a null return.
  if (!user) return { trips: [], total: 0 };

  const { trips, total } = await getAllTrips(12, 0, user.accountId);
  return { trips, total };
};

const Trips = ({ loaderData }: Route.ComponentProps) => {
  const { trips, total } = loaderData;

  return (
    <main className="all-users wrapper">
      <Header
        title="Trips"
        description="View and edit AI-generated travel plans"
        ctaText="Create a trip"
        ctaUrl="/trips/create"
      />

      <section>
        <h1 className="text-xl font-semibold text-dark-100 mb-4">
          Your AI-generated trips ({total})
        </h1>

        {trips.length === 0 ? (
          <p className="text-gray-100">
            No trips created by you yet. Click "Create a trip" to generate your
            first one.
          </p>
        ) : (
          <div className="trip-grid">
            {trips.map((trip) => (
              <TripCard key={trip.id} {...trip} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Trips;
