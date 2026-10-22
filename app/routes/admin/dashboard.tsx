import { getAccessState } from "~/appwrite/auth";
import { Header } from "~/components";
import { getAllTrips } from "~/routes/api/trips";
import type { Route } from "./+types/dashboard";
import InfiniteTripGrid from "~/components/infiniteTripGrid";
import CreatorCta from "~/components/CreatorCta";

export const clientLoader = async () => {
  const [access, { trips, total }] = await Promise.all([
    getAccessState(),
    getAllTrips(8, 0),
  ]);
  return { access, trips, total };
};
const dashboard = ({ loaderData }: Route.ComponentProps) => {
  const { access, trips, total } = loaderData;

  return (
    <main className="dashboard wrapper">
      <Header
        title={`Welcome ${access.user?.name ?? "Guest"} 👋`}
        description="Explore Trips generated with AI"
      />
      {access.role !== "admin" && (
        <CreatorCta
          role={access.role}
          adminRequested={access.adminRequested}
          account={access.account}
        />
      )}

      {/* Trips */}
      <section className="container">
        <h2 className="text-xl font-semibold text-dark-100">Created Trips</h2>

        <InfiniteTripGrid initialTrips={trips} total={total} pageSize={12} />
      </section>
    </main>
  );
};

export default dashboard;
