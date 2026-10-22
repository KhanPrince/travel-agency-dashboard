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

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY!;

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

    const imageQuery = encodeURIComponent(
      `${country} ${interests} ${travelStyle}`,
    );
    const imageResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${imageQuery}&per_page=3&client_id=${unsplashApiKey}`,
      {
        headers: { Accept: "application/json" },
      },
    );

    if (!imageResponse.ok) {
      throw new Error(
        `Unsplash request failed with status ${imageResponse.status}`,
      );
    }

    const imageData = await imageResponse.json();
    const imageUrls = (imageData?.results ?? [])
      .slice(0, 3)
      .map((result: any) => result?.urls?.regular || null)
      .filter(Boolean);

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
