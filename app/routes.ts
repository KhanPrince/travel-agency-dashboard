import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  route("sign-in", "routes/root/sign-in.tsx"),

  route("travel", "routes/root/travel-page.tsx"),
  route("travel/:tripId", "routes/admin/travel-detail.tsx"),

  route("auth/callback", "routes/root/auth-callback.tsx"),

  layout("routes/admin/admin-layout.tsx", [
    index("routes/admin/dashboard.tsx", { id: "admin-index" }),
    route("dashboard", "routes/admin/dashboard.tsx"),
    route("all-users", "routes/admin/all-users.tsx"),
    route("trips", "routes/admin/trips.tsx"),
    route("trips/create", "routes/admin/create-trip.tsx"),
    route("trips/api/create-trip", "routes/api/create-trip.ts"),
    route("trips/:tripId", "routes/admin/trip-detail.tsx"),
    route("trips/:tripId/edit", "routes/admin/edit-trip.tsx"),
  ]),
] satisfies RouteConfig;
