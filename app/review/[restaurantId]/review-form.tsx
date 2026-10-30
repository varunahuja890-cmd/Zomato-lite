"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-9 w-9"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M12 3.5l2.47 5.01 5.53.8-4 3.9.94 5.5L12 16.1l-4.94 2.6.94-5.5-4-3.9 5.53-.8L12 3.5z" />
    </svg>
  );
}

export function ReviewForm({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = rating > 0 && comment.trim().length > 0 && !isSubmitting;

  useEffect(() => {
    let isCurrent = true;

    async function loadRestaurant() {
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "The restaurant could not be loaded.");
        }

        if (isCurrent) {
          setRestaurantName(data.name);
        }
      } catch (loadFailure) {
        if (isCurrent) {
          setLoadError(
            loadFailure instanceof Error
              ? loadFailure.message
              : "The restaurant could not be loaded."
          );
        }
      }
    }

    loadRestaurant();

    return () => {
      isCurrent = false;
    };
  }, [restaurantId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          rating,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "The review could not be saved.");
        return;
      }

      router.push(`/restaurant/${restaurantId}`);
    } catch {
      setError("The server could not be reached.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col justify-center px-6 py-16">
        <p className="text-sm text-muted">Zomato Lite</p>
        <h1 className="mt-3 text-2xl tracking-tight">{loadError}</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-12 sm:py-20">
      <Link
        href={`/restaurant/${restaurantId}`}
        className="text-sm text-muted transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        ← Back to restaurant
      </Link>

      <header className="mt-12">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Write a review
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight text-ink">
          {restaurantName ?? "Loading restaurant…"}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="mt-12">
        <fieldset>
          <legend className="text-sm font-medium text-ink">Your rating</legend>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                aria-pressed={rating === value}
                className={`rounded-full p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
                  value <= rating
                    ? "text-accent"
                    : "text-line hover:text-accent/60"
                }`}
              >
                <StarIcon filled={value <= rating} />
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-10">
          <label htmlFor="comment" className="text-sm font-medium text-ink">
            Comment
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={5}
            placeholder="What stood out?"
            className="mt-3 w-full resize-none rounded-xl border border-line bg-white/45 px-4 py-3 text-base leading-relaxed text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
          />
        </div>

        {error && (
          <p
            role="alert"
            aria-live="polite"
            className="mt-6 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-8 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          {isSubmitting ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </main>
  );
}
