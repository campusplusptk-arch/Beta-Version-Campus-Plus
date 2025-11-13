"use client";

import { useState, useEffect, useMemo } from "react";

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

const today = new Date();
const DEFAULT_EVENTS: EventRow[] = [
  {
    id: "1",
    title: "Hackathon Kickoff",
    club: "Tech Innovators",
    starts_at: withTime(today, 10, 0).toISOString(),
    ends_at: withTime(today, 14, 0).toISOString(),
    location: "Innovation Hub",
    tags: ["tech", "career", "networking"],
    current_attendees: 48,
  },
  {
    id: "2",
    title: "Evening Study Session",
    club: "Academic Success Center",
    starts_at: withTime(today, 19, 0).toISOString(),
    ends_at: withTime(today, 21, 0).toISOString(),
    location: "Library Commons",
    tags: ["study"],
    current_attendees: 23,
  },
  {
    id: "3",
    title: "Saturday Brunch Social",
    club: "Campus Life",
    starts_at: upcomingWeekendDate(11, 0).toISOString(),
    ends_at: upcomingWeekendDate(13, 0).toISOString(),
    location: "Student Union Lawn",
    tags: ["food", "social"],
    current_attendees: 67,
  },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<EventRow[]>(DEFAULT_EVENTS);

  // Load events from localStorage
  useEffect(() => {
    const loadEvents = () => {
      try {
        const storedEvents = localStorage.getItem("events");
        if (storedEvents) {
          const parsedEvents: EventRow[] = JSON.parse(storedEvents);
          const defaultIds = new Set(DEFAULT_EVENTS.map((e) => e.id));
          const newEvents = parsedEvents.filter((e) => !defaultIds.has(e.id));
          setEvents([...DEFAULT_EVENTS, ...newEvents]);
        }
      } catch (error) {
        console.error("Error loading events from localStorage:", error);
      }
    };

    loadEvents();
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

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first day of the week that contains the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End on the last day of the week that contains the last day of the month
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventRow[]>();
    
    events.forEach((event) => {
      const eventDate = new Date(event.starts_at);
      const dateKey = formatDateKey(eventDate);
      
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });
    
    return map;
  }, [events]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = formatDateKey(selectedDate);
    return eventsByDate.get(dateKey) || [];
  }, [selectedDate, eventsByDate]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <main className="min-h-screen w-full bg-neutral-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-neutral-600">
            Event Calendar
          </h1>
          <p className="text-lg text-neutral-500">
            View all campus events in one place
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
              {/* Calendar Header */}
              <div className="mb-6 flex items-center justify-between">
                <button
                  onClick={() => navigateMonth("prev")}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-all hover:bg-neutral-50 hover:border-primary-300"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-neutral-700">
                    {monthName}
                  </h2>
                  <button
                    onClick={goToToday}
                    className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-800 shadow-soft"
                  >
                    Today
                  </button>
                </div>

                <button
                  onClick={() => navigateMonth("next")}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-all hover:bg-neutral-50 hover:border-primary-300"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Week Day Headers */}
              <div className="mb-2 grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-sm font-semibold text-neutral-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date, index) => {
                  const dateKey = formatDateKey(date);
                  const dayEvents = eventsByDate.get(dateKey) || [];
                  const hasEvents = dayEvents.length > 0;
                  const isTodayDate = isToday(date);
                  const isCurrentMonthDate = isCurrentMonth(date);
                  const isSelectedDate = isSelected(date);

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(new Date(date))}
                      className={`group relative flex min-h-[90px] flex-col rounded-lg border-2 p-2 transition-all ${
                        isSelectedDate
                          ? "border-primary-700 bg-primary-50 shadow-soft scale-105"
                          : isTodayDate
                          ? "border-secondary-500 bg-secondary-50"
                          : "border-neutral-200 bg-white hover:border-primary-300 hover:bg-neutral-50 hover:shadow-soft-sm"
                      } ${!isCurrentMonthDate ? "opacity-40" : ""}`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          isSelectedDate
                            ? "text-primary-700"
                            : isTodayDate
                            ? "text-secondary-700"
                            : "text-neutral-600"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      
                      {hasEvents && (
                        <div className="mt-1 flex flex-wrap gap-0.5">
                          {dayEvents.slice(0, 3).map((event, idx) => (
                            <div
                              key={event.id}
                              className={`h-1.5 flex-1 rounded-full ${
                                idx === 0
                                  ? "bg-primary-600"
                                  : idx === 1
                                  ? "bg-primary-400"
                                  : "bg-primary-300"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      
                      {hasEvents && dayEvents.length > 0 && (
                        <span className="mt-auto text-xs font-semibold text-primary-700">
                          {dayEvents.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Events Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
              {selectedDate ? (
                <>
                  <h3 className="mb-4 text-xl font-bold text-neutral-700">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>

                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateEvents.map((event) => {
                        const starts = new Date(event.starts_at);
                        const ends = event.ends_at ? new Date(event.ends_at) : null;
                        const time = [
                          starts.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          }),
                          ends
                            ? ends.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" - ");

                        return (
                          <div
                            key={event.id}
                            className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition-all hover:border-primary-300 hover:shadow-soft"
                          >
                            <h4 className="mb-1 text-lg font-semibold text-neutral-700">
                              {event.title}
                            </h4>
                            <p className="mb-2 text-sm text-neutral-500">
                              {event.club}
                            </p>
                            <div className="mb-3 space-y-1 text-sm text-neutral-600">
                              <div className="flex items-center gap-2">
                                <svg
                                  className="h-4 w-4 text-primary-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>{time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <svg
                                  className="h-4 w-4 text-primary-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span>{event.location}</span>
                              </div>
                            </div>
                            <div className="mb-3 flex flex-wrap gap-2">
                              {event.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-neutral-500">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              <span>{event.current_attendees} attending</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <svg
                        className="mb-4 h-12 w-12 text-neutral-300"
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
                      <p className="text-neutral-500">
                        No events scheduled for this day
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg
                    className="mb-4 h-12 w-12 text-neutral-300"
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
                  <p className="text-neutral-500">
                    Select a date to view events
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function withTime(baseDate: Date, hour: number, minute: number) {
  const result = new Date(baseDate);
  result.setHours(hour, minute, 0, 0);
  return result;
}

function upcomingWeekendDate(hour: number, minute: number) {
  const now = new Date();
  const saturday = getUpcomingDay(now, 6);
  const target = withTime(saturday, hour, minute);
  return target < now ? withTime(addDays(saturday, 7), hour, minute) : target;
}

function getUpcomingDay(date: Date, targetDay: number) {
  const result = new Date(date);
  const distance = (targetDay - result.getDay() + 7) % 7;
  result.setDate(result.getDate() + distance);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

