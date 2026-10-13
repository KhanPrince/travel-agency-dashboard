import { Form, Link, redirect } from "react-router";
import { getUser } from "~/appwrite/auth";
import { deleteTrip, getTripById } from "~/routes/api/trips";
import { Header } from "~/components";
import type { Route } from "./+types/trip-detail";
import TripDetailCard from "~/components/tripDetailCard";

const loadTripAndPermission = async (tripId: string) => {
  const user: any = await getUser();
  let trip: any;
  try {
    trip = await getTripById(tripId);
    console.log("Trip data from trip-detail:", trip);
  } catch {
    throw new Response("Trip not found", { status: 404 });
  }
  const canManage =
    !!user && user.status === "admin" && trip.userId === user.$id;
  return { trip, canManage };
};

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) =>
  loadTripAndPermission(params.tripId);

export const clientAction = async ({ params }: Route.ClientActionArgs) => {
  const { canManage } = await loadTripAndPermission(params.tripId);
  if (!canManage) throw new Response("Forbidden", { status: 403 });

  await deleteTrip(params.tripId);
  return redirect("/trips");
};

const TripDetail = ({ loaderData }: Route.ComponentProps) => {
  const { trip, canManage } = loaderData;

  return (
    <main className="wrapper">
      <Header title={trip.name} description={trip.country} />

      {canManage && (
        <div className="flex gap-3 mb-6">
          <Link to={`/trips/${trip.id}/edit`} className="button-class">
            Edit trip
          </Link>
          <Form
            method="post"
            onSubmit={(e) => {
              if (!confirm("Delete this trip permanently?")) e.preventDefault();
            }}
          >
            <button type="submit" className="text-red-500">
              Delete trip
            </button>
          </Form>
        </div>
      )}

      <TripDetailCard {...trip} />
    </main>
  );
};

export default TripDetail;
