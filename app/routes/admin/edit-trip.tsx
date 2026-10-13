import { Form, redirect } from "react-router";
import { getUser } from "~/appwrite/auth";
import { getTripById, updateTrip } from "~/routes/api/trips";
import { Header } from "~/components";
import type { Route } from "./+types/edit-trip";

const assertCanManage = async (tripId: string) => {
  const user: any = await getUser();
  const trip: any = await getTripById(tripId);
  if (!user || user.status !== "admin" || trip.userId !== user.$id) {
    throw redirect(`/trips/${tripId}`);
  }
  return trip;
};

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
  const trip = await assertCanManage(params.tripId);
  return { trip };
};

export const clientAction = async ({
  params,
  request,
}: Route.ClientActionArgs) => {
  await assertCanManage(params.tripId);
  const f = await request.formData();

  await updateTrip(params.tripId, {
    name: String(f.get("name") ?? ""),
    description: String(f.get("description") ?? ""),
    estimatedPrice: String(f.get("estimatedPrice") ?? ""),
    duration: Number(f.get("duration")),
    budget: String(f.get("budget") ?? ""),
    travelStyle: String(f.get("travelStyle") ?? ""),
    interests: String(f.get("interests") ?? ""),
    groupType: String(f.get("groupType") ?? ""),
    country: String(f.get("country") ?? ""),
  });

  return redirect(`/trips/${params.tripId}`);
};

const EditTrip = ({ loaderData }: Route.ComponentProps) => {
  const { trip } = loaderData;

  const field = (name: string, label: string, type = "text") => (
    <label className="flex flex-col gap-1">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={trip[name]}
        className="border rounded-lg p-2"
        required
      />
    </label>
  );

  return (
    <main className="wrapper">
      <Header title={`Edit: ${trip.name}`} description="Update trip details" />
      <Form method="post" className="flex flex-col gap-4 max-w-xl">
        {field("name", "Name")}
        <label className="flex flex-col gap-1">
          Description
          <textarea
            name="description"
            defaultValue={trip.description}
            rows={4}
            className="border rounded-lg p-2"
          />
        </label>
        {field("estimatedPrice", "Estimated price")}
        {field("duration", "Duration (days)", "number")}
        {field("budget", "Budget")}
        {field("travelStyle", "Travel style")}
        {field("interests", "Interests")}
        {field("groupType", "Group type")}
        {field("country", "Country")}
        <button type="submit">Save changes</button>
      </Form>
    </main>
  );
};

export default EditTrip;
