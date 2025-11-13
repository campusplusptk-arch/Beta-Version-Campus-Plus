"use client";

import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  ChangeEvent,
} from "react";

type EventRow = {
  id: string;
  title: string;
  club: string;
  starts_at: string;
  ends_at?: string | null;
  location: string;
  tags: string[];
  current_attendees: number;
};

// Helper functions for date manipulation
function withTime(baseDate: Date, hour: number, minute: number) {
  const result = new Date(baseDate);
  result.setHours(hour, minute, 0, 0);
  return result;
}

function getUpcomingDay(date: Date, targetDay: number) {
  const result = new Date(date);
  const distance = (targetDay - result.getDay() + 7) % 7;
  result.setDate(result.getDate() + distance);
  result.setHours(0, 0, 0, 0);
  return result;
}

function upcomingWeekendDate(hour: number, minute: number) {
  const now = new Date();
  const saturday = getUpcomingDay(now, 6);
  const target = withTime(saturday, hour, minute);
  return target < now ? withTime(addDays(saturday, 7), hour, minute) : target;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

const timeFilters = ["All", "Today", "Tonight", "This Weekend"] as const;
const tagFilters = [
  "All",
  "tech",
  "food",
  "games",
  "study",
  "social",
  "career",
  "networking",
] as const;

export default function Home() {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<
    (typeof timeFilters)[number]
  >("All");
  const [selectedTagFilter, setSelectedTagFilter] = useState<
    (typeof tagFilters)[number]
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load events from API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/events?status=scheduled');
        const result = await response.json();
        
        if (response.ok && result.data) {
          setEvents(result.data);
        } else {
          console.error("Error loading events:", result.error);
          setEvents([]);
        }
      } catch (error) {
        console.error("Error loading events from API:", error);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();

    // Reload events when page becomes visible (e.g., returning from create page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadEvents();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", loadEvents);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", loadEvents);
    };
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = matchesSearchQuery(event, searchQuery);
      const matchesTag =
        selectedTagFilter === "All" || event.tags.includes(selectedTagFilter);
      const matchesTime = matchesTimeFilter(event, selectedTimeFilter);
      return matchesSearch && matchesTag && matchesTime;
    });
  }, [events, searchQuery, selectedTagFilter, selectedTimeFilter]);

  const displayEvents = useMemo(() => {
    return filteredEvents.map((event) => {
      const starts = new Date(event.starts_at);
      const ends = event.ends_at ? new Date(event.ends_at) : null;
      const isMultiDay = ends && formatDateKey(starts) !== formatDateKey(ends);
      
      const startDateStr = starts.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      const endDateStr = ends
        ? ends.toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
          })
        : null;
      
      const date = isMultiDay ? `${startDateStr} - ${endDateStr}` : startDateStr;
      
      const time = [
        starts.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }),
        ends
          ? ends.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })
          : null,
      ]
        .filter(Boolean)
        .join(" - ");

      return {
        id: event.id,
        title: event.title,
        club: event.club,
        date,
        time,
        location: event.location,
        tags: event.tags,
        attendees: event.current_attendees,
        isMultiDay: isMultiDay || undefined,
      };
    });
  }, [filteredEvents]);

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  return (
    <main className="min-h-screen w-full bg-neutral-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-neutral-600">
            Discover Campus Events
          </h1>
          <p className="text-lg text-neutral-500">
            Find something exciting happening around you
          </p>
        </section>

        <section className="mb-6">
          <div className="relative mx-auto max-w-2xl">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="input pl-12"
            />
          </div>
        </section>

        <section className="mb-4">
          <div className="flex flex-wrap justify-center gap-2">
            {timeFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedTimeFilter(filter)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedTimeFilter === filter
                    ? "bg-primary-700 text-white shadow-soft"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {tagFilters.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(tag)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedTagFilter === tag
                    ? "bg-secondary-500 text-neutral-600 shadow-soft"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-4 text-center">
          <p className="text-sm text-neutral-500">
            {displayEvents.length} event
            {displayEvents.length !== 1 ? "s" : ""} found
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-neutral-600">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-700"></div>
              <p className="text-neutral-500">Loading events...</p>
            </div>
          ) : displayEvents.length > 0 ? (
            displayEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-neutral-600">
              <EmptyState />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EventCard({
  title,
  club,
  date,
  time,
  location,
  tags,
  attendees,
  isMultiDay,
}: {
  title: string;
  club: string;
  date: string;
  time: string;
  location: string;
  tags: string[];
  attendees: number;
  isMultiDay?: boolean;
}) {
  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft-sm">
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-sm font-medium uppercase tracking-wide text-primary-700">
            {date}
          </p>
          {isMultiDay && (
            <span className="shrink-0 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
              Multi-day
            </span>
          )}
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-neutral-700">{title}</h2>
        <p className="mb-4 text-sm text-neutral-500">{club}</p>
        <dl className="space-y-2 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="font-medium">Time:</span>
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Location:</span>
            <span>{location}</span>
          </div>
        </dl>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="text-sm font-medium text-neutral-500">
          {attendees} attending
        </span>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <>
      <svg
        className="mb-4 h-16 w-16 text-neutral-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h3 className="mb-2 text-xl font-semibold text-neutral-600">
        No events found
      </h3>
      <p className="text-neutral-500">
        Try adjusting your filters or search query
      </p>
    </>
  );
}

function matchesSearchQuery(event: EventRow, query: string) {
  if (!query) return true;
  const normalizedQuery = query.toLowerCase();
  return (
    event.title.toLowerCase().includes(normalizedQuery) ||
    event.club.toLowerCase().includes(normalizedQuery)
  );
}

function matchesTimeFilter(event: EventRow, filter: (typeof timeFilters)[number]) {
  if (filter === "All") return true;

  const now = new Date();
  const starts = new Date(event.starts_at);

  if (filter === "Today") {
    return isSameDay(starts, now);
  }

  if (filter === "Tonight") {
    return isSameDay(starts, now) && starts.getHours() >= 17;
  }

  if (filter === "This Weekend") {
    const weekendStart = getUpcomingDay(now, 6);
    const weekendEnd = endOfDay(addDays(weekendStart, 1));
    return starts >= weekendStart && starts <= weekendEnd;
  }

  return true;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function endOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}