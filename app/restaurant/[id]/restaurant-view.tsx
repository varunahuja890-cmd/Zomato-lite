"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type Restaurant = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function ReviewBody({ review }: { review: Review }) {
  return (
    <>
      <p className="text-sm font-medium text-accent">{review.rating} / 5</p>
      <p className="mt-2 text-base leading-relaxed text-ink">
        {review.comment}
      </p>
      <time
        dateTime={review.createdAt}
        className="mt-3 block text-xs text-muted"
      >
        {formatDate(review.createdAt)}
      </time>
    </>
  );
}

export function RestaurantView({ restaurantId }: { restaurantId: string }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          setRestaurant(data);
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
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

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col justify-center px-6 py-16">
        <p className="text-sm text-muted">Zomato Lite</p>
        <h1 className="mt-3 text-2xl tracking-tight">{error}</h1>
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[560px] items-center px-6 py-16">
        <p className="text-sm text-muted">Loading restaurant…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-12 sm:py-20">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          {restaurant.cuisine} · {restaurant.area}
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight text-ink">
          {restaurant.name}
        </h1>
      </header>

      {restaurant.latestReview ? (
        <>
          <section className="mt-12 flex items-end gap-4">
            {/* Printed exactly as the API sent it. No calculation happens here. */}
            <p className="text-7xl font-medium leading-none tracking-tighter text-ink">
              {restaurant.averageRating}
            </p>
            <p className="pb-2 text-sm text-muted">
              {restaurant.totalReviews}{" "}
              {restaurant.totalReviews === 1 ? "review" : "reviews"}
            </p>
          </section>

          <section className="mt-12">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Latest review
            </p>
            <article className="mt-3 rounded-xl border border-line border-l-2 border-l-accent bg-white/45 p-6">
              <ReviewBody review={restaurant.latestReview} />
            </article>
          </section>

          {restaurant.reviews.length > 0 && (
            <section className="mt-12">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                Earlier reviews
              </p>
              <ul className="mt-3 divide-y divide-line">
                {restaurant.reviews.map((review) => (
                  <li key={review.id} className="py-5">
                    <ReviewBody review={review} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Link
            href={`/review/${restaurantId}`}
            className="mt-12 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Write a review
          </Link>
        </>
      ) : (
        <section className="mt-14 rounded-xl border border-line bg-white/45 p-8">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
            No reviews yet
          </p>
          <h2 className="mt-3 text-2xl font-medium tracking-tight text-ink">
            Be the first to review {restaurant.name}.
          </h2>
          <Link
            href={`/review/${restaurantId}`}
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Write the first review
          </Link>
        </section>
      )}
    </main>
  );
}
