import { ID, OAuthProvider, Permission, Query, Role } from "appwrite";
import { account, appwriteConfig, database } from "./client";
import { redirect } from "react-router";

export type SignUpIntent = "user" | "admin";

export const loginWithGoogle = async (intent: SignUpIntent = "user") => {
  try {
    // createOAuth2Session takes objct with keys => provider,(success,failure,scopes) => optional
    account.createOAuth2Session({
      provider: OAuthProvider.Google,
      success: `${window.location.origin}/auth/callback?intent=${intent}`,
      failure: `${window.location.origin}/sign-in`,
    });
  } catch (e) {
    throw redirect("/sign-in");
  }
};

export type UserRole = "guest" | "user" | "admin";

export const getCurrentRole = async () => {
  try {
    const authUser = await account.get(); // throws when not signed in
    const row =
      (await getExistingUser(authUser.$id)) ?? (await storeUserData());

    const role: UserRole = row?.status === "admin" ? "admin" : "user";
    return { role, user: row };
  } catch {
    return { role: "guest" as UserRole, user: null };
  }
};
export const getUser = async () => {
  try {
    const user = await account.get();

    const { rows } = await database.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTableId,
      queries: [
        Query.equal("accountId", user.$id),
        Query.select([
          "name",
          "email",
          "imageUrl",
          "joinedAt",
          "accountId",
          "status",
        ]),
      ],
    });

    if (rows.length === 0) throw redirect("/sign-in");
    return rows[0];
  } catch (e) {
    // let thrown redirects pass through instead of turning them into null
    if (e instanceof Response) throw e;
    return null;
  }
};
export const logoutUser = async () => {
  try {
    await account.deleteSession({ sessionId: "current" });
    return true;
  } catch (e) {
    return false;
  }
};
export const getGooglePicture = async () => {
  try {
    // get current user session
    const session = await account.getSession({ sessionId: "current" });

    // get OAuth2 token from the session
    const OAuthToken = session.providerAccessToken;

    if (!OAuthToken) {
      return null;
    }

    // Make request to google people API to get the profile photo
    const response = await fetch(
      "https://people.googleapis.com/v1/people/me?personFields=photos",
      {
        headers: {
          Authorization: `Bearer ${OAuthToken}`,
        },
      },
    );

    if (!response.ok) {
      console.log("Failed to fetch profile photo from google people API");
      return null;
    }

    const data = await response.json();

    // Extract profile photo URL from response
    const photoUrl =
      data.photos && data.photos.length > 0 ? data.photos[0].url : null;
    return photoUrl;
  } catch (e) {
    console.log(e);
  }
};
export const storeUserData = async () => {
  try {
    const user = await account.get();

    if (!user) return null;

    const { rows } = await database.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTableId,
      queries: [Query.equal("accountId", user.$id)],
    });

    if (rows.length > 0) return rows[0];

    // get profile photo from google
    const imageUrl = await getGooglePicture();

    // create new user row
    const newUser = await database.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTableId,
      rowId: ID.unique(),
      data: {
        accountId: user.$id,
        email: user.email,
        name: user.name,
        imageUrl: imageUrl || "",
        joinedAt: new Date().toISOString(),
        status: "user",
      },
      permissions: [Permission.read(Role.user(user.$id))],
    });
    return newUser;
  } catch (e) {
    console.log("storeUserData error", e);
    return null;
  }
};
export const getExistingUser = async (id: string) => {
  try {
    const { rows, total } = await database.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTableId,
      queries: [Query.equal("accountId", id)],
    });

    return total > 0 ? rows[0] : null;
  } catch (e) {
    console.log(" Error fetching existingUser", e);
    return null;
  }
};

export const getAllUsers = async (limit: number, offset: number) => {
  try {
    const { rows: users, total } = await database.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTableId,
      queries: [Query.limit(limit), Query.offset(offset)],
    });
    // if there are no users
    if (total === 0) return { users: [], total };

    return { users, total };
  } catch (e) {
    return { users: [], total: 0 };
  }
};

export const hasAdminRequest = async (accountId: string) => {
  try {
    await database.getRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.adminRequestsTableId,
      rowId: accountId, // request rows use the account id as their row id
    });
    return true;
  } catch {
    return false; // 404 means no request yet
  }
};

export const requestAdminAccess = async (user: {
  $id: string;
  accountId: string;
}) => {
  try {
    await database.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.adminRequestsTableId,
      rowId: user.accountId,
      data: { userId: user.$id },
      permissions: [Permission.read(Role.user(user.accountId))],
    });
    return true;
  } catch (e) {
    return (e as any)?.code === 409; // already requested counts as success
  }
};
//checking user access
export const getAccessState = async () => {
  const { role, user } = await getCurrentRole();
  const adminRequested =
    role === "user" && user ? await hasAdminRequest(user.accountId) : false;
  const account = user ? { $id: user.$id, accountId: user.accountId } : null;
  return { role, user, adminRequested, account };
};
