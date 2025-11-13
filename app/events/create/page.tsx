"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type EventFormData = {
  title: string;
  club: string;
  starts_at: string;
  ends_at: string;
  location: string;
  tags: string[];
  current_attendees: number;
};

const availableTags = [
  "tech",
  "food",
  "games",
  "study",
  "social",
  "career",
  "networking",
] as const;

export default function CreateEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    club: "",
    starts_at: "",
    ends_at: "",
    location: "",
    tags: [],
    current_attendees: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof EventFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    }

    if (!formData.club.trim()) {
      newErrors.club = "Club name is required";
    }

    if (!formData.starts_at) {
      newErrors.starts_at = "Start date and time is required";
    } else {
      const startDate = new Date(formData.starts_at);
      if (startDate < new Date()) {
        newErrors.starts_at = "Start time must be in the future";
      }
    }

    if (formData.ends_at) {
      const startDate = new Date(formData.starts_at);
      const endDate = new Date(formData.ends_at);
      if (endDate <= startDate) {
        newErrors.ends_at = "End time must be after start time";
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (formData.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new event
      const eventData = {
        title: formData.title.trim(),
        club: formData.club.trim(),
        starts_at: new Date(formData.starts_at).toISOString(),
        ends_at: formData.ends_at
          ? new Date(formData.ends_at).toISOString()
          : null,
        location: formData.location.trim(),
        tags: formData.tags,
        current_attendees: formData.current_attendees,
      };

      // Save to API
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create event');
      }

      // Redirect to dashboard
      router.push("/");
    } catch (error: any) {
      console.error("Error creating event:", error);
      alert(error.message || "Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current date/time for min attribute
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <main className="min-h-screen w-full bg-neutral-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-700"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-neutral-700">Create New Event</h1>
          <p className="mt-2 text-lg text-neutral-500">
            Fill in the details below to create a new campus event
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`input w-full ${errors.title ? "border-red-500" : ""}`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Club Name */}
          <div>
            <label
              htmlFor="club"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Club/Organization <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="club"
              name="club"
              value={formData.club}
              onChange={handleInputChange}
              className={`input w-full ${errors.club ? "border-red-500" : ""}`}
            />
            {errors.club && (
              <p className="mt-1 text-sm text-red-500">{errors.club}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="starts_at"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="starts_at"
                name="starts_at"
                value={formData.starts_at}
                onChange={handleInputChange}
                min={minDateTime}
                className={`input w-full ${errors.starts_at ? "border-red-500" : ""}`}
              />
              {errors.starts_at && (
                <p className="mt-1 text-sm text-red-500">{errors.starts_at}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="ends_at"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                End Date & Time
              </label>
              <input
                type="datetime-local"
                id="ends_at"
                name="ends_at"
                value={formData.ends_at}
                onChange={handleInputChange}
                min={formData.starts_at || minDateTime}
                className={`input w-full ${errors.ends_at ? "border-red-500" : ""}`}
              />
              {errors.ends_at && (
                <p className="mt-1 text-sm text-red-500">{errors.ends_at}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={`input w-full ${errors.location ? "border-red-500" : ""}`}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Tags <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    formData.tags.includes(tag)
                      ? "bg-secondary-500 text-neutral-600 shadow-soft"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {errors.tags && (
              <p className="mt-1 text-sm text-red-500">{errors.tags}</p>
            )}
          </div>

          {/* Initial Attendees */}
          <div>
            <label
              htmlFor="current_attendees"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Initial Attendees Count
            </label>
            <input
              type="number"
              id="current_attendees"
              name="current_attendees"
              value={formData.current_attendees}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  current_attendees: Math.max(0, parseInt(e.target.value) || 0),
                }))
              }
              min="0"
              className="input w-full"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Optional: Set the initial number of attendees
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary-700 px-6 py-3 text-white font-medium shadow-soft hover:bg-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
            <Link
              href="/"
              className="rounded-lg border border-neutral-200 bg-white px-6 py-3 text-neutral-700 font-medium hover:bg-neutral-50 transition-all duration-200"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

