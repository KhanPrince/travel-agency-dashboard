import "@syncfusion/ej2-react-dropdowns/styles/material.css";
import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import { Header } from "~/components";
import type { Route } from "./+types/create-trip";
import { comboBoxItems, selectItems } from "~/constants";
import { cn, formatKey } from "~/lib/utils";
import {
  LayerDirective,
  LayersDirective,
  MapsComponent,
} from "@syncfusion/ej2-react-maps";
import { useState } from "react";
import { world_map } from "~/constants/world_map";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { account } from "~/appwrite/client";
import { useNavigate } from "react-router";
import { getAccessState } from "~/appwrite/auth";
import AccessGate from "~/components/AccessGate";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// server loader
export const clientLoader = async ({
  serverLoader,
}: Route.ClientLoaderArgs) => {
  const access = await getAccessState();
  if (access.role !== "admin")
    return { allowed: false as const, access, countries: [] as Country[] };
  return {
    allowed: true as const,
    access,
    countries: (await serverLoader()) as Country[],
  };
};
clientLoader.hydrate = true as const;
export const HydrateFallback = () => null;

export const loader = async () => {
  const apiKey = process.env.RESTCOUNTRIES_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESTCOUNTRIES_API_KEY is not configured on the server. Add a REST Countries API key to your environment.",
    );
  }

  const pageSize = 100;
  const countryRecords: unknown[] = [];
  let total = 0;

  for (let offset = 0; offset < total || offset === 0; offset += pageSize) {
    const url = new URL("https://api.restcountries.com/countries/v5");
    url.searchParams.set(
      "response_fields",
      "names.common,flag.emoji,coordinates,links.open_street_maps",
    );
    url.searchParams.set("limit", String(pageSize));
    url.searchParams.set("offset", String(offset));

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) {
      throw new Error(
        `REST Countries API request failed with status ${response.status}.`,
      );
    }

    const payload: unknown = await response.json();
    if (!isRecord(payload) || !isRecord(payload.data)) {
      throw new Error("REST Countries API returned an invalid response.");
    }

    const { objects, meta } = payload.data;
    if (
      !Array.isArray(objects) ||
      !isRecord(meta) ||
      typeof meta.total !== "number"
    ) {
      throw new Error("REST Countries API returned an invalid country list.");
    }

    total = meta.total;
    if (objects.length === 0 && offset < total) {
      throw new Error(
        "REST Countries API returned an incomplete country list.",
      );
    }
    countryRecords.push(...objects);
  }

  return countryRecords.flatMap((record): Country[] => {
    if (!isRecord(record)) return [];

    const names = record.names;
    const flag = record.flag;
    const coordinates = record.coordinates;
    const links = record.links;
    if (
      !isRecord(names) ||
      typeof names.common !== "string" ||
      !isRecord(coordinates) ||
      typeof coordinates.lat !== "number" ||
      typeof coordinates.lng !== "number"
    ) {
      return [];
    }

    const emoji =
      isRecord(flag) && typeof flag.emoji === "string" ? flag.emoji : "";
    const openStreetMap =
      isRecord(links) && typeof links.open_street_maps === "string"
        ? links.open_street_maps
        : undefined;

    return [
      {
        name: `${emoji ? `${emoji} ` : ""}${names.common}`,
        coordinates: [coordinates.lat, coordinates.lng],
        value: names.common,
        openStreetMap,
      },
    ];
  });
};
const CreateTripForm = ({ countries }: { countries: Country[] }) => {
  const navigate = useNavigate();
  // useState for countries map
  const [formData, setFormData] = useState<TripFormData>({
    country: countries[0]?.value || "",
    travelStyle: "",
    interest: "",
    budget: "",
    duration: 0,
    groupType: "",
  });

  // Error useState
  const [error, setError] = useState<string | null>(null);
  // Loading state
  const [loading, setLoading] = useState(false);
  // dummy handlesubmit function
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (
      !formData.country ||
      !formData.travelStyle ||
      !formData.interest ||
      !formData.budget ||
      !formData.groupType
    ) {
      setError("Please provide values for all fields");
      setLoading(false);
      return;
    }
    if (formData.duration < 1 || formData.duration > 10) {
      setError("Duration must be between 1 and 10 days");
      setLoading(false);
      return;
    }

    try {
      const { jwt } = await account.createJWT();
      const response = await fetch("/trips/api/create-trip", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          country: formData.country,
          numberOfDays: formData.duration,
          travelStyle: formData.travelStyle,
          interests: formData.interest,
          budget: formData.budget,
          groupType: formData.groupType,
        }),
      });
      const text = await response.text();
      const result = JSON.parse(text);

      if (response.ok && result?.id) {
        navigate(`/trips/${result.id}`);
        return;
      }

      const message = result?.error || "Failed to generate trip";
      setError(message);
      console.error("Failed to generate trip", message);
    } catch (e) {
      console.error("Error Generating Trip", e);
      setError(
        "Something went wrong while generating the trip. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  //dummy handleChange
  const handleChange = (key: keyof TripFormData, value: string | number) => {
    setFormData({ ...formData, [key]: value });
  };

  const countryData = countries.map((country) => ({
    text: country.name,
    value: country.value,
  }));

  const mapData = [
    {
      country: formData.country,
      color: "#EA382E",
      coordinates:
        countries.find((c: Country) => c.value === formData.country)
          ?.coordinates || [],
    },
  ];
  return (
    <main className="flex flex-col gap-10  wrapper">
      <Header
        title="Add a New Trip"
        description="View and edit AI Generated travel plans"
      />
      <section className="mt-2.5  wrapper-md">
        <form className="trip-form" onSubmit={handleSubmit}>
          {/* country ComboBoxComponent */}
          <div>
            <label htmlFor="country">Country</label>
            <ComboBoxComponent
              id="country"
              dataSource={countryData}
              fields={{ text: "text", value: "value" }}
              placeholder="Select a Country"
              className="combo-box"
              change={(e: { value: string | undefined }) => {
                if (e.value) {
                  handleChange("country", e.value);
                }
              }}
              allowFiltering
              filtering={(e) => {
                const query = e.text.toLowerCase();

                e.updateData(
                  countries
                    .filter((country) =>
                      country.name.toLowerCase().includes(query),
                    )
                    .map((country) => ({
                      text: country.name,
                      value: country.value,
                    })),
                );
              }}
            />
          </div>

          {/* duration input */}
          <div>
            <label htmlFor="duration">Duration</label>
            <input
              id="duration"
              name="duration"
              placeholder="Enter number of  days"
              className="form-input placeholder:text-gray-100"
              onChange={(e) => handleChange("duration", Number(e.target.value))}
            />
          </div>
          {/* GroupType, TravelStyle, Interest,& Budget inputs<ComboBoxComponents> */}
          {selectItems.map((key) => (
            <div key={key}>
              <label htmlFor={key}>{formatKey(key)}</label>

              <ComboBoxComponent
                id={key}
                dataSource={comboBoxItems[key].map((item) => ({
                  text: item,
                  value: item,
                }))}
                fields={{ text: "text", value: "value" }}
                placeholder={`Select ${formatKey(key)}`}
                change={(e: { value: string | undefined }) => {
                  if (e.value) {
                    handleChange(key, e.value);
                  }
                }}
                allowFiltering
                filtering={(e) => {
                  const query = e.text.toLowerCase();

                  e.updateData(
                    comboBoxItems[key]
                      .filter((item) => item.toLowerCase().includes(query))
                      .map((item) => ({ text: item, value: item })),
                  );
                }}
                className="combo-box"
              />
            </div>
          ))}

          {/* country maps */}
          <div>
            <label htmlFor="location">Location on the world map</label>
            <MapsComponent>
              <LayersDirective>
                <LayerDirective
                  shapeData={world_map}
                  dataSource={mapData}
                  shapePropertyPath="name"
                  shapeDataPath="country"
                  shapeSettings={{ colorValuePath: "color", fill: "#e5e5e5" }}
                />
              </LayersDirective>
            </MapsComponent>
          </div>
          {/* end div  */}
          <div className="bg-gray-200 h-px w-full" />
          {/* error handling */}
          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}
          <footer className="px-6 w-full">
            <ButtonComponent
              type="submit"
              className="button-class h-12! w-full!"
              disabled={loading}
            >
              <img
                src={`/assets/icons/${loading ? "loader.svg" : "magic-star.svg"}`}
                className={cn("size-5", { "animate-spin": loading })}
              />
              <span className="p-16-semibold text-white">
                {loading ? "Generating..." : "Generate"}
              </span>
            </ButtonComponent>
          </footer>
        </form>
      </section>
    </main>
  );
};
export default function CreateTrip({ loaderData }: Route.ComponentProps) {
  return loaderData.allowed ? (
    <CreateTripForm countries={loaderData.countries} />
  ) : (
    <AccessGate title="Add a New Trip" access={loaderData.access} />
  );
}
