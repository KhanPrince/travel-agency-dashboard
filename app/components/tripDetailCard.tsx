import {
  ChipDirective,
  ChipListComponent,
  ChipsDirective,
} from "@syncfusion/ej2-react-buttons";
import TripGallery from "~/components/tripGallery";
import { getFirstWord } from "~/lib/utils";

const TripDetailCard = ({
  name,
  description,
  estimatedPrice,
  duration,
  budget,
  travelStyle,
  interests,
  groupType,
  country,
  imageUrls,
  itinerary,
  bestTimeToVisit,
  weatherInfo,
  location,
}: Trip) => {
  const tags: string[] = [interests, travelStyle].filter(Boolean);

  const locationLabel =
    typeof location === "string"
      ? location + ", " + country
      : ((location as any)?.city ?? country);

  return (
    <div className="trip-card w-full h-auto ">
      {/* Gallery: horizontal swipe on mobile, collage grid on lg+ */}
      <TripGallery images={imageUrls} alt={name} />

      <article>
        <h2>{name}</h2>
        <figure>
          <img
            src="/assets/icons/location-mark.svg"
            alt="location"
            className="size-4"
          />
          <figcaption>{locationLabel}</figcaption>
        </figure>
      </article>

      <div className="mt-5 pl-4.5 pr-3.5">
        <ChipListComponent id="travel-chip">
          <ChipsDirective>
            {tags.map((tag, index) => (
              <ChipDirective
                key={index}
                text={getFirstWord(tag)}
                cssClass="!bg-success-50 !text-success-700"
              />
            ))}
          </ChipsDirective>
        </ChipListComponent>
      </div>

      <article className="tripCard-pill">{estimatedPrice}</article>

      {/* Full details */}
      <div className="px-4.5 pb-6 pt-5 flex flex-col gap-6">
        <p>{description}</p>

        <ul className="grid grid-cols-2 gap-2 text-sm">
          <li>
            <strong>Duration:</strong> {duration} days
          </li>
          <li>
            <strong>Budget:</strong> {budget}
          </li>
          <li>
            <strong>Group:</strong> {groupType}
          </li>
          <li>
            <strong>Country:</strong> {country}
          </li>
          <li className="col-span-2">
            <strong>Interests:</strong> {interests}
          </li>
        </ul>

        <section>
          <h3 className="font-semibold mb-2">Best time to visit</h3>
          <ul className="space-y-1">
            {bestTimeToVisit?.map((t: string) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-2">Weather</h3>
          <ul className="space-y-1">
            {weatherInfo?.map((w: string) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-2">Itinerary</h3>
          {itinerary?.map((day: any) => (
            <div key={day.day} className="mb-4">
              <h4 className="font-medium mb-4">
                Day {day.day}: {day.location}
              </h4>
              <ul className="space-y-1">
                {day.activities?.map((a: any, i: number) => (
                  <li key={i}>
                    <strong>{a.time}:</strong> {a.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default TripDetailCard;
