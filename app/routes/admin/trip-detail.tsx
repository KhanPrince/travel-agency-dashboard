import { useState } from "react";
import { Form, Link, redirect, useNavigation } from "react-router";
import { getUser } from "~/appwrite/auth";
import { deleteTrip, getTripById } from "~/routes/api/trips";
import { Header } from "~/components";
import type { Route } from "./+types/trip-detail";
import TripDetailCard from "~/components/tripDetailCard";
import ConfirmDialog from "~/components/ConfirmDialogBox";

const loadTripAndPermission = async (tripId: string) => {
  const [user, trip] = await Promise.all([
    getUser(), // a redirect from here passes through
    getTripById(tripId).catch(() => null),
  ]);
  if (!trip) throw new Response("Trip not found", { status: 404 });
  const canManage =
    !!user && user.status === "admin" && trip.userId === user.accountId;
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
  const [showConfirm, setShowConfirm] = useState(false);
  const navigation = useNavigation();
  const isDeleting = navigation.state === "submitting";

  return (
    <main className="wrapper">
      <Header title={trip.name} description={trip.country} />

      {canManage && (
        <div className="flex-between gap-3 mb-6 mt-3">
          <Link
            to={`/trips/${trip.id}/edit`}
            className="button-class text-white w-fit h-8"
          >
            Edit trip
          </Link>

          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className=" px-4 rounded-lg flex items-center justify-center text-white w-fit h-8 bg-red-600 hover:bg-red-700 hover:cursor-pointer gap-1.5 shadow-sm"
          >
            Delete trip
          </button>
        </div>
      )}
      <ConfirmDialog
        open={showConfirm}
        title="Delete this Trip"
        description={`"${trip.name}" will be permanently deleted.`}
        onCancel={() => setShowConfirm(false)}
      >
        <Form method="post" className="w-full">
          <button
            type="submit"
            disabled={isDeleting}
            className="rounded-lg px-4 py-2 bg-red-500 text-white disabled:opacity-60 "
          >
            {isDeleting ? "Deleting..." : "Confirm delete"}
          </button>
        </Form>
      </ConfirmDialog>

      <TripDetailCard {...trip} />
    </main>
  );
};

export default TripDetail;
