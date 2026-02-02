import { ID, OAuthProvider, Query } from "appwrite";
import { account, appwriteConfig, database } from "./client";
import { redirect } from "react-router";

export const loginWithGoogle = async () => {
  try {
    // createOAuth2Session takes objct with keys => provider,(success,failure,scopes) => optional
    account.createOAuth2Session({
      provider: OAuthProvider.Google,
      success: "http://localhost:5173/",
      failure: "http://localhost:5173/sign-in",
    });
  } catch (e) {
    console.log("loginWithGoogle", e);
    redirect("/sing-in");
    return null;
  }
};
export const getUser = async () => {
  try {
    const user = await account.get();
    if (!user) return redirect("/sign-in");

    const { rows } = await database.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTableId,
      queries: [
        Query.equal("accountId", user.$id),
        Query.select(["name", "email", "imageUrl", "joinedAt", "accountId"]),
      ],
    });
    return rows.length > 0 ? rows[0] : redirect("/sign-in");
  } catch (e) {
    console.log("Error fetching user", e);
    return null;
  }
};
export const logoutUser = async () => {
  try {
    await account.deleteSession({ sessionId: "current" });
    return true;
  } catch (e) {
    console.log("logOut User Error", e);
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
      console.log("No OAuth token available");
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
export const storeUserdata = async () => {
  try {
    const user = await account.get();

    if (!user) return null;

    // check if user already exists in the database
    // later to check with getRow
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
      },
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
