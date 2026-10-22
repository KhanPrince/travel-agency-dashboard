import { useCallback, useEffect, useRef, useState } from "react";
import TripCard from "~/components/TripCard";
import { getAllTrips } from "~/routes/api/trips";

type Props = {
  initialTrips: TripCardProps[];
  total: number;
  pageSize?: number;
  userId?: string; // pass to load only one user's trips
};

const InfiniteTripGrid = ({
  initialTrips,
  total,
  pageSize = 12,
  userId,
}: Props) => {
  const [trips, setTrips] = useState(initialTrips);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false); // prevents double-fetch from fast scrolling

  // reset if the loader re-runs (navigation back, revalidation)
  useEffect(() => setTrips(initialTrips), [initialTrips]);

  const hasMore = trips.length < total;

  const loadMore = useCallback(async () => {
    if (busy.current || !hasMore) return;
    busy.current = true;
    setLoading(true);
    setError(false);
    try {
      const { trips: next } = await getAllTrips(pageSize, trips.length, userId);
      setTrips((prev) => {
        const seen = new Set(prev.map((t) => t.id)); // dedupe if rows shifted
        return [...prev, ...next.filter((t) => !seen.has(t.id))];
      });
    } catch {
      setError(true);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, [hasMore, pageSize, trips.length, userId]);

  // auto-load when the sentinel nears the viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || error) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { rootMargin: "400px" }, // start loading before the user hits the bottom
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, error, loadMore]);

  return (
    <>
      <div className="trip-grid">
        {trips.map((trip) => (
          <TripCard key={trip.id} {...trip} />
        ))}
      </div>

      <div ref={sentinelRef} className="flex flex-col items-center gap-3 py-8">
        {loading && <p className="text-gray-100">Loading more trips...</p>}

        {error && <p className="error">Couldn't load more trips.</p>}

        {hasMore && !loading && (
          <button
            type="button"
            onClick={loadMore}
            className="button-class text-white h-10 cursor-pointer"
          >
            {error ? "Try again" : "Load more"}
          </button>
        )}

        {!hasMore && trips.length > 0 && (
          <p className="text-gray-100 text-sm">
            You've seen all {total} trips.
          </p>
        )}
      </div>
    </>
  );
};

export default InfiniteTripGrid;
