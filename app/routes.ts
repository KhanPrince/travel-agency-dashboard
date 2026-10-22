import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  route("sign-in", "routes/root/sign-in.tsx"),
  index("routes/root/home.tsx"),
  route("travel", "routes/root/home.tsx", { id: "travel-redirect" }),

  route("auth/callback", "routes/root/auth-callback.tsx"),

  layout("routes/admin/admin-layout.tsx", [
    route("dashboard", "routes/admin/dashboard.tsx"),
    route("travel/:tripId", "routes/admin/travel-detail.tsx"),
    route("all-users", "routes/admin/all-users.tsx"),
    route("trips", "routes/admin/trips.tsx"),
    route("trips/create", "routes/admin/create-trip.tsx"),
    route("trips/api/create-trip", "routes/api/create-trip.ts"),
    route("trips/:tripId", "routes/admin/trip-detail.tsx"),
    route("trips/:tripId/edit", "routes/admin/edit-trip.tsx"),
  ]),
] satisfies RouteConfig;
