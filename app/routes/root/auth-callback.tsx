import { redirect } from "react-router";
import type { Route } from "./+types/auth-callback";

import { getCurrentRole, requestAdminAccess } from "~/appwrite/auth";

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  const intent = new URL(request.url).searchParams.get("intent");
  const { role, user } = await getCurrentRole(); // also creates the user row

  if (role === "guest" || !user) return redirect("/sign-in");
  if (role === "admin") return redirect("/dashboard");

  if (intent === "admin") {
    await requestAdminAccess({
      $id: user.$id,
      accountId: user.accountId as string,
    });
  }

  return redirect("/dashboard");
};

export default function AuthCallback() {
  return <p className="p-6">Signing you in...</p>;
}
