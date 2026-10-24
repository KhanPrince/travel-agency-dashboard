import { GoogleGenAI } from "@google/genai";
import { ID, Permission, Role } from "appwrite";
import type { ActionFunctionArgs } from "react-router";
import { appwriteConfig } from "~/appwrite/client";
import { requireAdmin } from "~/.server/require-admin";
import {
  budgetOptions,
  groupTypes,
  interests as interestOptions,
  travelStyles,
} from "~/constants";
import { count } from "node:console";

const json = (body: unknown, status = 200) => Response.json(body, { status });

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST")
    return json({ error: "Method not allowed" }, 405);

  const { user, db } = await requireAdmin(request);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object")
    return json({ error: "Invalid request" }, 400);

  const country = String(body.country ?? "").trim();
  const numberOfDays = Number(body.numberOfDays);
  const { travelStyle, interests, budget, groupType } = body;

  if (
    !country ||
    country.length > 60 ||
    !Number.isInteger(numberOfDays) ||
    numberOfDays < 1 ||
    numberOfDays > 10 ||
    !travelStyles.includes(travelStyle) ||
    !interestOptions.includes(interests) ||
    !budgetOptions.includes(budget) ||
    !groupTypes.includes(groupType)
  ) {
    return json({ error: "Invalid trip information." }, 400);
  }

  const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY!;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  async function findImages(
    country: string,
    interests: string,
    travelStyle: string,
  ) {
    const queries = [
      `${country} ${interests} ${travelStyle}`,
      `${country} travel`,
      `${country} landscape`,
    ];
    for (const q of queries) {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=3&orientation=landscape&client_id=${process.env.UNSPLASH_ACCESS_KEY}`,
          { signal: AbortSignal.timeout(5000) },
        );
        if (!res.ok) continue;
        const json = await res.json();
        const urls = (json?.results ?? [])
          .map((r: any) => r?.urls?.regular)
          .filter(Boolean)
          .slice(0, 3);
        if (urls.length) return urls as string[];
      } catch {
        /* try the next query */
      }
    }
    return [];
  }

  try {
    const prompt = `Generate a ${numberOfDays}-day travel itinerary for ${country} based on the following user information:
    Budget: '${budget}'
    Interests: '${interests}'
    TravelStyle: '${travelStyle}'
    GroupType: '${groupType}'
    Return ONLY valid JSON with this exact structure:
    {
      "name": "A descriptive title for the trip",
      "description": "A brief description of the trip and its highlights not exceeding 100 words",
      "estimatedPrice": "Lowest average price for the trip in INR, e.g. ₹25000",
      "duration": ${numberOfDays},
      "budget": "${budget}",
      "travelStyle": "${travelStyle}",
      "country": "${country}",
      "interests": "${interests}",
      "groupType": "${groupType}",
      "bestTimeToVisit": [
        "🌸 Season (from month to month): reason to visit",
        "☀️ Season (from month to month): reason to visit",
        "🍁 Season (from month to month): reason to visit",
        "❄️ Season (from month to month): reason to visit"
      ],
      "weatherInfo": [
        "☀️ Season: temperature range in Celsius",
        "🌦️ Season: temperature range in Celsius",
        "🌧️ Season: temperature range in Celsius",
        "❄️ Season: temperature range in Celsius"
      ],
      "location": {
        "city": "name of the city or region",
        "coordinates": [latitude, longitude],
        "openStreetMap": "link to open street map"
      },
      "itinerary": [
        {
          "day": 1,
          "location": "City/Region Name",
          "activities": [
            {"time": "Morning", "description": "🏰 Visit the local historic castle"},
            {"time": "Afternoon", "description": "🖼️ Explore a famous museum"},
            {"time": "Evening", "description": "🍷 Dine at a rooftop restaurant"}
          ]
        }
      ]
    }`;

    const textResult = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const responseText = textResult.text?.trim();
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    const trip = JSON.parse(responseText);

    const imageUrls = await findImages(country, interests, travelStyle);
    if (imageUrls.length === 0) {
      return Response.json(
        {
          error:
            "We couldn't find photos for this destination. Try another country or interest.",
        },
        { status: 502 },
      );
    }

    const row = await db.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.tripTableId,
      rowId: ID.unique(),
      data: {
        name: trip.name,
        description: trip.description,
        estimatedPrice: trip.estimatedPrice,
        duration: numberOfDays, // ✅ from validated input
        budget,
        travelStyle,
        country,
        groupType,
        interests,
        bestTimeToVisit: trip.bestTimeToVisit,
        weatherInfo: trip.weatherInfo,
        location: JSON.stringify(trip.location),
        itinerary: JSON.stringify(trip.itinerary),
        createdAt: new Date().toISOString(),
        imageUrls,
        userId: user.$id,
      },
      permissions: [
        Permission.read(Role.any()),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ],
    });

    return json({ id: row.$id });
  } catch (error) {
    console.error("Error generating travel plan:", error);
    return json({ error: "Failed to generate trip. Please try again." }, 500);
  }
};
