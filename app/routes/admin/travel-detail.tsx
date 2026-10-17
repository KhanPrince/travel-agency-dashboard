import { Link } from "react-router";
import { getTripById } from "~/routes/api/trips";
import { Header } from "~/components";
import TripDetailCard from "~/components/tripDetailCard";
import type { Route } from "./+types/travel-detail";

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
  let trip: any;
  try {
    trip = await getTripById(params.tripId);
  } catch {
    throw new Response("Trip not found", { status: 404 });
  }
  return { trip };
};

const TravelDetail = ({ loaderData }: Route.ComponentProps) => {
  const { trip } = loaderData;

  return (
    <main className="wrapper">
      <Header title="Trip Details" description="View trip details" />

      <TripDetailCard {...trip} />
    </main>
  );
};

export default TravelDetail;
