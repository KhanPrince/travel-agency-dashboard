import { getAllTrips } from "~/routes/api/trips";
import { Header } from "~/components";
import Footer from "~/components/Footer";
import TripCard from "~/components/TripCard";
import type { Route } from "./+types/travel-page";
import CreatorCta from "~/components/CreatorCta";
import { getCurrentRole, hasAdminRequest } from "~/appwrite/auth";

export const clientLoader = async () => {
  const [{ trips }, { role, user }] = await Promise.all([
    getAllTrips(12, 0),
    getCurrentRole(),
  ]);

  const adminRequested =
    role === "user" && user ? await hasAdminRequest(user.accountId) : false;

  return {
    trips,
    role,
    adminRequested,
    account: user ? { $id: user.$id, accountId: user.accountId } : null,
  };
};

const TravelPage = ({ loaderData }: Route.ComponentProps) => {
  const { trips, role, adminRequested, account } = loaderData;

  return (
    <>
      <main className="wrapper">
        <CreatorCta
          role={role}
          adminRequested={adminRequested}
          account={account}
        />

        {trips.length === 0 ? (
          <p>No trips available yet.</p>
        ) : (
          <div className="trip-grid">
            {trips.map((trip) => (
              <TripCard key={trip.id} {...trip} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default TravelPage;
