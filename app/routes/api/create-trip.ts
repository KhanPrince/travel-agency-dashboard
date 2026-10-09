import { GoogleGenAI } from "@google/genai";
import { ID } from "appwrite";
import { data, type ActionFunctionArgs } from "react-router";
import { appwriteConfig, database } from "~/appwrite/client";

const parseGeminiJson = (text: string) => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
  const trimmed = (fenced ?? text).trim();
  return trimmed.startsWith("{") ? trimmed : `{${trimmed}}`;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.json();
  const {
    country,
    numberOfDays,
    travelStyle,
    interests,
    budget,
    groupType,
    userId,
  } = body;

  if (
    !country ||
    !numberOfDays ||
    !travelStyle ||
    !interests ||
    !budget ||
    !groupType ||
    !userId
  ) {
    return data(
      { error: "Missing required trip information." },
      { status: 400 },
    );
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
    console.log("Generated trip:", trip);

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

    const result = await database.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.tripTableId,
      rowId: ID.unique(),
      data: {
        name: trip.name,
        description: trip.description,
        estimatedPrice: trip.estimatedPrice,
        duration: Number(trip.duration),
        budget: trip.budget,
        travelStyle: trip.travelStyle,
        country: trip.country,
        interests: trip.interests,
        groupType: trip.groupType,
        bestTimeToVisit: trip.bestTimeToVisit,
        weatherInfo: trip.weatherInfo,
        location: JSON.stringify(trip.location),
        itinerary: JSON.stringify(trip.itinerary),
        createdAt: new Date().toISOString(),
        imageUrls,
        userId,
      },
    });

    return data({ id: result.$id });
  } catch (error) {
    console.error("Error generating travel plan: ", error);
    return data(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error while generating trip.",
      },
      { status: 500 },
    );
  }
};
