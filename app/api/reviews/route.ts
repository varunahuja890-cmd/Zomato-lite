import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Request body must be a JSON object." },
      { status: 400 }
    );
  }

  const { restaurantId, rating, comment } = body as {
    restaurantId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  if (!Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5) {
    return NextResponse.json(
      { error: "Rating must be a whole number between 1 and 5." },
      { status: 400 }
    );
  }

  if (typeof comment !== "string" || comment.trim().length === 0) {
    return NextResponse.json(
      { error: "Comment cannot be empty." },
      { status: 400 }
    );
  }

  try {
    const sql = getDatabase();

    if (!Number.isInteger(restaurantId)) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 400 }
      );
    }

    const restaurants = (await sql`
      SELECT id
      FROM restaurants
      WHERE id = ${restaurantId}
    `) as { id: number }[];

    if (restaurants.length === 0) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 400 }
      );
    }

    const reviews = (await sql`
      INSERT INTO reviews (restaurant_id, rating, comment)
      VALUES (${restaurantId}, ${rating}, ${comment.trim()})
      RETURNING id
    `) as { id: number }[];

    return NextResponse.json(
      { success: true, reviewId: reviews[0].id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "The review could not be saved right now." },
      { status: 500 }
    );
  }
}
