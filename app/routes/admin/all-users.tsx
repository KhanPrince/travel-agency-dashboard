import "@syncfusion/ej2-react-grids/styles/material.css";
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
} from "@syncfusion/ej2-react-grids";
import { Header } from "~/components";
import AccessGate from "~/components/AccessGate";
import { cn, formatDate } from "~/lib/utils";
import { getAccessState, getAllUsers } from "~/appwrite/auth";
import type { Route } from "./+types/all-users";

// Runs in the browser, so the request carries the signed-in user's session.
// (The old server `loader` had no session and its data URL was open to anyone.)
export const clientLoader = async () => {
  const access = await getAccessState();

  if (access.role !== "admin") {
    return { allowed: false as const, access };
  }

  const { users, total } = await getAllUsers(10, 0);
  return { allowed: true as const, access, users, total };
};

const AllUsers = ({ loaderData }: Route.ComponentProps) => {
  if (!loaderData.allowed) {
    return <AccessGate title="Manage Users" access={loaderData.access} />;
  }

  const { users } = loaderData;

  return (
    <main className="all-users wrapper">
      <Header
        title="Manage Users"
        description="Filter, sort, and access detailed user profiles"
      />

      <GridComponent dataSource={users} gridLines="None">
        <ColumnsDirective>
          <ColumnDirective
            field="name"
            headerText="Name"
            width="200"
            textAlign="Left"
            template={(props: UserData) => (
              <div className="flex items-center gap-1.5 px-4">
                <img
                  src={props.imageUrl}
                  alt="user"
                  className="rounded-full size-8 aspect-square"
                  referrerPolicy="no-referrer"
                />
                <span>{props.name}</span>
              </div>
            )}
          />
          <ColumnDirective
            field="email"
            headerText="Email Address"
            width="200"
            textAlign="Left"
          />
          <ColumnDirective
            field="joinedAt"
            headerText="Joined At"
            width="120"
            textAlign="Left"
            template={({ joinedAt }: { joinedAt: string }) =>
              formatDate(joinedAt)
            }
          />
          <ColumnDirective
            field="status"
            headerText="Type"
            width="100"
            textAlign="Left"
            template={({ status }: UserData) => (
              <article
                className={cn(
                  "status-column",
                  status === "user" ? "bg-success-50" : "bg-light-300",
                )}
              >
                <div
                  className={cn(
                    "size-1.5 rounded-full",
                    status === "user" ? "bg-success-500" : "bg-gray-500",
                  )}
                />
                <h3
                  className={cn(
                    "font-inter text-xs font-medium",
                    status === "user" ? "text-success-700" : "text-gray-500",
                  )}
                >
                  {status}
                </h3>
              </article>
            )}
          />
        </ColumnsDirective>
      </GridComponent>
    </main>
  );
};

export default AllUsers;
