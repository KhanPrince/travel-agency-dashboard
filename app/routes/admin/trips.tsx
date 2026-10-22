import { getAccessState } from "~/appwrite/auth";
import { getAllTrips } from "~/routes/api/trips";
import { Header } from "~/components";
import AccessGate from "~/components/AccessGate";
import InfiniteTripGrid from "~/components/infiniteTripGrid";
import type { Route } from "./+types/trips";

export const clientLoader = async () => {
  const access = await getAccessState();

  // guests and normal users get the gate screen and no data request
  if (access.role !== "admin" || !access.user) {
    return { allowed: false as const, access };
  }

  const userId = access.user.accountId as string;
  const { trips, total } = await getAllTrips(12, 0, userId);

  return { allowed: true as const, access, trips, total, userId };
};

const Trips = ({ loaderData }: Route.ComponentProps) => {
  if (!loaderData.allowed) {
    return <AccessGate title="AI Trips" access={loaderData.access} />;
  }

  const { trips, total, userId } = loaderData;

  return (
    <main className="all-users wrapper">
      <Header
        title="Trips"
        description="View and edit AI-generated travel plans"
        ctaText="Create a trip"
        ctaIcon="plus"
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
          <InfiniteTripGrid
            initialTrips={trips}
            total={total}
            pageSize={12}
            userId={userId}
          />
        )}
      </section>
    </main>
  );
};

export default Trips;
