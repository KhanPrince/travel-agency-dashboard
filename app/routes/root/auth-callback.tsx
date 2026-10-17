import { redirect } from "react-router";
import type { Route } from "./+types/auth-callback";

import { getCurrentRole, requestAdminAccess } from "~/appwrite/auth";

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  const intent = new URL(request.url).searchParams.get("intent");
  const { role, user } = await getCurrentRole(); // also creates the user row

  if (role === "guest") return redirect("/sign-in");
  if (role === "admin") return redirect("/dashboard");

  if (intent === "admin" && user) {
    await requestAdminAccess(user);
    return redirect("/travel?admin=requested");
  }

  return redirect("/travel");
};

export default function AuthCallback() {
  return <p className="p-6">Signing you in...</p>;
}
