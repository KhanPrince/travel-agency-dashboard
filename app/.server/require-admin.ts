import { Account, Client, Query, TablesDB } from "appwrite";

const endpoint = import.meta.env.VITE_APPWRITE_API_ENDPOINT;
const project = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const userTableId = import.meta.env.VITE_APPWRITE_USERS_TABLE_ID;

export async function requireAdmin(request: Request) {
  const jwt = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!jwt) throw Response.json({ error: "Unauthorized" }, { status: 401 });

  // A fresh client per request, acting AS the user (never share this client)
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(project)
    .setJWT(jwt);

  let user;
  try {
    user = await new Account(client).get();
  } catch {
    throw Response.json(
      { error: "Invalid or expired session" },
      { status: 401 },
    );
  }

  const db = new TablesDB(client);
  const { rows } = await db.listRows({
    databaseId,
    tableId: userTableId,
    queries: [Query.equal("accountId", user.$id), Query.limit(1)],
  });

  if (rows[0]?.status !== "admin") {
    throw Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return { user, db };
}
