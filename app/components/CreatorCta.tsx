import { useState } from "react";
import { Link, useRevalidator } from "react-router";
import { loginWithGoogle, requestAdminAccess } from "~/appwrite/auth";
import type { UserRole } from "~/appwrite/auth";

type Props = {
  role: UserRole;
  adminRequested?: boolean;
  account: { $id: string; accountId: string } | null;
};

const CreatorCta = ({ role, adminRequested = false, account }: Props) => {
  const revalidator = useRevalidator();
  const [sending, setSending] = useState(false);

  const handleRequest = async () => {
    if (!account) return;
    setSending(true);
    await requestAdminAccess(account);
    revalidator.revalidate(); // reload the loader so the banner shows "pending"
    setSending(false);
  };

  const heading =
    role === "admin"
      ? "Manage your AI-generated trips"
      : role === "user"
        ? "Want to create your own trips?"
        : "Create and manage your own trips";

  const text =
    role === "admin"
      ? "Head back to your dashboard to create, edit, or delete trips."
      : role === "user"
        ? adminRequested
          ? "Your admin request is pending. You can keep browsing trips until it's approved."
          : "Request admin access to generate AI itineraries and manage trips."
        : "Sign up as a user to browse, or request admin access to create trips.";

  const primary =
    "rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50 cursor-pointer";
  const secondary =
    "rounded-xl border border-white/70 px-6 py-3 font-semibold text-white transition hover:bg-white/10 cursor-pointer";

  return (
    <section className="relative mt-2 mb-6  overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg md:p-8">
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-12 right-24 size-32 rounded-full bg-white/10" />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="mb-1 text-sm font-medium uppercase tracking-wide text-white/80">
            For admins and trip creators
          </p>
          <h2 className="text-2xl font-semibold md:text-3xl">{heading}</h2>
          <p className="mt-2 text-white/90">{text}</p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          {role === "guest" && (
            <>
              <button
                type="button"
                onClick={() => loginWithGoogle("user")}
                className={primary}
              >
                Sign up as user
              </button>
              <button
                type="button"
                onClick={() => loginWithGoogle("admin")}
                className={secondary}
              >
                Request admin access
              </button>
            </>
          )}

          {role === "user" && (
            <button
              type="button"
              onClick={handleRequest}
              disabled={adminRequested || sending}
              className={`${primary} disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {adminRequested
                ? "Request pending"
                : sending
                  ? "Sending..."
                  : "Request admin access"}
            </button>
          )}

          {role === "admin" && (
            <Link to="/dashboard" className={primary}>
              Go to dashboard
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default CreatorCta;
