import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

type ReviewRow = {
  id: number;
  rating: number;
  comment: string;
  created_at: string | Date;
};

function toReview(row: ReviewRow) {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId) || restaurantId < 1) {
    return NextResponse.json(
      { error: "Restaurant not found." },
      { status: 404 }
    );
  }

  try {
    const sql = getDatabase();

    const restaurants = (await sql`
      SELECT id, name, cuisine, area
      FROM restaurants
      WHERE id = ${restaurantId}
    `) as { id: number; name: string; cuisine: string; area: string }[];

    if (restaurants.length === 0) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 404 }
      );
    }

    const [restaurant] = restaurants;

    const stats = (await sql`
      SELECT
        ROUND(AVG(rating)::numeric, 1)::float AS average_rating,
        COUNT(*)::int AS total_reviews
      FROM reviews
      WHERE restaurant_id = ${restaurantId}
    `) as { average_rating: number | null; total_reviews: number }[];

    const reviews = (await sql`
      SELECT id, rating, comment, created_at
      FROM reviews
      WHERE restaurant_id = ${restaurantId}
      ORDER BY created_at DESC, id DESC
    `) as ReviewRow[];

    const latest = reviews[0] ?? null;
    const olderReviews = reviews.slice(1);

    return NextResponse.json({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      area: restaurant.area,
      averageRating: stats[0].average_rating,
      totalReviews: stats[0].total_reviews,
      latestReview: latest ? toReview(latest) : null,
      reviews: olderReviews.map(toReview),
    });
  } catch {
    return NextResponse.json(
      { error: "The restaurant could not be loaded right now." },
      { status: 500 }
    );
  }
}
