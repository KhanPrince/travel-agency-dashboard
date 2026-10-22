import { Query } from "appwrite";
import { appwriteConfig, database } from "~/appwrite/client";

const safeParse = (value: unknown) => {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return null;
  }
};

const toArray = (value: unknown): any[] => {
  let v: unknown = value;
  // unwrap up to twice in case it was double-stringified
  for (let i = 0; i < 2 && typeof v === "string"; i++) {
    try {
      v = JSON.parse(v);
    } catch {
      return [];
    }
  }
  if (Array.isArray(v)) return v;
  // handle shapes like { itinerary: [...] } or { days: [...] }
  if (v && typeof v === "object") {
    const inner = (v as any).itinerary ?? (v as any).days;
    if (Array.isArray(inner)) return inner;
  }
  return [];
};

const mapTrip = (row: any) => {
  const location = safeParse(row.location);
  return {
    id: row.$id as string,
    name: row.name as string,
    location: (location?.city ?? row.country) as string,
    imageUrl: (row.imageUrls?.[0] ??
      "/assets/images/placeholder.png") as string,
    tags: [row.interests, row.travelStyle].filter(Boolean) as string[],
    price: row.estimatedPrice as string,
  };
};
const mapTripDetail = (row: any) => {
  const location = safeParse(row.location);
  return {
    id: row.$id as string,
    name: row.name as string,
    location: (location?.city ?? row.country) as string,
    imageUrls: (row.imageUrls?.length
      ? row.imageUrls
      : ["/assets/images/placeholder.png"]) as string[],

    description: row.description as string,
    estimatedPrice: row.estimatedPrice as string,
    duration: row.duration as string,
    budget: row.budget as string,
    travelStyle: row.travelStyle as string,
    interests: row.interests as string,
    groupType: row.groupType as string,
    country: row.country as string,
    userId: row.userId as string,
    itinerary: toArray(row.itinerary),
    bestTimeToVisit: toArray(row.bestTimeToVisit),
    weatherInfo: toArray(row.weatherInfo),
  };
};
// fetching trips created by a specific user
export const getAllTrips = async (limit = 8, offset = 0, userId?: string) => {
  const queries = [
    Query.select([
      "name",
      "location",
      "country",
      "imageUrls",
      "interests",
      "travelStyle",
      "estimatedPrice",
    ]),
    Query.limit(limit),
    Query.offset(offset),
    Query.orderDesc("$createdAt"),
  ];
  if (userId) queries.push(Query.equal("userId", userId));

  const res = await database.listRows({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.tripTableId,
    queries,
  });

  return { total: res.total, trips: res.rows.map(mapTrip) };
};

export const getTripById = async (id: string) => {
  const res = await database.getRow({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.tripTableId,
    rowId: id,
  });
  return res ? mapTripDetail(res) : null;
};

export const updateTrip = async (id: string, data: Record<string, unknown>) =>
  database.updateRow({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.tripTableId,
    rowId: id,
    data,
  });

export const deleteTrip = async (id: string) =>
  database.deleteRow({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.tripTableId,
    rowId: id,
  });
